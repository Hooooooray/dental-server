import express from 'express';
import {checkSchema, validationResult} from 'express-validator'
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient()

const router = express.Router()

// 在你的路由处理程序中
router.get('/permissions', async (req, res) => {
    try {
        const permissions = await prisma.Permission.findMany({
            where: { parentId: null }, // 获取顶级权限
            include: { children: { include: { children: {} } } }, // 递归地获取子权限
        });
        res.success(permissions);
    } catch (error) {
        console.error(error);
        res.fail('查询权限列表失败');
    }
});


export default router