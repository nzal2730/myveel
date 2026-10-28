import prisma from '../../config/db';

export class WarrantiesService {
  static async getAllWarranties(userId: string, vehicleId?: string) {
    const where: any = {
      vehicle: { userId },
    };
    if (vehicleId) where.vehicleId = vehicleId;

    const warranties = await prisma.warranty.findMany({
      where,
      include: {
        vehicle: {
          select: {
            id: true,
            nickname: true,
            make: true,
            model: true,
            registrationNumber: true,
            currentOdometer: true,
          },
        },
      },
      orderBy: { expiryDate: 'asc' },
    });

    const now = new Date();
    return warranties.map((w) => {
      const exp = new Date(w.expiryDate);
      const diffTime = exp.getTime() - now.getTime();
      const daysUntilExpiry = Math.ceil(diffTime / (1000 * 3600 * 24));
      let isOdometerExceeded = false;
      if (w.maxOdometer && w.vehicle.currentOdometer > w.maxOdometer) {
        isOdometerExceeded = true;
      }

      let status = 'ACTIVE';
      if (daysUntilExpiry < 0 || isOdometerExceeded) {
        status = 'EXPIRED';
      } else if (daysUntilExpiry <= 30) {
        status = 'EXPIRING_SOON';
      }

      return {
        ...w,
        status,
        daysUntilExpiry,
        isOdometerExceeded,
      };
    });
  }

  static async getById(userId: string, id: string) {
    const warranty = await prisma.warranty.findFirst({
      where: { id, vehicle: { userId } },
      include: { vehicle: true },
    });
    if (!warranty) throw new Error('Warranty not found or unauthorized');
    return warranty;
  }

  static async createWarranty(userId: string, data: any) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: data.vehicleId, userId },
    });
    if (!vehicle) throw new Error('Vehicle not found or unauthorized');

    return prisma.warranty.create({
      data: {
        vehicleId: data.vehicleId,
        warrantyType: data.warrantyType,
        provider: data.provider.trim(),
        coverageNotes: data.coverageNotes.trim(),
        startDate: new Date(data.startDate),
        expiryDate: new Date(data.expiryDate),
        maxOdometer: data.maxOdometer ? Number(data.maxOdometer) : null,
        documentUrl: data.documentUrl || null,
      },
    });
  }

  static async updateWarranty(userId: string, id: string, data: any) {
    const warranty = await prisma.warranty.findFirst({
      where: { id, vehicle: { userId } },
    });
    if (!warranty) throw new Error('Warranty not found or unauthorized');

    return prisma.warranty.update({
      where: { id },
      data: {
        ...(data.warrantyType ? { warrantyType: data.warrantyType } : {}),
        ...(data.provider ? { provider: data.provider.trim() } : {}),
        ...(data.coverageNotes ? { coverageNotes: data.coverageNotes.trim() } : {}),
        ...(data.startDate ? { startDate: new Date(data.startDate) } : {}),
        ...(data.expiryDate ? { expiryDate: new Date(data.expiryDate) } : {}),
        ...(data.maxOdometer !== undefined
          ? { maxOdometer: data.maxOdometer ? Number(data.maxOdometer) : null }
          : {}),
        ...(data.documentUrl !== undefined ? { documentUrl: data.documentUrl } : {}),
      },
    });
  }

  static async deleteWarranty(userId: string, id: string) {
    const warranty = await prisma.warranty.findFirst({
      where: { id, vehicle: { userId } },
    });
    if (!warranty) throw new Error('Warranty not found or unauthorized');

    await prisma.warranty.delete({ where: { id } });
    return { success: true, message: 'Warranty record removed successfully.' };
  }
}

