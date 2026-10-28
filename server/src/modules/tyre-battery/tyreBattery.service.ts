import prisma from '../../config/db';

export class TyreBatteryService {
  static async getItems(userId: string, vehicleId?: string, itemType?: string) {
    const where: any = {
      vehicle: { userId },
    };
    if (vehicleId) where.vehicleId = vehicleId;
    if (itemType && itemType !== 'ALL') where.itemType = itemType;

    const items = await prisma.tyreBatteryRecord.findMany({
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
      orderBy: { installedDate: 'desc' },
    });

    const now = new Date();
    return items.map((item) => {
      const installed = new Date(item.installedDate);
      const ageMonths = Math.max(
        0,
        Math.floor((now.getTime() - installed.getTime()) / (1000 * 3600 * 24 * 30.4375))
      );
      const kmRun = Math.max(0, item.vehicle.currentOdometer - item.installedOdometer);

      let isDue = false;
      let dueReason = '';
      if (item.replacementDueAgeMonths && ageMonths >= item.replacementDueAgeMonths) {
        isDue = true;
        dueReason = `Exceeded age threshold (${ageMonths}/${item.replacementDueAgeMonths} months)`;
      } else if (item.replacementDueKm && kmRun >= item.replacementDueKm) {
        isDue = true;
        dueReason = `Exceeded mileage threshold (${kmRun.toLocaleString()}/${item.replacementDueKm.toLocaleString()} km)`;
      }

      return {
        ...item,
        ageMonths,
        kmRun,
        isDue,
        dueReason,
      };
    });
  }

  static async getById(userId: string, id: string) {
    const item = await prisma.tyreBatteryRecord.findFirst({
      where: { id, vehicle: { userId } },
      include: { vehicle: true },
    });
    if (!item) throw new Error('Item not found or unauthorized');
    return item;
  }

  static async createItem(userId: string, data: any) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: data.vehicleId, userId },
    });
    if (!vehicle) throw new Error('Vehicle not found or unauthorized');

    const odo =
      data.installedOdometer !== undefined
        ? Number(data.installedOdometer)
        : vehicle.currentOdometer;

    return prisma.tyreBatteryRecord.create({
      data: {
        vehicleId: data.vehicleId,
        itemType: data.itemType,
        brand: data.brand.trim(),
        model: data.model.trim(),
        position: data.position || null,
        sizeOrSerial: data.sizeOrSerial?.trim() || null,
        installedDate: new Date(data.installedDate),
        installedOdometer: odo,
        replacementDueAgeMonths: data.replacementDueAgeMonths
          ? Number(data.replacementDueAgeMonths)
          : null,
        replacementDueKm: data.replacementDueKm ? Number(data.replacementDueKm) : null,
        notes: data.notes?.trim() || null,
      },
    });
  }

  static async updateItem(userId: string, id: string, data: any) {
    const item = await prisma.tyreBatteryRecord.findFirst({
      where: { id, vehicle: { userId } },
    });
    if (!item) throw new Error('Item not found or unauthorized');

    return prisma.tyreBatteryRecord.update({
      where: { id },
      data: {
        ...(data.brand ? { brand: data.brand.trim() } : {}),
        ...(data.model ? { model: data.model.trim() } : {}),
        ...(data.position !== undefined ? { position: data.position } : {}),
        ...(data.sizeOrSerial !== undefined
          ? { sizeOrSerial: data.sizeOrSerial?.trim() || null }
          : {}),
        ...(data.installedDate ? { installedDate: new Date(data.installedDate) } : {}),
        ...(data.installedOdometer !== undefined
          ? { installedOdometer: Number(data.installedOdometer) }
          : {}),
        ...(data.replacementDueAgeMonths !== undefined
          ? {
              replacementDueAgeMonths: data.replacementDueAgeMonths
                ? Number(data.replacementDueAgeMonths)
                : null,
            }
          : {}),
        ...(data.replacementDueKm !== undefined
          ? { replacementDueKm: data.replacementDueKm ? Number(data.replacementDueKm) : null }
          : {}),
        ...(data.lastRotatedDate ? { lastRotatedDate: new Date(data.lastRotatedDate) } : {}),
        ...(data.lastAlignedDate ? { lastAlignedDate: new Date(data.lastAlignedDate) } : {}),
        ...(data.notes !== undefined ? { notes: data.notes?.trim() || null } : {}),
      },
    });
  }

  static async logAction(userId: string, id: string, action: string) {
    const item = await prisma.tyreBatteryRecord.findFirst({
      where: { id, vehicle: { userId } },
    });
    if (!item) throw new Error('Item not found or unauthorized');

    const now = new Date();
    return prisma.tyreBatteryRecord.update({
      where: { id },
      data: {
        ...(action === 'ROTATE' ? { lastRotatedDate: now } : { lastAlignedDate: now }),
      },
    });
  }

  static async deleteItem(userId: string, id: string) {
    const item = await prisma.tyreBatteryRecord.findFirst({
      where: { id, vehicle: { userId } },
    });
    if (!item) throw new Error('Item not found or unauthorized');

    await prisma.tyreBatteryRecord.delete({ where: { id } });
    return { success: true, message: 'Record deleted successfully.' };
  }
}

