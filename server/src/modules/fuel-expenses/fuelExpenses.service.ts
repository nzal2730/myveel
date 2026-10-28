import prisma from '../../config/db';

export class FuelExpensesService {
  static async getFuelLogs(userId: string, vehicleId?: string) {
    const where: any = {
      vehicle: { userId },
    };
    if (vehicleId) where.vehicleId = vehicleId;

    const logs = await prisma.fuelLog.findMany({
      where,
      include: {
        vehicle: {
          select: {
            id: true,
            nickname: true,
            make: true,
            model: true,
            registrationNumber: true,
            fuelType: true,
          },
        },
      },
      orderBy: { logDate: 'desc' },
    });

    // Calculate aggregate metrics
    const totalFuelSpend = logs.reduce((acc, log) => acc + log.totalCost, 0);
    const totalQuantity = logs.reduce((acc, log) => acc + log.quantity, 0);
    const validEfficiencies = logs
      .filter((l) => l.calculatedEfficiency && l.calculatedEfficiency > 0)
      .map((l) => l.calculatedEfficiency as number);

    const avgEfficiency =
      validEfficiencies.length > 0
        ? parseFloat(
            (
              validEfficiencies.reduce((a, b) => a + b, 0) / validEfficiencies.length
            ).toFixed(2)
          )
        : null;

    return {
      logs,
      metrics: {
        totalFuelSpend,
        totalQuantity: parseFloat(totalQuantity.toFixed(1)),
        avgEfficiency,
        efficiencyUnit: 'km/L',
      },
    };
  }

  static async addFuelLog(userId: string, data: any) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: data.vehicleId, userId },
    });
    if (!vehicle) throw new Error('Vehicle not found or unauthorized');

    const quantity = Number(data.quantity);
    const totalCost = Number(data.totalCost);
    const odometer = Number(data.odometer);
    const isFullTank = data.isFullTank !== undefined ? Boolean(data.isFullTank) : true;

    const pricePerUnit =
      data.pricePerUnit && Number(data.pricePerUnit) > 0
        ? Number(data.pricePerUnit)
        : quantity > 0
        ? parseFloat((totalCost / quantity).toFixed(2))
        : 0;

    const lDate = new Date(data.logDate || Date.now());

    // Calculate efficiency if consecutive full tank
    let calculatedEfficiency = null;
    if (isFullTank) {
      const prevLog = await prisma.fuelLog.findFirst({
        where: {
          vehicleId: data.vehicleId,
          logDate: { lte: lDate },
        },
        orderBy: { logDate: 'desc' },
      });

      if (prevLog && prevLog.isFullTank && odometer > prevLog.odometer && quantity > 0) {
        const kmDiff = odometer - prevLog.odometer;
        calculatedEfficiency = parseFloat((kmDiff / quantity).toFixed(2));
      }
    }

    const fuelLog = await prisma.fuelLog.create({
      data: {
        vehicleId: data.vehicleId,
        logDate: lDate,
        fuelType: data.fuelType || vehicle.fuelType,
        quantity,
        totalCost,
        pricePerUnit,
        odometer,
        isFullTank,
        calculatedEfficiency,
        notes: data.notes?.trim() || null,
      },
    });

    // Update vehicle odometer if higher
    if (odometer > vehicle.currentOdometer) {
      await prisma.vehicle.update({
        where: { id: data.vehicleId },
        data: { currentOdometer: odometer },
      });

      await prisma.odometerReading.create({
        data: {
          vehicleId: data.vehicleId,
          reading: odometer,
          readingDate: lDate,
          source: 'FUEL',
          notes: `Recorded at fuel fill-up (${quantity}L ${data.fuelType})`,
        },
      });
    }

    // Link expense via source reference without double counting
    if (totalCost > 0) {
      await prisma.expense.create({
        data: {
          vehicleId: data.vehicleId,
          expenseDate: lDate,
          category: 'Fuel',
          amount: totalCost,
          description: `Fuel Fill-up: ${quantity}L @ ₹${pricePerUnit}/L`,
          sourceType: 'FUEL',
          sourceId: fuelLog.id,
        },
      });
    }

    return fuelLog;
  }

  static async deleteFuelLog(userId: string, id: string) {
    const log = await prisma.fuelLog.findFirst({
      where: { id, vehicle: { userId } },
    });
    if (!log) throw new Error('Fuel log not found or unauthorized');

    // Remove linked expense
    await prisma.expense.deleteMany({
      where: { sourceType: 'FUEL', sourceId: id },
    });

    await prisma.fuelLog.delete({ where: { id } });
    return { success: true, message: 'Fuel log and linked expense deleted.' };
  }

  static async getExpenses(userId: string, filters?: any) {
    const where: any = {
      vehicle: { userId },
    };
    if (filters?.vehicleId) where.vehicleId = filters.vehicleId;
    if (filters?.category && filters.category !== 'ALL') where.category = filters.category;
    if (filters?.startDate || filters?.endDate) {
      where.expenseDate = {};
      if (filters.startDate) where.expenseDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.expenseDate.lte = new Date(filters.endDate);
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        vehicle: {
          select: { id: true, nickname: true, make: true, model: true, registrationNumber: true },
        },
      },
      orderBy: { expenseDate: 'desc' },
    });

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let thisMonthTotal = 0;
    let ytdTotal = 0;
    const categoryTotals: Record<string, number> = {};
    const vehicleTotals: Record<string, number> = {};

    expenses.forEach((e) => {
      const eDate = new Date(e.expenseDate);
      const isThisMonth =
        eDate.getMonth() === currentMonth && eDate.getFullYear() === currentYear;
      const isThisYear = eDate.getFullYear() === currentYear;

      if (isThisMonth) thisMonthTotal += e.amount;
      if (isThisYear) ytdTotal += e.amount;

      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
      const vName = e.vehicle.nickname || e.vehicle.model;
      vehicleTotals[vName] = (vehicleTotals[vName] || 0) + e.amount;
    });

    // Generate monthly timeline (last 6 months)
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const monthlySpending = [];
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = targetDate.getMonth();
      const yr = targetDate.getFullYear();
      const label = `${monthNames[mIdx]} ${yr.toString().slice(-2)}`;

      const mExpenses = expenses.filter((e) => {
        const d = new Date(e.expenseDate);
        return d.getMonth() === mIdx && d.getFullYear() === yr;
      });

      const total = mExpenses.reduce((s, e) => s + e.amount, 0);
      const fuel = mExpenses
        .filter((e) => e.category === 'Fuel')
        .reduce((s, e) => s + e.amount, 0);
      const service = mExpenses
        .filter((e) => e.category === 'Service')
        .reduce((s, e) => s + e.amount, 0);
      const insurance = mExpenses
        .filter((e) => e.category === 'Insurance')
        .reduce((s, e) => s + e.amount, 0);
      const other = total - fuel - service - insurance;

      monthlySpending.push({ month: label, amount: total, fuel, service, insurance, other });
    }

    return {
      expenses,
      summary: {
        thisMonthTotal: parseFloat(thisMonthTotal.toFixed(2)),
        ytdTotal: parseFloat(ytdTotal.toFixed(2)),
        categoryBreakdown: Object.entries(categoryTotals).map(([name, value]) => ({
          name,
          value: parseFloat(value.toFixed(2)),
        })),
        vehicleBreakdown: Object.entries(vehicleTotals).map(([name, value]) => ({
          name,
          value: parseFloat(value.toFixed(2)),
        })),
        monthlySpending,
      },
    };
  }

  static async addManualExpense(userId: string, data: any) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: data.vehicleId, userId },
    });
    if (!vehicle) throw new Error('Vehicle not found or unauthorized');

    return prisma.expense.create({
      data: {
        vehicleId: data.vehicleId,
        expenseDate: new Date(data.expenseDate || Date.now()),
        category: data.category || 'Other',
        amount: Number(data.amount),
        description: data.description.trim(),
        sourceType: 'MANUAL',
        receiptUrl: data.receiptUrl || null,
      },
    });
  }

  static async deleteExpense(userId: string, id: string) {
    const exp = await prisma.expense.findFirst({
      where: { id, vehicle: { userId } },
    });
    if (!exp) throw new Error('Expense not found or unauthorized');

    if (exp.sourceType !== 'MANUAL') {
      throw new Error(
        `This expense is linked to an underlying ${exp.sourceType.toLowerCase()} record. Please delete or edit the original record in its respective section to keep your garage data consistent.`
      );
    }

    await prisma.expense.delete({ where: { id } });
    return { success: true, message: 'Expense deleted successfully.' };
  }
}

