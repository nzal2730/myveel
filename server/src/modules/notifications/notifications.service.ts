import prisma from '../../config/db';

export class NotificationsService {
  static async getNotifications(userId: string, filters?: any) {
    const where: any = { userId };
    if (filters?.category && filters.category !== 'ALL') where.category = filters.category;
    if (filters?.isRead !== undefined) where.isRead = filters.isRead;

    const notifications = await prisma.notification.findMany({
      where,
      include: {
        vehicle: {
          select: { id: true, nickname: true, make: true, model: true, registrationNumber: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return {
      notifications,
      unreadCount,
    };
  }

  static async markAsRead(userId: string, id: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  static async dismiss(userId: string, id: string) {
    return prisma.notification.deleteMany({
      where: { id, userId },
    });
  }

  static async createNotificationSafe(data: {
    userId: string;
    vehicleId?: string;
    title: string;
    message: string;
    category: string;
    priority: string;
    dedupeKey: string;
    linkUrl?: string;
  }) {
    // Check if notification with this dedupeKey already exists for the user
    const existing = await prisma.notification.findUnique({
      where: {
        userId_dedupeKey: {
          userId: data.userId,
          dedupeKey: data.dedupeKey,
        },
      },
    });

    if (!existing) {
      return prisma.notification.create({
        data: {
          userId: data.userId,
          vehicleId: data.vehicleId || null,
          title: data.title,
          message: data.message,
          category: data.category,
          priority: data.priority,
          dedupeKey: data.dedupeKey,
          linkUrl: data.linkUrl || null,
        },
      });
    }
    return existing;
  }

  static async syncReminders(userId: string) {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    let createdCount = 0;

    // 1. Insurance Policies
    const policies = await prisma.insurancePolicy.findMany({
      where: {
        vehicle: { userId },
        isActive: true,
      },
      include: { vehicle: true },
    });

    for (const p of policies) {
      const exp = new Date(p.expiryDate);
      const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 3600 * 24));

      if (daysLeft <= 30 && daysLeft >= -7) {
        const priority = daysLeft <= 7 ? 'URGENT' : daysLeft <= 15 ? 'WARNING' : 'INFO';
        const title =
          daysLeft < 0
            ? `Insurance Expired: ${p.vehicle.nickname}`
            : `Insurance Renewal Due: ${p.vehicle.nickname}`;
        const message =
          daysLeft < 0
            ? `Policy #${p.policyNumber} expired on ${
                p.expiryDate.toISOString().split('T')[0]
              }. Please renew immediately.`
            : `Policy #${p.policyNumber} expires in ${daysLeft} days (${
                p.expiryDate.toISOString().split('T')[0]
              }).`;
        const dedupeKey = `INSURANCE_${p.id}_${todayStr}_STAGE_${
          daysLeft <= 7 ? '7' : daysLeft <= 15 ? '15' : '30'
        }`;

        await this.createNotificationSafe({
          userId,
          vehicleId: p.vehicleId,
          title,
          message,
          category: 'INSURANCE',
          priority,
          dedupeKey,
          linkUrl: '/insurance',
        });
        createdCount++;
      }
    }

    // 2. Documents (PUC, RC, etc.)
    const docs = await prisma.document.findMany({
      where: { vehicle: { userId } },
      include: { vehicle: true },
    });

    for (const d of docs) {
      const exp = new Date(d.expiryDate);
      const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 3600 * 24));

      if (daysLeft <= 30 && daysLeft >= -7) {
        const priority = daysLeft <= 7 ? 'URGENT' : 'WARNING';
        const title =
          daysLeft < 0
            ? `${d.documentType} Expired: ${d.vehicle.nickname}`
            : `${d.documentType} Expiring Soon: ${d.vehicle.nickname}`;
        const message =
          daysLeft < 0
            ? `${d.documentType} (#${d.documentNumber}) expired. Avoid fines by renewing today.`
            : `${d.documentType} (#${d.documentNumber}) expires in ${daysLeft} days.`;
        const dedupeKey = `DOC_${d.id}_${todayStr}_STAGE_${daysLeft <= 7 ? '7' : '30'}`;

        await this.createNotificationSafe({
          userId,
          vehicleId: d.vehicleId,
          title,
          message,
          category: 'DOCUMENT',
          priority,
          dedupeKey,
          linkUrl: '/documents',
        });
        createdCount++;
      }
    }

    // 3. Service Reminders
    const serviceReminders = await prisma.serviceReminder.findMany({
      where: {
        vehicle: { userId },
        isCompleted: false,
      },
      include: { vehicle: true },
    });

    for (const sr of serviceReminders) {
      let isDue = false;
      let reason = '';

      if (sr.dueDate) {
        const diff = Math.ceil(
          (new Date(sr.dueDate).getTime() - now.getTime()) / (1000 * 3600 * 24)
        );
        if (diff <= 14) {
          isDue = true;
          reason = diff < 0 ? `overdue by ${Math.abs(diff)} days` : `due in ${diff} days`;
        }
      }

      if (sr.dueOdometer && sr.vehicle.currentOdometer >= sr.dueOdometer - 300) {
        isDue = true;
        const odoDiff = sr.dueOdometer - sr.vehicle.currentOdometer;
        reason = odoDiff <= 0 ? `overdue by ${Math.abs(odoDiff)} km` : `due in ${odoDiff} km`;
      }

      if (isDue) {
        const dedupeKey = `SERVICE_REMINDER_${sr.id}_${todayStr}`;
        await this.createNotificationSafe({
          userId,
          vehicleId: sr.vehicleId,
          title: `Service Reminder: ${sr.title}`,
          message: `${sr.vehicle.nickname} service is ${reason}.`,
          category: 'SERVICE',
          priority: 'WARNING',
          dedupeKey,
          linkUrl: '/services',
        });
        createdCount++;
      }
    }

    // 4. Care Schedules
    const careTasks = await prisma.careSchedule.findMany({
      where: {
        userId,
        isCompleted: false,
        scheduledDate: { lte: new Date(now.getTime() + 2 * 24 * 3600 * 1000) }, // next 2 days
      },
      include: { vehicle: true },
    });

    for (const ct of careTasks) {
      const dedupeKey = `CARE_TASK_${ct.id}_${todayStr}`;
      await this.createNotificationSafe({
        userId,
        vehicleId: ct.vehicleId || undefined,
        title: `Care Task Scheduled: ${ct.title}`,
        message: `Scheduled for ${ct.scheduledDate.toISOString().split('T')[0]}.`,
        category: 'CARE',
        priority: 'INFO',
        dedupeKey,
        linkUrl: '/calendar',
      });
      createdCount++;
    }

    return { success: true, message: 'Reminders synchronized.', createdCount };
  }
}

