import prisma from '../../config/db';

export class OdometerService {
  static async getReadings(userId: string, vehicleId: string) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, userId },
    });

    if (!vehicle) throw new Error('Vehicle not found or unauthorized');

    const readings = await prisma.odometerReading.findMany({
      where: { vehicleId },
      orderBy: { readingDate: 'desc' },
    });

    // Calculate usage stats
    const totalReadings = readings.length;
    let avgDailyKm = 0;
    if (totalReadings >= 2) {
      const oldest = readings[totalReadings - 1];
      const newest = readings[0];
      const diffKm = newest.reading - oldest.reading;
      const diffDays = Math.max(
        1,
        Math.round(
          (new Date(newest.readingDate).getTime() - new Date(oldest.readingDate).getTime()) /
            (1000 * 3600 * 24)
        )
      );
      if (diffKm > 0) {
        avgDailyKm = parseFloat((diffKm / diffDays).toFixed(1));
      }
    }

    return {
      vehicle: {
        id: vehicle.id,
        nickname: vehicle.nickname,
        currentOdometer: vehicle.currentOdometer,
        make: vehicle.make,
        model: vehicle.model,
      },
      readings,
      stats: {
        totalReadings,
        currentOdometer: vehicle.currentOdometer,
        avgDailyKm,
        estimatedMonthlyKm: Math.round(avgDailyKm * 30),
      },
    };
  }

  static async addReading(userId: string, data: any) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: data.vehicleId, userId },
    });

    if (!vehicle) throw new Error('Vehicle not found or unauthorized');

    const readingValue = Number(data.reading);
    if (isNaN(readingValue) || readingValue < 0) {
      throw new Error('Please enter a valid non-negative odometer reading.');
    }

    const rDate = data.readingDate ? new Date(data.readingDate) : new Date();

    // Check against latest reading
    const latestReading = await prisma.odometerReading.findFirst({
      where: { vehicleId: data.vehicleId },
      orderBy: { reading: 'desc' },
    });

    if (latestReading && readingValue < latestReading.reading && !data.isCorrection) {
      throw new Error(
        `New reading (${readingValue} km) is lower than existing highest reading (${latestReading.reading} km). If this is a correction or odometer reset/replacement, please toggle the 'Confirm Reading Correction' option.`
      );
    }

    const newRecord = await prisma.odometerReading.create({
      data: {
        vehicleId: data.vehicleId,
        reading: readingValue,
        readingDate: rDate,
        isCorrection: Boolean(data.isCorrection),
        notes: data.notes?.trim() || null,
        source: data.source || 'MANUAL',
      },
    });

    // Update vehicle's current odometer if this reading is higher or if it's an explicit correction
    if (data.isCorrection || readingValue > vehicle.currentOdometer) {
      await prisma.vehicle.update({
        where: { id: data.vehicleId },
        data: { currentOdometer: readingValue },
      });
    }

    return newRecord;
  }

  static async deleteReading(userId: string, readingId: string) {
    const reading = await prisma.odometerReading.findUnique({
      where: { id: readingId },
      include: { vehicle: true },
    });

    if (!reading || reading.vehicle.userId !== userId) {
      throw new Error('Reading not found or unauthorized');
    }

    await prisma.odometerReading.delete({
      where: { id: readingId },
    });

    // Recalculate latest odometer
    const highest = await prisma.odometerReading.findFirst({
      where: { vehicleId: reading.vehicleId },
      orderBy: { reading: 'desc' },
    });

    await prisma.vehicle.update({
      where: { id: reading.vehicleId },
      data: { currentOdometer: highest ? highest.reading : 0 },
    });

    return { success: true, message: 'Odometer reading deleted successfully' };
  }
}

