import prisma from '../../config/db';

export class ServicesService {
  static async getAllServices(userId: string, filters?: any) {
    const where: any = {
      vehicle: { userId },
    };

    if (filters?.vehicleId) {
      where.vehicleId = filters.vehicleId;
    }

    if (filters?.serviceType && filters.serviceType !== 'ALL') {
      where.serviceType = filters.serviceType;
    }

    if (filters?.startDate || filters?.endDate) {
      where.serviceDate = {};
      if (filters.startDate) where.serviceDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.serviceDate.lte = new Date(filters.endDate);
    }

    const services = await prisma.serviceRecord.findMany({
      where,
      include: {
        vehicle: {
          select: {
            id: true,
            nickname: true,
            make: true,
            model: true,
            registrationNumber: true,
          },
        },
      },
      orderBy: { serviceDate: 'desc' },
    });

    return services;
  }

  static async getServiceById(userId: string, serviceId: string) {
    const service = await prisma.serviceRecord.findFirst({
      where: {
        id: serviceId,
        vehicle: { userId },
      },
      include: {
        vehicle: true,
      },
    });

    if (!service) {
      throw new Error('Service record not found or unauthorized');
    }

    return service;
  }

  static async createService(userId: string, data: any) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: data.vehicleId, userId },
    });

    if (!vehicle) throw new Error('Vehicle not found or unauthorized');

    const cost = Number(data.cost) || 0;
    const odometer = Number(data.odometer) || vehicle.currentOdometer;
    const sDate = new Date(data.serviceDate || Date.now());

    // Create service record
    const serviceRecord = await prisma.serviceRecord.create({
      data: {
        vehicleId: data.vehicleId,
        serviceDate: sDate,
        serviceType: data.serviceType,
        workshopName: data.workshopName.trim(),
        description: data.description.trim(),
        partsReplaced: data.partsReplaced?.trim() || null,
        cost,
        odometer,
        invoiceUrl: data.invoiceUrl || null,
        nextDueMonths: data.nextDueMonths ? Number(data.nextDueMonths) : null,
        nextDueKm: data.nextDueKm ? Number(data.nextDueKm) : null,
      },
    });

    // Update vehicle odometer if service odometer is higher
    if (odometer > vehicle.currentOdometer) {
      await prisma.vehicle.update({
        where: { id: data.vehicleId },
        data: { currentOdometer: odometer },
      });

      await prisma.odometerReading.create({
        data: {
          vehicleId: data.vehicleId,
          reading: odometer,
          readingDate: sDate,
          source: 'SERVICE',
          notes: `Recorded during ${data.serviceType} at ${data.workshopName}`,
        },
      });
    }

    // Link into Expense system via source reference without double counting
    if (cost > 0) {
      await prisma.expense.create({
        data: {
          vehicleId: data.vehicleId,
          expenseDate: sDate,
          category: 'Service',
          amount: cost,
          description: `${data.serviceType} at ${data.workshopName}`,
          sourceType: 'SERVICE',
          sourceId: serviceRecord.id,
          receiptUrl: data.invoiceUrl || null,
        },
      });
    }

    // Automatically create next service reminder if interval is given
    if (data.nextDueMonths || data.nextDueKm) {
      let dueDate: Date | null = null;
      let dueOdo: number | null = null;

      if (data.nextDueMonths) {
        dueDate = new Date(sDate);
        dueDate.setMonth(dueDate.getMonth() + Number(data.nextDueMonths));
      }
      if (data.nextDueKm) {
        dueOdo = odometer + Number(data.nextDueKm);
      }

      await prisma.serviceReminder.create({
        data: {
          vehicleId: data.vehicleId,
          title: `Next ${data.serviceType} Due`,
          serviceType: data.serviceType,
          dueDate,
          dueOdometer: dueOdo,
          notes: `Auto-scheduled from service on ${sDate.toISOString().split('T')[0]}`,
        },
      });
    }

    return serviceRecord;
  }

  static async updateService(userId: string, serviceId: string, data: any) {
    const service = await prisma.serviceRecord.findFirst({
      where: { id: serviceId, vehicle: { userId } },
    });

    if (!service) throw new Error('Service record not found or unauthorized');

    const cost = data.cost !== undefined ? Number(data.cost) : service.cost;
    const sDate = data.serviceDate ? new Date(data.serviceDate) : service.serviceDate;

    const updated = await prisma.serviceRecord.update({
      where: { id: serviceId },
      data: {
        ...(data.serviceDate ? { serviceDate: sDate } : {}),
        ...(data.serviceType ? { serviceType: data.serviceType } : {}),
        ...(data.workshopName ? { workshopName: data.workshopName.trim() } : {}),
        ...(data.description ? { description: data.description.trim() } : {}),
        ...(data.partsReplaced !== undefined ? { partsReplaced: data.partsReplaced?.trim() || null } : {}),
        ...(data.cost !== undefined ? { cost } : {}),
        ...(data.odometer !== undefined ? { odometer: Number(data.odometer) } : {}),
        ...(data.invoiceUrl !== undefined ? { invoiceUrl: data.invoiceUrl } : {}),
        ...(data.nextDueMonths !== undefined ? { nextDueMonths: data.nextDueMonths ? Number(data.nextDueMonths) : null } : {}),
        ...(data.nextDueKm !== undefined ? { nextDueKm: data.nextDueKm ? Number(data.nextDueKm) : null } : {}),
      },
    });

    // Keep linked expense in sync
    const linkedExpense = await prisma.expense.findFirst({
      where: { sourceType: 'SERVICE', sourceId: serviceId },
    });

    if (linkedExpense) {
      await prisma.expense.update({
        where: { id: linkedExpense.id },
        data: {
          amount: cost,
          expenseDate: sDate,
          description: `${updated.serviceType} at ${updated.workshopName}`,
          receiptUrl: updated.invoiceUrl || linkedExpense.receiptUrl,
        },
      });
    } else if (cost > 0) {
      await prisma.expense.create({
        data: {
          vehicleId: service.vehicleId,
          expenseDate: sDate,
          category: 'Service',
          amount: cost,
          description: `${updated.serviceType} at ${updated.workshopName}`,
          sourceType: 'SERVICE',
          sourceId: serviceId,
          receiptUrl: updated.invoiceUrl || null,
        },
      });
    }

    return updated;
  }

  static async deleteService(userId: string, serviceId: string) {
    const service = await prisma.serviceRecord.findFirst({
      where: { id: serviceId, vehicle: { userId } },
    });

    if (!service) throw new Error('Service record not found or unauthorized');

    // Delete linked expense
    await prisma.expense.deleteMany({
      where: { sourceType: 'SERVICE', sourceId: serviceId },
    });

    await prisma.serviceRecord.delete({
      where: { id: serviceId },
    });

    return { success: true, message: 'Service record and linked expense deleted successfully' };
  }

  static async getReminders(userId: string, vehicleId?: string) {
    const where: any = {
      vehicle: { userId },
    };
    if (vehicleId) where.vehicleId = vehicleId;

    const reminders = await prisma.serviceReminder.findMany({
      where,
      include: {
        vehicle: {
          select: { id: true, nickname: true, make: true, model: true, currentOdometer: true },
        },
      },
      orderBy: [{ isCompleted: 'asc' }, { dueDate: 'asc' }],
    });

    return reminders;
  }

  static async completeReminder(userId: string, reminderId: string) {
    const reminder = await prisma.serviceReminder.findFirst({
      where: { id: reminderId, vehicle: { userId } },
    });

    if (!reminder) throw new Error('Reminder not found or unauthorized');

    const updated = await prisma.serviceReminder.update({
      where: { id: reminderId },
      data: {
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    return updated;
  }
}

