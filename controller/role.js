import express from 'express';
import { checkSchema, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// 新增员工角色
router.post('/role/add', checkSchema({
    roleName: { notEmpty: true, errorMessage: '员工类型名字不能为空' },
}), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.fail(errors.array());
    }
    try {
        const newRole = await prisma.Role.create({
            data: { ...req.body },
        });
        res.success(newRole);
    } catch (error) {
        console.error('Error creating role:', error);
        res.fail('Failed to add the role.');
    }
});

// 根据ID查询角色
router.get('/role', checkSchema({
    id: { notEmpty: true, errorMessage: '角色ID不能为空' },
}), async (req, res) => {
    try {
        const { id } = req.query;
        const role = await prisma.Role.findFirst({
            where: { id: Number(id) },
        });
        res.success(role);
    } catch (error) {
        console.error('Error fetching role by ID:', error);
        res.fail('查询角色失败');
    }
});

// 查询员工类型列表
router.get('/roles', async (req, res) => {
    try {
        let page = req.query.page || 1;
        let pageSize = req.query.pageSize || 20;
        page = parseInt(page)
        pageSize = parseInt(pageSize)
        const roles = await prisma.Role.findMany({
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
        // 定义一个枚举类型的映射表
        const enumMap = {
            RoleType: {
                SYSTEM: '系统角色',
                CUSTOM: '自定义角色',
            }
        };
        roles.forEach(role => {
            role.roleType = enumMap.RoleType[role.roleType]
        })
        const total = await prisma.Role.count();
        const response = {
            success: true,
            total,
            data: roles,

        };
        res.status(200).json(response)
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.fail('查询角色列表失败');
    }
});

// 删除员工角色
router.post('/role/delete', checkSchema({
    id: { notEmpty: true, errorMessage: '角色ID不能为空' },
}), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.fail(errors.array());
    }
    try {
        const { id } = req.body;
        await prisma.Role.delete({
            where: { id: Number(id) },
        });
        res.success("删除成功");
    } catch (error) {
        console.error('Error deleting role:', error);
        res.fail('Failed to delete the role.');
    }
});

export default router;