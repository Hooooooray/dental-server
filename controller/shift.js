import express from 'express';
import { checkSchema, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// 新增班次
router.post('/shift/add', checkSchema({
    name: { notEmpty: true, errorMessage: '班次名称不能为空' },
    startTime: { notEmpty: true, errorMessage: '开始时间不能为空' },
    endTime: { notEmpty: true, errorMessage: '结束时间不能为空' },
}), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.fail(errors.array());
    }
    try {
        const newShift = await prisma.Shift.create({
            data: { ...req.body },
        });
        res.success(newShift);
    } catch (error) {
        console.error('Error creating', error);
        res.fail('Failed to add');
    }
});


// 编辑班次信息
router.post('/shift/edit', checkSchema({
    id: { notEmpty: true, errorMessage: '班次id不能为空' },
}), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.fail(errors.array());
    }
    try {
        let { id, ...otherFields } = req.body;
        await prisma.Shift.update({
            where: {
                id
            },
            data: {
                ...otherFields,
            },
        });
        res.success("编辑成功");
    } catch (error) {
        console.error('Error creating', error);
        res.fail('Failed to edit');
    }
})

//删除患者
router.post('/shift/delete', checkSchema({
    id: { notEmpty: true, errorMessage: '班次id不能为空' },
}), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.fail(errors.array());
    }
    try {
        const { id } = req.body;
        await prisma.Shift.delete({
            where: {
                id
            },
        });
        res.success("删除成功");
    } catch (error) {
        console.error('Error creating', error);
        res.fail('Failed to delete');
    }
})

// 查询班次列表
router.get('/shifts', async (req, res) => {
    try {
        const shifts = await prisma.Shift.findMany({

        });
        const response = {
            success: true,
            data: shifts,
        };
        res.status(200).json(response)
    } catch (error) {
        console.error('Error fetching', error);
        res.fail('查询班次列表失败');
    }
});

export default router;