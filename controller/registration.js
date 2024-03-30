import express from 'express';
import {checkSchema, validationResult} from 'express-validator';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();


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

export default router;