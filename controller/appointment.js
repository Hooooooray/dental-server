import express from 'express';
import { checkSchema, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/appointment/add', checkSchema({
    
}), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.fail(errors.array());
    }
    
    try {
        const newAppointment = await prisma.Appointment.create({
            data: { ...req.body },
        });
        res.success(newAppointment);
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.fail('Failed to add the appointment.');
    }
});

export default router;