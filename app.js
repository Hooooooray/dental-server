import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors'
import patient from "./controller/patient.js";
import employee from "./controller/employee.js";
import permission from "./controller/permission.js"
import user from "./controller/user.js"
import role from "./controller/role.js"

const app = express()

app.use(cors());
app.use(express.json())


// 处理成功和失败响应
app.use((req, res, next) => {
    res.success = (data) => {
        res.status(200).json({ success: true, data });
    };
    res.fail = (message) => {
        res.status(400).json({ success: false, error: message });
    };
    next()
})

// 验证JWT令牌  
const whiteList = [
    '/login',
    '/reg',
    '/sendcode'
];
function verifyToken(req, res, next) {

    if (whiteList.includes(req.path)) {
        return next();
    }
    const secretKey = 'Hooray'; // 替换为你的密钥  
    const token = req.headers['authorization'];
    // if (!token) return res.sendStatus(401);
    if(!token){
        return res.sendStatus(401);
    }
    jwt.verify(token.split(' ')[1], secretKey, (err, _res) => {
        console.log('err', err)
        if (err) return res.sendStatus(403);
        req.user = res.user;
        next();
    });
}

app.use(verifyToken,patient)
app.use(verifyToken,employee)
app.use(verifyToken,permission)
app.use(verifyToken,role)
app.use(user)

const PORT = 3006
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});