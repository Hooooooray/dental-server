import express from 'express';
import {checkSchema, validationResult} from 'express-validator';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// 挂号列表
router.get('/registrations', async (req, res) => {
    try {
        let page = req.query.page || 1;
        let pageSize = req.query.pageSize || 10;
        page = parseInt(page)
        pageSize = parseInt(pageSize)
        const {startTime, endTime, visitingType, status, patientQuery, doctorQuery} = req.query;
        const where = {}
        if (visitingType) {
            where.visitingType = visitingType
        }
        if (status) {
            where.status = status
        }
        if (startTime && endTime) {
            const startDate = new Date(startTime);
            const endDate = new Date(endTime);
            where.createdAt = {
                gte: startDate,
                lte: endDate,
            }
        }
        // 添加模糊匹配逻辑
        let patientOrDoctorConditions = [];
        if (patientQuery) {
            const patientCondition = {
                OR: [
                    {patient: {name: {contains: patientQuery}}},
                    {patient: {id: parseInt(patientQuery) || 0}} // 假设 patientQuery 可以是ID
                ]
            };
            patientOrDoctorConditions.push(patientCondition);
        }
        if (doctorQuery) {
            const doctorCondition = {
                OR: [
                    {employee: {name: {contains: doctorQuery}}},
                    {employee: {id: parseInt(doctorQuery) || 0}} // 假设 doctorQuery 可以是ID
                ]
            };
            patientOrDoctorConditions.push(doctorCondition);
        }
        if (patientOrDoctorConditions.length > 0) {
            where.AND = patientOrDoctorConditions;
        }
        const registrations = await prisma.Registration.findMany({
            skip: (page - 1) * pageSize,
            take: pageSize,
            where: where,
            include: {
                patient: {
                    select: {
                        name: true,
                        gender: true,
                        age: true,
                    }
                },
                employee: {
                    select: {
                        name: true,
                    }
                }
            }
        });
        const total = await prisma.Registration.count({where: where});
        const enumMap = {
            Gender: {
                MALE: '男',
                FEMALE: '女',
                UNKNOWN: '未知'
            },
            Status: {
                'REGISTERED': '已挂号',
                'VISITED': '已就诊',
                'CANCELLED': '已取消'
            },
            VisitingType: {
                'FIRST_VISIT': '初诊',
                'FOLLOW_UP': '复诊',
                'RE_EXAMINATION': '复查',
                'CONSULTATION': '咨询'
            }
        };
        registrations.forEach(registration => {
            if (registration.patient) {
                registration.patient.gender = enumMap.Gender[registration.patient.gender]
            }
            if (registration.status) {
                registration.status = enumMap.Status[registration.status]
            }
            if (registration.visitingType) {
                registration.visitingType = enumMap.VisitingType[registration.visitingType]
            }
        })
        const response = {
            success: true,
            total,
            data: registrations,
        };
        res.status(200).json(response)
    } catch (error) {
        console.error('Error fetching registrations by page and pageSize:', error);
        res.fail('查询挂号列表失败');
    }
});

// 新增挂号
router.post('/registration/add', checkSchema({
    patientId: {notEmpty: true, errorMessage: '患者id不能为空'},
    employeeId: {notEmpty: true, errorMessage: '员工id不能为空'},
    visitingType: {notEmpty: true, errorMessage: '就诊类型不能为空'},
}), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.fail(errors.array());
    }
    try {
        const newRegistration = await prisma.Registration.create({
            data: {...req.body},
        });
        res.success(newRegistration);
    } catch (error) {
        console.error('Error creating role:', error);
        res.fail('Failed to add the role.');
    }
});

// 编辑挂号
router.post('/registration/edit', checkSchema({
    id: {notEmpty: true, errorMessage: '挂号id不能为空'},
}), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.fail(errors.array());
    }
    try {
        let {id, ...otherFields} = req.body;
        const newRegistration = await prisma.Registration.update({
            where: {
                id
            },
            data: {
                ...otherFields, // Include other fields from the request body
            },
        });
        res.success("编辑成功");
    } catch (error) {
        console.error('Error creating patient:', error);
        res.fail('Failed to edit the patient.');
    }
})

router.get('/registration/maxID', async (req, res) => {
    try {
        const id = await prisma.Registration.findFirst({
            select: {
                id: true,
            },
            orderBy: {id: 'desc'},
        });
        res.success(id);
    } catch (error) {
        console.error('Error fetching Registration:', error);
        res.fail('查询挂号id失败');
    }
})

export default router;