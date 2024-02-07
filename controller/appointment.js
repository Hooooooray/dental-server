import express from 'express';
import {checkSchema, validationResult} from 'express-validator';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/appointment/add', checkSchema({}), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.fail(errors.array());
    }
    try {
        const newAppointment = await prisma.Appointment.create({
            data: {...req.body},
        });
        res.success(newAppointment);
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.fail('Failed to add the appointment.');
    }
});

// 查询指定时间区间的预约列表
router.get('/appointments', async (req, res) => {
    try {
        const {startTime, endTime} = req.query;
        const where = {}
        if (startTime && endTime) {
            const startDate = new Date(startTime);
            const endDate = new Date(endTime);
            where.appointmentTime = {
                gte: startDate,
                lte: endDate,
            }
        }
        // 查询指定时间区间的预约列表
        const appointments = await prisma.Appointment.findMany({
            where
        });


        const enumMap = {
            AppointmentStatus: {
                PENDING: '待处理',
                CONFIRMED: '已确认',
                CANCELLED: '已取消',
                COMPLETED: '已完成',
            },
        };

        appointments.forEach((appointment) => {
            appointment.status = enumMap.AppointmentStatus[appointment.status]
        })

        res.success(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.fail('查询预约列表失败');
    }
});


export default router;
