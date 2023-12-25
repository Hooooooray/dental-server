import express from 'express';
import { checkSchema, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// 新增员工
router.post('/employee/add', checkSchema({
    name: { notEmpty: true, errorMessage: '员工姓名不能为空' },
    position: { notEmpty: true, errorMessage: '员工岗位不能为空' },
    department: { notEmpty: true, errorMessage: '部门不能为空' },
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

        // 定义一个枚举类型的映射表
        const enumMap = {
            EmployeePosition: {
                ADMINISTRATOR: '管理员',
                DOCTOR: '医生',
                NURSE: '护士',
                FRONT_DESK: '前台',
                ADMINISTRATIVE: '行政',
                FINANCE: '财务',
                ASSISTANT: '助理',
                COUNSELOR: '咨询师',
                CUSTOMER_SERVICE: '客服',
                PROCUREMENT: '采购',
                WAREHOUSE_KEEPER: '库管',
            },
            Department: {
                MEDICAL: '医疗部',
                COUNSELING: '咨询部',
                OPERATIONS: '经营部',
                LOGISTICS: '后勤部',
                FINANCE: '财务部',
            },
            DentalDepartment: {
                GENERAL_DENTISTRY: '综合牙科',
                DENTAL_IMPLANTATION: '牙医种植',
                DENTAL_ORTHODONTICS: '牙医正畸',
                DENTAL_RESTORATION: '牙医修复',
                DENTAL_CARE: '牙医护理',
                CHILDRENS_TEETH: '儿童牙科',
                PERIODONTAL: '牙周科',
                ORTHODONTICS: '矫正科',
                TOOTH_EXTRACTION: '牙齿拔除',
                TOOTH_INLAY: '牙齿镶嵌',
            },
            EmploymentStatus: {
                ACTIVE: '在职',
                ON_LEAVE: '休假',
                PROBATION: '试用期',
                RESIGNED: '离职',
            },
            Gender: {
                MALE: '男',
                FEMALE: '女',
                UNKNOWN: '未知'
            }
        };

        // 遍历员工列表，将枚举字段换成相应的中文
        employees.forEach((employee) => {
            // 岗位
            employee.position = enumMap.EmployeePosition[employee.position];
            // 部门
            employee.department = enumMap.Department[employee.department];
            // 牙医科室
            employee.dentalDepartment = enumMap.DentalDepartment[employee.dentalDepartment];
            // 在职状态
            employee.employmentStatus = enumMap.EmploymentStatus[employee.employmentStatus];
            // 性别
            employee.gender = enumMap.Gender[employee.gender]
        });
        res.success(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.fail('查询员工列表失败');
    }
});

// 查询员工号最大值
router.get('/employee/maxID', async (req, res) => {
    try {
        const id = await prisma.Employee.findFirst({
            select: {
                employeeID: true,
            },
            orderBy: { employeeID: 'desc' },
        });
        res.success(id);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.fail('查询员工失败');
    }
})

export default router;
