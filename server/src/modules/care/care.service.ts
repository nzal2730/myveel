import prisma from '../../config/db';

export class CareService {
  static async getSchedules(userId: string, vehicleId?: string) {
    const where: any = { userId };
    if (vehicleId) where.vehicleId = vehicleId;

    const schedules = await prisma.careSchedule.findMany({
      where,
      include: {
        vehicle: {
          select: { id: true, nickname: true, make: true, model: true, registrationNumber: true },
        },
      },
      orderBy: [{ isCompleted: 'asc' }, { scheduledDate: 'asc' }],
    });

    const now = new Date();
    return schedules.map((s) => {
      const sDate = new Date(s.scheduledDate);
      const isOverdue = !s.isCompleted && sDate.getTime() < now.getTime();
      return {
        ...s,
        isOverdue,
      };
    });
  }

  static async createSchedule(userId: string, data: any) {
    if (data.vehicleId) {
      const v = await prisma.vehicle.findFirst({
        where: { id: data.vehicleId, userId },
      });
      if (!v) throw new Error('Vehicle not found or unauthorized');
    }

    return prisma.careSchedule.create({
      data: {
        userId,
        vehicleId: data.vehicleId || null,
        title: data.title.trim(),
        careType: data.careType,
        scheduledDate: new Date(data.scheduledDate),
        recurrence: data.recurrence || 'NONE',
        notes: data.notes?.trim() || null,
        isCompleted: false,
      },
    });
  }

  static async completeSchedule(userId: string, id: string) {
    const schedule = await prisma.careSchedule.findFirst({
      where: { id, userId },
    });
    if (!schedule) throw new Error('Task not found or unauthorized');

    const now = new Date();
    const updated = await prisma.careSchedule.update({
      where: { id },
      data: {
        isCompleted: true,
        completedAt: now,
      },
    });

    // If recurring, generate next occurrence
    if (schedule.recurrence && schedule.recurrence !== 'NONE') {
      const nextDate = new Date(schedule.scheduledDate);
      if (schedule.recurrence === 'WEEKLY') {
        nextDate.setDate(nextDate.getDate() + 7);
      } else if (schedule.recurrence === 'BIWEEKLY') {
        nextDate.setDate(nextDate.getDate() + 14);
      } else if (schedule.recurrence === 'MONTHLY') {
        nextDate.setMonth(nextDate.getMonth() + 1);
      } else if (schedule.recurrence === 'QUARTERLY') {
        nextDate.setMonth(nextDate.getMonth() + 3);
      }

      await prisma.careSchedule.create({
        data: {
          userId,
          vehicleId: schedule.vehicleId,
          title: schedule.title,
          careType: schedule.careType,
          scheduledDate: nextDate,
          recurrence: schedule.recurrence,
          notes: schedule.notes,
          isCompleted: false,
        },
      });
    }

    return updated;
  }

  static async reschedule(userId: string, id: string, newDate: string | Date) {
    const schedule = await prisma.careSchedule.findFirst({
      where: { id, userId },
    });
    if (!schedule) throw new Error('Task not found or unauthorized');

    return prisma.careSchedule.update({
      where: { id },
      data: {
        scheduledDate: new Date(newDate),
        isCompleted: false,
      },
    });
  }

  static async deleteSchedule(userId: string, id: string) {
    const schedule = await prisma.careSchedule.findFirst({
      where: { id, userId },
    });
    if (!schedule) throw new Error('Task not found or unauthorized');

    await prisma.careSchedule.delete({ where: { id } });
    return { success: true, message: 'Care schedule deleted successfully.' };
  }
}

