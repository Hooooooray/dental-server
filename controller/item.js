import express from 'express';
import {checkSchema, validationResult} from 'express-validator';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// 添加物品
router.post('/item/add', checkSchema({
    name: { notEmpty: true, errorMessage: '物品名称不能为空' },
    categoryId: { notEmpty: true, isNumeric: true, errorMessage: '分类ID不能为空且必须为数字' },
}), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.fail(errors.array());
    }
    try {
        const newItem = await prisma.Item.create({
            data: { ...req.body },
        });
        res.success(newItem);
    } catch (error) {
        console.error('Error adding item:', error);
        res.fail('添加物品失败');
    }
});

// 删除物品
router.post('/item/delete', checkSchema({
    id: { notEmpty: true, errorMessage: '物品ID不能为空' },
}), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.fail(errors.array());
    }
    try {
        const { id } = req.body;
        await prisma.Item.delete({
            where: { id: Number(id) },
        });
        res.success("物品删除成功");
    } catch (error) {
        console.error('Error deleting item:', error);
        res.fail('删除物品失败');
    }
});


// 修改物品
router.post('/item/edit', checkSchema({
    id: { notEmpty: true, errorMessage: '物品ID不能为空' },
}), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.fail(errors.array());
    }
    try {
        const { id, ...data } = req.body;
        const updatedItem = await prisma.Item.update({
            where: { id: Number(id) },
            data,
        });
        res.success(updatedItem);
    } catch (error) {
        console.error('Error updating item:', error);
        res.fail('修改物品失败');
    }
});

// 查询物品列表
// router.get('/items', async (req, res) => {
//     try {
//         const items = await prisma.Item.findMany();
//         res.success(items);
//     } catch (error) {
//         console.error('Error fetching items:', error);
//         res.fail('查询物品列表失败');
//     }
// });
// 查询物品列表
router.get('/items', async (req, res) => {
    const { categoryId } = req.query;

    try {
        // 查询所有子分类ID（如果categoryId存在）
        let categoryIds = [];
        if (categoryId) {
            categoryIds = await getSubcategoryIds(Number(categoryId)); // 假设这是一个递归查询子类ID的函数
        }

        // 构建查询条件
        let where = {};
        if (categoryId) {
            where.categoryId = { in: categoryIds };
        }

        const items = await prisma.Item.findMany({
            where: where
        });

        res.success(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        res.fail('查询物品列表失败');
    }
});

// 假设的递归查询函数
async function getSubcategoryIds(parentId) {
    const categories = await prisma.Category.findMany({
        where: { parentId: parentId },
        select: { id: true }
    });
    let ids = [parentId];
    for (const category of categories) {
        const subIds = await getSubcategoryIds(category.id); // 递归查询子类ID
        ids = ids.concat(subIds);
    }
    return ids;
}


export default router;

