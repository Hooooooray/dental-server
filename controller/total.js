import express from 'express';
import {checkSchema, validationResult} from 'express-validator';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/total', async (req, res) => {
    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const totalPatient = await prisma.patient.count({
            where: {
                createdAt: {
                    gte: today,
                    lt: tomorrow
                }
            }
        });
        const totalAppointment = await prisma.appointment.count({
            where: {
                createdAt: {
                    gte: today,
                    lt: tomorrow
                }
            }
        });
        const totalRegistration = await prisma.registration.count({
            where: {
                createdAt: {
                    gte: today,
                    lt: tomorrow
                }
            }
        });
        res.success({
            totalPatient, totalAppointment, totalRegistration
        })
    } catch (e) {
        console.error('Error fetching total:', e);
        res.fail('查询总数失败');
    }
})

export default router;