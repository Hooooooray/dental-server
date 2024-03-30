import express from 'express';
import {checkSchema, validationResult} from 'express-validator'
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient()

const router = express.Router()

// 新增患者
router.post('/patient/add', checkSchema({
    id: {notEmpty: true, errorMessage: '客户号不能为空'},
    name: {notEmpty: true, errorMessage: '患者姓名不能为空'},
    patientType: {notEmpty: true, errorMessage: '患者类型不能为空'},
    consultationProject: {notEmpty: true, errorMessage: '咨询项目不能为空'},
    acceptancePerson: {notEmpty: true, errorMessage: '受理人不能为空'},
}), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.fail(errors.array());
    }
    try {
        const {
            id,
            name,
            patientType,
            consultationProject,
            acceptancePerson,
            ...otherFields
        } = req.body;
        const newPatient = await prisma.Patient.create({
            data: {
                id,
                name,
                patientType,
                consultationProject,
                acceptancePerson,
                ...otherFields, // Include other fields from the request body
            },
        });
        res.success(newPatient);
    } catch (error) {
        console.error('Error creating patient:', error);
        res.fail('Failed to add the patient.');
    }
})

// 编辑患者
router.post('/patient/edit', checkSchema({
    id: {notEmpty: true, errorMessage: '患者id不能为空'},
}), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.fail(errors.array());
    }
    try {
        req.prisma = prisma
        let {id, ...otherFields} = req.body;
        // avatar = Buffer.from(avatar)
        // console.log(avatar,'base64')

        const newPatient = await prisma.Patient.update({
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

//删除患者
router.post('/patient/delete', checkSchema({
    id: {notEmpty: true, errorMessage: '患者id不能为空'},
}), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.fail(errors.array());
    }
    try {
        req.prisma = prisma
        const {id} = req.body;
        const newPatient = await prisma.Patient.delete({
            where: {
                id
            },
        });
        res.success("删除成功");
    } catch (error) {
        console.error('Error creating patient:', error);
        res.fail('Failed to delete the patient.');
    }
})

router.get('/patient', checkSchema({
    id: {notEmpty: true, errorMessage: "患者id不能为空"}
}), async (req, res) => {
    try {
        let {id} = req.query;
        id = Number(id)
        const patient = await prisma.Patient.findFirst({
            where: {
                id
            }
        })
        if (patient.avatar) {
            patient.avatar = patient.avatar.toString('base64')
        }
        res.success(patient)
    } catch (error) {
        console.error('Error fetching patient by id:', error);
        res.fail('查询患者失败');
    }
})

router.get('/searchPatients', async (req, res) => {
    try {
        const {keyword} = req.query

        // 构建搜索条件
        let searchConditions = [];
        if (keyword) {
            searchConditions.push({name: {contains: keyword}});
            searchConditions.push({phone: {contains: keyword}});
            // 尝试将 keyword 转换为数字，以便于搜索 id
            const keywordAsNumber = parseInt(keyword, 10);
            if (!isNaN(keywordAsNumber)) {
                searchConditions.push({id: keywordAsNumber});
            }
        }

        const patients = await prisma.Patient.findMany({
            where: {
                OR: searchConditions
            },
            select: {
                id: true,
                name: true,
                avatar: true,
                gender: true,
                patientNotes: true,
                phone: true,
            }
        });

        patients.forEach((patient) => {
            if (patient.avatar) {
                patient.avatar = patient.avatar.toString('base64')
            }
        })

        res.success(patients)
    } catch (error) {
        console.log(error)
        res.fail('搜索患者失败');
    }
})

router.get('/patients', async (req, res) => {
    try {
        let {id, name, phone, idCardNo, isTodayOnly, sortColumn, sortOrder} = req.query;
        id = Number(id)
        let page = req.query.page || 1;
        let pageSize = req.query.pageSize || 10;
        page = parseInt(page)
        pageSize = parseInt(pageSize)
        console.log(sortColumn, sortOrder)
        let where = {};
        if (id) where.id = id;
        if (name) where.name = {contains: name};
        if (phone) where.phone = {contains: phone};
        if (idCardNo) where.idCardNo = {contains: idCardNo}
        if (isTodayOnly === 'true') {
            const today = new Date();
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0, 0, -1);
            where.createdAt = {
                gte: todayStart,
                lte: todayEnd
            };
        }
        let orderBy = {};
        if (sortColumn && (sortOrder === 'ascend' || sortOrder === 'descend')) {
            orderBy[sortColumn] = sortOrder === 'ascend' ? 'asc' : 'desc';
        }
        const patients = await prisma.Patient.findMany({
            skip: (page - 1) * pageSize,
            take: pageSize,
            where: where,
            orderBy: orderBy
        });
        const total = await prisma.patient.count({where: where});
        const enumMap = {
            Gender: {
                MALE: '男',
                FEMALE: '女',
                UNKNOWN: '未知'
            },
            ReferrerType: {
                PATIENT: '患者介绍',
                EMPLOYEE: '员工介绍'
            },
            PatientType: {
                TEMPORARY: '临时',
                ORDINARY: '普通',
                DENTAL_IMPLANTATION: '牙医种植',
                DENTAL_ORTHODONTICS: '牙医正畸',
                DENTAL_RESTORATION: '牙医修复',
                DENTAL_CARE: '牙医护理',
                CHILDRENS_TEETH: '儿童牙齿',
                INFORMATION: '资讯',
                TOOTH_EXTRACTION: '拔牙',
                TOOTH_INLAY: '镶牙',
                PERIODONTAL: '牙周',
                ORTHODONTICS: '矫正',
                IMPLANTATION: '种植'
            },
            PhoneType: {
                SELF: '本人',
                FAMILY: '家属',
                FRIEND: '朋友',
                OTHER: '其他'
            },
            ConsultationProject: {
                TOOTH_EXTRACTION: '拔牙',
                TOOTH_FILLING: '补牙',
                TOOTH_IMPLANTATION: '种牙',
                TOOTH_INLAY: '镶牙',
                ORTHODONTICS: '正畸',
                TEETH_CLEANING: '洗牙'
            }
        };
        patients.forEach((patient) => {
            patient.gender = enumMap.Gender[patient.gender]
            patient.referrerType = enumMap.ReferrerType[patient.referrerType]
            patient.patientType = enumMap.PatientType[patient.patientType]
            patient.phoneType = enumMap.PatientType[patient.phoneType]
            patient.consultationProject = enumMap.ConsultationProject[patient.consultationProject]
            if (patient.avatar) {
                patient.avatar = patient.avatar.toString('base64')
            }
        })

        const response = {
            success: true,
            total,
            data: patients,
        };
        res.status(200).json(response)
    } catch (error) {
        console.error('Error fetching patients by page and pageSize:', error);
        res.fail('查询患者列表失败');
    }
});

// 查询员工号最大值
router.get('/patient/maxID', async (req, res) => {
    try {
        const id = await prisma.Patient.findFirst({
            select: {
                id: true,
            },
            orderBy: {id: 'desc'},
        });
        res.success(id);
    } catch (error) {
        console.error('Error fetching Patient:', error);
        res.fail('查询员工失败');
    }
})

export default router