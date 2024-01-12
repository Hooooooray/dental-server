import express from 'express';
import { checkSchema, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const secretKey = 'Hooray';
const prisma = new PrismaClient();
const router = express.Router();

router.post('/findByEmployee', async (req, res) => {
    const { employeeId } = req.body;

    try {
        const user = await prisma.User.findFirst({
            where: {
                employeeId: Number(employeeId),
            },
        });

        if (user) {
            res.status(200).json({ success: true, data: user })
        } else {
            res.status(200).json({ success: false,data:"不存在具有该员工ID的用户" })
        }
    } catch (error) {
        console.error('Error checking for user with employeeId:', error);
        res.fail('查询失败');
    }
});

router.post('/user/edit', checkSchema({
    id: { notEmpty: true, errorMessage: '用户id不能为空' },
}), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.fail(errors.array());
    }
    try {
        const { id, ...otherFields } = req.body;
        const updatedUser = await prisma.User.update({
            where: { id: Number(id) },
            data: { ...otherFields },
        });
        res.success("编辑成功");
    } catch (error) {
        console.error('Error updating user:', error);
        res.fail('Failed to edit the user.');
    }
});



router.post('/register', checkSchema({
    username: { notEmpty: true, errorMessage: '账户名不能为空' },
    password: { notEmpty: true, errorMessage: '密码不能为空' }
}), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.fail(errors.array());
    }
    try {
        const newUser = await prisma.User.create({
            data: { ...req.body },
        });
        res.success(newUser);
    } catch (error) {
        res.fail('注册失败');
    }
})

router.post('/login', checkSchema({
    username: { notEmpty: true, errorMessage: '账户名不能为空' },
    password: { notEmpty: true, errorMessage: '密码不能为空' }
}), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.fail(errors.array());
    }
    try {
        const { username, password } = req.body
        const user = await prisma.User.findFirst({
            where: { username },
        });
        console.log(user)
        if (user.password === password) {
            const token = jwt.sign(user, secretKey, { expiresIn: '48h' });
            console.log(token)
            res.success({
                token: token,
                // roleId:user.roleId
            });
        }

    } catch (error) {
        console.error('Error login', error);
        res.fail('Failed to login');
    }
})

router.post('/verifyRole', async (req, res) => {
    const token = req.headers['authorization'];
    jwt.verify(token.split(' ')[1], secretKey, async (err, decoded) => {
        if (err) return res.sendStatus(403);
        const roleId = decoded.roleId
        try {
            const role = await prisma.Role.findFirst({
                where: { id: Number(roleId) },
            });
            res.success(role);
        } catch (error) {
            console.error('Error fetching role by ID:', error);
            res.fail('认证失败');
        }
    });
})

router.post('/verifyUser', async (req, res) => {
    const token = req.headers['authorization']
    jwt.verify(token.split(' ')[1], secretKey, async (err, decoded) => {
        if (err) return res.sendStatus(403);
        const userId = decoded.id
        try {
            const user = await prisma.User.findFirst({
                where: { id: Number(userId) },
            });
            res.success(user);
        } catch (error) {
            console.error('Error fetching user by ID:', error);
            res.fail('认证失败');
        }
    });
})

router.post('')

export default router;