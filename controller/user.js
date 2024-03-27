import express from 'express';
import { checkSchema, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { exec } from 'child_process';

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
            // console.log(token)
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



// 验证码
let formattedNumber = {} //存储已发送手机号码对应的验证码
const sentPhoneNumbers = {}; // 存储已发送手机号码和时间戳的对象
const minRequestInterval = 60 * 1000; // 60秒

// 短信验证码发送
router.post('/sms', (req, res) => {
    // 获取当前时间戳
    const currentTime = Date.now();
    // 获取传参中的电话号码
    const phoneNumber = req.body.phoneNumber;

    // 验证号码格式，并发送短信
    const phoneRegex = /^[1-9][0-9]{10}$/;
    if (phoneRegex.test(phoneNumber)) {
        // 检查手机号码是否在已发送的记录中，并检查时间间隔
        if (currentTime - sentPhoneNumbers[phoneNumber] < minRequestInterval) {
            res.status(429).json({message: '请求过于频繁，请稍后再试', statusCode: 429});
        } else {
            formattedNumber[phoneNumber] = ("00000" + Math.floor(Math.random() * 1000000)).slice(-6);
            exec('node ./src/sms-server/client.cjs ' + phoneNumber + ' ' + formattedNumber[phoneNumber], (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing TypeScript: ${error}`);
                    res.status(500).json({message: '内部服务器错误', statusCode: 500});
                } else {
                    // 记录当前时间戳
                    sentPhoneNumbers[phoneNumber] = currentTime;
                    console.log(`TypeScript output: ${stdout}`);
                    res.status(200).json({message: 'OK', statusCode: 200});
                }
            });
        }
    } else {
        res.status(400).json({message: '手机号码格式不正确', statusCode: 400});
    }
})

router.post('/smsLogin', checkSchema({
    phoneNumber: { notEmpty: true, errorMessage: '手机号码不能为空' },
    code: { notEmpty: true, errorMessage: '验证码不能为空' }
}), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.fail(errors.array());
    }
    try {
        const { phoneNumber, code } = req.body
        const user = await prisma.User.findFirst({
            where: { phone:phoneNumber },
        });
        console.log(user)
        if (code === formattedNumber[phoneNumber]) {
            const token = jwt.sign(user, secretKey, { expiresIn: '48h' });
            console.log(token)
            res.success({
                token: token,
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
    if(!token){
        return res.sendStatus(401)
    }
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