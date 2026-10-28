import prisma from '../../config/db';

export function normalizeRegNumber(regNo: string): string {
  return regNo.toUpperCase().replace(/[\s-]/g, '').trim();
}

export class VehiclesService {
  static async getAllVehicles(userId: string) {
    const vehicles = await prisma.vehicle.findMany({
      where: { userId, isActive: true },
      include: {
        insurancePolicies: {
          where: { isActive: true },
          orderBy: { expiryDate: 'desc' },
          take: 1,
        },
        serviceRecords: {
          orderBy: { serviceDate: 'desc' },
          take: 1,
        },
        documents: {
          orderBy: { expiryDate: 'asc' },
        },
        serviceReminders: {
          where: { isCompleted: false },
          orderBy: { dueDate: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();

    return vehicles.map((v) => {
      const activePolicy = v.insurancePolicies[0];
      const latestService = v.serviceRecords[0];

      // Find nearest document expiry
      const upcomingDoc = v.documents.find((d) => new Date(d.expiryDate) >= now);
      const expiredDocsCount = v.documents.filter((d) => new Date(d.expiryDate) < now).length;

      let insuranceStatus = 'NO_POLICY';
      if (activePolicy) {
        const exp = new Date(activePolicy.expiryDate);
        const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 3600 * 24));
        if (daysLeft < 0) insuranceStatus = 'EXPIRED';
        else if (daysLeft <= 30) insuranceStatus = 'EXPIRING_SOON';
        else insuranceStatus = 'ACTIVE';
      }

      return {
        id: v.id,
        nickname: v.nickname,
        make: v.make,
        model: v.model,
        year: v.year,
        registrationNumber: v.registrationNumber,
        vehicleType: v.vehicleType,
        fuelType: v.fuelType,
        photo: v.photo,
        notes: v.notes,
        currentOdometer: v.currentOdometer,
        createdAt: v.createdAt,
        activeInsurance: activePolicy
          ? {
              id: activePolicy.id,
              insurer: activePolicy.insurer,
              policyNumber: activePolicy.policyNumber,
              expiryDate: activePolicy.expiryDate,
              status: insuranceStatus,
            }
          : null,
        latestService: latestService
          ? {
              id: latestService.id,
              serviceDate: latestService.serviceDate,
              serviceType: latestService.serviceType,
              odometer: latestService.odometer,
              cost: latestService.cost,
            }
          : null,
        pendingRemindersCount: v.serviceReminders.length,
        expiredDocsCount,
        nextRenewalDate: activePolicy?.expiryDate || upcomingDoc?.expiryDate || null,
      };
    });
  }

  static async getVehicleById(userId: string, vehicleId: string) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, userId },
      include: {
        odometerReadings: {
          orderBy: { readingDate: 'desc' },
          take: 10,
        },
        serviceRecords: {
          orderBy: { serviceDate: 'desc' },
          take: 10,
        },
        documents: {
          orderBy: { expiryDate: 'asc' },
        },
        insurancePolicies: {
          orderBy: { expiryDate: 'desc' },
        },
        warranties: {
          orderBy: { expiryDate: 'asc' },
        },
        tyreBatteryRecords: {
          orderBy: { installedDate: 'desc' },
        },
        fuelLogs: {
          orderBy: { logDate: 'desc' },
          take: 10,
        },
        expenses: {
          orderBy: { expenseDate: 'desc' },
          take: 10,
        },
        serviceReminders: {
          where: { isCompleted: false },
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    if (!vehicle) {
      throw new Error('Vehicle not found or you do not have permission to view it.');
    }

    return vehicle;
  }

  static async createVehicle(userId: string, data: any) {
    const normalizedReg = normalizeRegNumber(data.registrationNumber);

    const existing = await prisma.vehicle.findFirst({
      where: {
        userId,
        registrationNumber: normalizedReg,
      },
    });

    if (existing) {
      throw new Error(
        `A vehicle with registration "${data.registrationNumber.toUpperCase()}" already exists in your garage.`
      );
    }

    const odo = data.initialOdometer || 0;

    const vehicle = await prisma.vehicle.create({
      data: {
        userId,
        nickname: data.nickname.trim(),
        make: data.make.trim(),
        model: data.model.trim(),
        year: Number(data.year),
        registrationNumber: normalizedReg,
        vehicleType: data.vehicleType || 'Car',
        fuelType: data.fuelType || 'Petrol',
        photo: data.photo || null,
        notes: data.notes?.trim() || null,
        currentOdometer: odo,
      },
    });

    if (odo > 0) {
      await prisma.odometerReading.create({
        data: {
          vehicleId: vehicle.id,
          reading: odo,
          readingDate: new Date(),
          source: 'MANUAL',
          notes: 'Initial odometer reading recorded upon garage registration',
        },
      });
    }

    return vehicle;
  }

  static async updateVehicle(userId: string, vehicleId: string, data: any) {
    const existing = await prisma.vehicle.findFirst({
      where: { id: vehicleId, userId },
    });

    if (!existing) {
      throw new Error('Vehicle not found or unauthorized.');
    }

    let normalizedReg = existing.registrationNumber;
    if (data.registrationNumber) {
      normalizedReg = normalizeRegNumber(data.registrationNumber);
      if (normalizedReg !== existing.registrationNumber) {
        const duplicate = await prisma.vehicle.findFirst({
          where: {
            userId,
            registrationNumber: normalizedReg,
            id: { not: vehicleId },
          },
        });
        if (duplicate) {
          throw new Error('Another vehicle already has this registration number.');
        }
      }
    }

    const updated = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        ...(data.nickname ? { nickname: data.nickname.trim() } : {}),
        ...(data.make ? { make: data.make.trim() } : {}),
        ...(data.model ? { model: data.model.trim() } : {}),
        ...(data.year ? { year: Number(data.year) } : {}),
        ...(data.registrationNumber ? { registrationNumber: normalizedReg } : {}),
        ...(data.vehicleType ? { vehicleType: data.vehicleType } : {}),
        ...(data.fuelType ? { fuelType: data.fuelType } : {}),
        ...(data.photo !== undefined ? { photo: data.photo } : {}),
        ...(data.notes !== undefined ? { notes: data.notes?.trim() || null } : {}),
      },
    });

    return updated;
  }

  static async deleteVehicle(userId: string, vehicleId: string) {
    const existing = await prisma.vehicle.findFirst({
      where: { id: vehicleId, userId },
    });

    if (!existing) {
      throw new Error('Vehicle not found or unauthorized.');
    }

    // Prisma schema cascades deletions to dependent records
    await prisma.vehicle.delete({
      where: { id: vehicleId },
    });

    return { success: true, message: 'Vehicle and all associated records deleted successfully.' };
  }
}

