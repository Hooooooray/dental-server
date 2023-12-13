import express from 'express';
import {checkSchema, validationResult} from 'express-validator'
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient()

const router = express.Router()

// 新增患者
router.post('/patient/add', checkSchema({
    institution: {notEmpty: true, errorMessage: '患者所属机构不能为空'},
    patientType: {notEmpty: true, errorMessage: '患者类型不能为空'},
    customerID: {notEmpty: true, errorMessage: '客户号不能为空'},
    name: {notEmpty: true, errorMessage: '患者姓名不能为空'},
    consultationProject: {notEmpty: true, errorMessage: '咨询项目不能为空'},
    acceptancePerson: {notEmpty: true, errorMessage: '受理人不能为空'},
}), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.fail(errors.array());
    }
    try {
        const {
            institution,
            patientType,
            customerID,
            name,
            consultationProject,
            acceptancePerson,
            ...otherFields
        } = req.body;
        const newPatient = await prisma.Patient.create({
            data: {
                institution,
                patientType,
                customerID,
                name,
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
        const {id, ...otherFields} = req.body;
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

// 根据id查询患者
router.post('/patient/select', checkSchema({
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
            where:{
                id
            }
        })
        res.success(patient)
    } catch (error) {
        console.error('Error fetching patient by id:', error);
        res.fail('查询患者失败');
    }
})

router.get('/patients', async (req, res) => {
    try {
        let {page = 1, pageSize = 10} = req.query;
        page = page ? Number(page) : 1;
        pageSize = pageSize ? Number(pageSize) : 10;
        console.log(page, pageSize)
        const patients = await prisma.Patient.findMany({
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
        res.success(patients);
    } catch (error) {
        console.error('Error fetching patients by page and pageSize:', error);
        res.fail('查询患者列表失败');
    }
});

export default router