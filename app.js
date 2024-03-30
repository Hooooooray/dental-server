import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors'
import patient from "./controller/patient.js";
import employee from "./controller/employee.js";
import permission from "./controller/permission.js"
import user from "./controller/user.js"
import role from "./controller/role.js"
import bodyParser from 'body-parser';
import appointment from './controller/appointment.js'
import shift from './controller/shift.js'
import doctorShift from "./controller/doctorShift.js";
import registration from "./controller/registration.js";

const app = express()

// 允许最大为 50mb 的请求体
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
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
app.use(user)
app.use(permission)
app.use(appointment)

app.use(shift)
app.use(doctorShift)
app.use(registration)

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
        if (err) return res.sendStatus(403);
        req.user = res.user;
        next();
    });
}
app.use(verifyToken,patient)
app.use(verifyToken,employee)
app.use(verifyToken,role)


const PORT = 3006
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});