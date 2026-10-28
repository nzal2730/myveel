import prisma from '../../config/db';

export class InsuranceService {
  static async getAllPolicies(userId: string, vehicleId?: string) {
    const where: any = {
      vehicle: { userId },
    };
    if (vehicleId) where.vehicleId = vehicleId;

    const policies = await prisma.insurancePolicy.findMany({
      where,
      include: {
        vehicle: {
          select: { id: true, nickname: true, make: true, model: true, registrationNumber: true },
        },
      },
      orderBy: { expiryDate: 'desc' },
    });

    const now = new Date();
    return policies.map((pol) => {
      const exp = new Date(pol.expiryDate);
      const diffTime = exp.getTime() - now.getTime();
      const daysUntilExpiry = Math.ceil(diffTime / (1000 * 3600 * 24));
      let status = 'ACTIVE';
      if (daysUntilExpiry < 0) {
        status = 'EXPIRED';
      } else if (daysUntilExpiry <= 30) {
        status = 'EXPIRING_SOON';
      }

      return {
        ...pol,
        status,
        daysUntilExpiry,
      };
    });
  }

  static async getPolicyById(userId: string, policyId: string) {
    const policy = await prisma.insurancePolicy.findFirst({
      where: { id: policyId, vehicle: { userId } },
      include: { vehicle: true },
    });
    if (!policy) throw new Error('Policy not found or unauthorized');
    return policy;
  }

  static async createPolicy(userId: string, data: any) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: data.vehicleId, userId },
    });
    if (!vehicle) throw new Error('Vehicle not found or unauthorized');

    const premium = Number(data.premium) || 0;
    const isActive = data.isActive !== undefined ? Boolean(data.isActive) : true;

    // If new policy is marked active, mark any existing active policies for this vehicle as inactive (archived)
    if (isActive) {
      await prisma.insurancePolicy.updateMany({
        where: { vehicleId: data.vehicleId, isActive: true },
        data: { isActive: false },
      });
    }

    const sDate = new Date(data.startDate);
    const policy = await prisma.insurancePolicy.create({
      data: {
        vehicleId: data.vehicleId,
        insurer: data.insurer.trim(),
        policyNumber: data.policyNumber.trim(),
        coverType: data.coverType,
        premium,
        idv: data.idv ? Number(data.idv) : null,
        startDate: sDate,
        expiryDate: new Date(data.expiryDate),
        documentUrl: data.documentUrl || null,
        notes: data.notes?.trim() || null,
        isActive,
      },
    });

    // Link expense without double counting
    if (premium > 0) {
      await prisma.expense.create({
        data: {
          vehicleId: data.vehicleId,
          expenseDate: sDate,
          category: 'Insurance',
          amount: premium,
          description: `Insurance renewal: ${data.insurer} (${data.coverType})`,
          sourceType: 'INSURANCE',
          sourceId: policy.id,
          receiptUrl: data.documentUrl || null,
        },
      });
    }

    return policy;
  }

  static async renewPolicy(userId: string, oldPolicyId: string, newData: any) {
    const oldPolicy = await prisma.insurancePolicy.findFirst({
      where: { id: oldPolicyId, vehicle: { userId } },
    });
    if (!oldPolicy) throw new Error('Previous policy not found or unauthorized');

    // Archive old policy
    await prisma.insurancePolicy.update({
      where: { id: oldPolicyId },
      data: { isActive: false },
    });

    // Create new policy
    return this.createPolicy(userId, {
      ...newData,
      vehicleId: oldPolicy.vehicleId,
      isActive: true,
    });
  }

  static async updatePolicy(userId: string, policyId: string, data: any) {
    const policy = await prisma.insurancePolicy.findFirst({
      where: { id: policyId, vehicle: { userId } },
    });
    if (!policy) throw new Error('Policy not found or unauthorized');

    const premium = data.premium !== undefined ? Number(data.premium) : policy.premium;
    const sDate = data.startDate ? new Date(data.startDate) : policy.startDate;

    const updated = await prisma.insurancePolicy.update({
      where: { id: policyId },
      data: {
        ...(data.insurer ? { insurer: data.insurer.trim() } : {}),
        ...(data.policyNumber ? { policyNumber: data.policyNumber.trim() } : {}),
        ...(data.coverType ? { coverType: data.coverType } : {}),
        ...(data.premium !== undefined ? { premium } : {}),
        ...(data.idv !== undefined ? { idv: data.idv ? Number(data.idv) : null } : {}),
        ...(data.startDate ? { startDate: sDate } : {}),
        ...(data.expiryDate ? { expiryDate: new Date(data.expiryDate) } : {}),
        ...(data.documentUrl !== undefined ? { documentUrl: data.documentUrl } : {}),
        ...(data.notes !== undefined ? { notes: data.notes?.trim() || null } : {}),
        ...(data.isActive !== undefined ? { isActive: Boolean(data.isActive) } : {}),
      },
    });

    // Update linked expense
    const linkedExpense = await prisma.expense.findFirst({
      where: { sourceType: 'INSURANCE', sourceId: policyId },
    });

    if (linkedExpense) {
      await prisma.expense.update({
        where: { id: linkedExpense.id },
        data: {
          amount: premium,
          expenseDate: sDate,
          description: `Insurance: ${updated.insurer} (${updated.coverType})`,
          receiptUrl: updated.documentUrl || linkedExpense.receiptUrl,
        },
      });
    }

    return updated;
  }

  static async deletePolicy(userId: string, policyId: string) {
    const policy = await prisma.insurancePolicy.findFirst({
      where: { id: policyId, vehicle: { userId } },
    });
    if (!policy) throw new Error('Policy not found or unauthorized');

    // Delete linked expense
    await prisma.expense.deleteMany({
      where: { sourceType: 'INSURANCE', sourceId: policyId },
    });

    await prisma.insurancePolicy.delete({
      where: { id: policyId },
    });

    return { success: true, message: 'Policy and linked expense deleted successfully' };
  }

  static async getPremiumComparison(userId: string, vehicleId?: string) {
    const where: any = {
      vehicle: { userId },
    };
    if (vehicleId) where.vehicleId = vehicleId;

    const policies = await prisma.insurancePolicy.findMany({
      where,
      orderBy: { startDate: 'asc' },
      select: {
        id: true,
        startDate: true,
        expiryDate: true,
        premium: true,
        insurer: true,
        vehicle: { select: { nickname: true, registrationNumber: true } },
      },
    });

    return policies.map((p) => ({
      id: p.id,
      year: new Date(p.startDate).getFullYear(),
      premium: p.premium,
      insurer: p.insurer,
      vehicle: p.vehicle.nickname,
    }));
  }
}

