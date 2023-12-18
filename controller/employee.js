import express from 'express';
import { checkSchema, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// 新增员工
router.post('/employee/add', checkSchema({
    name: { notEmpty: true, errorMessage: '员工姓名不能为空' },
    position: { notEmpty: true, errorMessage: '员工岗位不能为空' },
    department:{notEmpty:true,errorMessage:'部门不能为空'},
    dentalDepartment: { notEmpty: true, errorMessage: '牙医科室不能为空' },
    gender: { notEmpty: true, errorMessage: '性别不能为空' },
}), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.fail(errors.array());
    }
    try {
        const newEmployee = await prisma.Employee.create({
            data: { ...req.body },
        });
        res.success(newEmployee);
    } catch (error) {
        console.error('Error creating employee:', error);
        res.fail('Failed to add the employee.');
    }
});

// 编辑员工
router.post('/employee/edit', checkSchema({
    employeeID: { notEmpty: true, errorMessage: '员工ID不能为空' },
}), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.fail(errors.array());
    }
    try {
        const { employeeID, ...otherFields } = req.body;
        const updatedEmployee = await prisma.Employee.update({
            where: { employeeID: Number(employeeID) },
            data: { ...otherFields },
        });
        res.success("编辑成功");
    } catch (error) {
        console.error('Error updating employee:', error);
        res.fail('Failed to edit the employee.');
    }
});

// 删除员工
router.post('/employee/delete', checkSchema({
    employeeID: { notEmpty: true, errorMessage: '员工ID不能为空' },
}), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.fail(errors.array());
    }
    try {
        const { employeeID } = req.body;
        await prisma.Employee.delete({
            where: { employeeID: Number(employeeID) },
        });
        res.success("删除成功");
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.fail('Failed to delete the employee.');
    }
});

// 根据ID查询员工
router.get('/employee', checkSchema({
    employeeID: { notEmpty: true, errorMessage: '员工ID不能为空' },
}), async (req, res) => {
    try {
        const { employeeID } = req.query;
        const employee = await prisma.Employee.findFirst({
            where: { employeeID: Number(employeeID) },
        });
        res.success(employee);
    } catch (error) {
        console.error('Error fetching employee by ID:', error);
        res.fail('查询员工失败');
    }
});

// 查询所有员工
router.get('/employees', async (req, res) => {
    try {
        const employees = await prisma.Employee.findMany();
        res.success(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.fail('查询员工列表失败');
    }
});

router.get('/employee/maxID',async (req,res)=>{
    try{
        const id = await prisma.Employee.findFirst({
            select: {
                employeeID: true,
            },
            orderBy: { employeeID: 'desc' },
        });
        res.success(id);
    }catch (error){
        console.error('Error fetching employees:', error);
        res.fail('查询员工失败');
    }
})

export default router;
