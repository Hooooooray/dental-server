import express from 'express';
import {checkSchema, validationResult} from 'express-validator';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/categories', async (req, res) => {
    try {
        // 查询所有顶级分类，其中包含其所有嵌套的子分类
        const categories = await prisma.category.findMany({
            where: {parentId: null}, // 只选择顶级分类
            include: {
                children: {
                    include: {
                        children: true // 递归包含子分类
                    }
                }
            }
        });
        res.success(categories)
    } catch (error) {
        console.error('Error fetching', error);
        res.fail('查询分类列表失败');
    }
});

// 新增分类
router.post('/category/add', checkSchema({
    name: {notEmpty: true, errorMessage: '分类名字不能为空'},
}), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.fail(errors.array());
    }
    try {
        const newCategory = await prisma.category.create({
            data: {...req.body},
        });
        res.success(newCategory);
    } catch (error) {
        console.error('Error creating', error);
        res.fail('Failed to add');
    }
});

router.post('/category/delete', checkSchema({
    id: {notEmpty: true, errorMessage: 'id不能为空'},
}), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.fail(errors.array());
    }
    try {
        const id = parseInt(req.body.id);
        const category = await prisma.category.findUnique({
            where: {id},
        });

        if (!category) {
            res.fail('分类不存在');
            return;
        }

        await prisma.category.delete({
            where: {id},
        });

        res.success('分类删除成功');
    } catch (error) {
        console.error('Error deleting', error);
        res.fail('删除分类失败');
    }
})

export default router;