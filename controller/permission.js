import express from 'express';
import {checkSchema, validationResult} from 'express-validator'
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient()

const router = express.Router()

router.get('/permissions',async(req,res)=>{
    try{
        const permissions = await prisma.Permission.findMany();
        res.success(permissions);
    }catch(error){
        console.error(error)
        res.fail('查询权限列表失败')
    }
})

export default router