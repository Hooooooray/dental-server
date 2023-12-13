import express from 'express';
import jwt from 'jsonwebtoken';
import cors from 'cors'
import patient from "./controller/patient.js";
import employee from "./controller/employee.js";

const app = express()

app.use(cors());
app.use(express.json())


// 处理成功和失败响应
app.use((req,res,next)=>{
    res.success = (data) => {
        res.status(200).json({ success: true, data });
    };
    res.fail = (message) => {
        res.status(400).json({ success: false, error: message });
    };
    next()
})

app.use(patient)
app.use(employee)

const PORT = 3006
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});