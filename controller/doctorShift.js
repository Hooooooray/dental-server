import express from 'express';
import {checkSchema, validationResult} from 'express-validator';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/doctorShift/addOrEdit', async (req, res) => {
    const shifts = req.body;
    try {
// 遍历数组，对每一项进行处理
        await Promise.all(shifts.map(async (shift) => {
            const {employeeId, shiftId, week} = shift;

            // 检查是否存在具有相同employeeId和shiftId的记录
            const existingShift = await prisma.doctorShift.findFirst({
                where: {
                    employeeId: employeeId,
                    shiftId: shiftId,
                }
            });

            if (existingShift) {
                // 如果存在，更新该记录的week字段
                return prisma.doctorShift.update({
                    where: {
                        id: existingShift.id
                    },
                    data: {
                        week
                    }
                });
            } else {
                // 如果不存在，则新增一条记录
                return prisma.doctorShift.create({
                    data: {
                        employeeId: employeeId,
                        shiftId: shiftId,
                        week: week
                    }
                });
            }
        }));

        res.json({success: true, message: '排班数据已成功更新'});
    } catch (error) {
        console.error('Error processing doctor shifts', error);
        res.status(500).json({success: false, message: '处理排班数据时出错'});
    }
})

// 查询医生排班列表
router.get('/doctorShifts', async (req, res) => {
    try {
        const doctorShifts = await prisma.Employee.findMany({
            select: {
                id: true,
                name: true, // 选择Employee的name字段
                dentalDepartment: true, // 选择Employee的dentalDepartment字段
                doctorShifts: { // 关联查询DoctorShift
                    select: {
                        id: true,
                        employeeId: true,
                        shiftId: true,
                        week: true,
                        shift: { // 如果需要，也可以包含班次详细信息
                            select: {
                                id: true,
                                name: true,
                                startTime: true,
                                endTime: true,
                            }
                        }
                    }
                }
            }
        });

        // 定义一个枚举类型的映射表
        const enumMap = {
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
        };

        // 遍历员工列表，将枚举字段换成相应的中文
        doctorShifts.forEach((shift) => {
            shift.dentalDepartment = enumMap.DentalDepartment[shift.dentalDepartment];
        });

        const response = {
            success: true,
            data: doctorShifts,
        };
        res.status(200).json(response)
    } catch (error) {
        console.error('Error fetching', error);
        res.fail('查询列表失败');
    }
});

export default router;