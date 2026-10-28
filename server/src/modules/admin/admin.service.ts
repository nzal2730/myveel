import prisma from '../../config/db';

const recentUserSelect = {
  id: true,
  name: true,
  email: true,
  mobile: true,
  role: true,
  avatar: true,
  isEmailVerified: true,
  isMobileVerified: true,
  createdAt: true,
  _count: { select: { vehicles: true } },
};

const recentVehicleSelect = {
  id: true,
  nickname: true,
  make: true,
  model: true,
  year: true,
  registrationNumber: true,
  vehicleType: true,
  fuelType: true,
  currentOdometer: true,
  photo: true,
  createdAt: true,
  user: { select: { id: true, name: true, email: true } },
};

export class AdminService {
  static async getOverview() {
    const [
      totalUsers,
      verifiedUsers,
      totalAdmins,
      totalVehicles,
      totalServices,
      totalDocuments,
      totalInsurancePolicies,
      totalFuelLogs,
      totalExpenses,
      totalCareTasks,
      recentUsers,
      recentVehicles,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isEmailVerified: true } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.vehicle.count(),
      prisma.serviceRecord.count(),
      prisma.document.count(),
      prisma.insurancePolicy.count(),
      prisma.fuelLog.count(),
      prisma.expense.count(),
      prisma.careSchedule.count(),
      prisma.user.findMany({
        select: recentUserSelect,
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.vehicle.findMany({
        select: recentVehicleSelect,
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      stats: {
        totalUsers,
        verifiedUsers,
        totalAdmins,
        totalVehicles,
        totalRecords:
          totalServices +
          totalDocuments +
          totalInsurancePolicies +
          totalFuelLogs +
          totalExpenses +
          totalCareTasks,
        totalServices,
        totalDocuments,
        totalInsurancePolicies,
        totalFuelLogs,
        totalExpenses,
        totalCareTasks,
      },
      recentUsers,
      recentVehicles,
    };
  }

  static async getUsers(search?: string) {
    const term = search?.trim();
    return prisma.user.findMany({
      where: term
        ? {
            OR: [
              { name: { contains: term } },
              { email: { contains: term } },
              { mobile: { contains: term } },
            ],
          }
        : undefined,
      select: {
        ...recentUserSelect,
        _count: {
          select: {
            vehicles: true,
            notifications: true,
            careSchedules: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateUserRole(adminId: string, userId: string, role: string) {
    if (!['USER', 'ADMIN'].includes(role)) {
      throw new Error('Role must be either USER or ADMIN.');
    }
    if (adminId === userId && role !== 'ADMIN') {
      throw new Error('You cannot remove your own admin access.');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found.');

    return prisma.user.update({
      where: { id: userId },
      data: { role },
      select: recentUserSelect,
    });
  }

  static async updateUserVerification(
    userId: string,
    data: { isEmailVerified?: boolean; isMobileVerified?: boolean }
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found.');

    return prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.isEmailVerified !== undefined
          ? { isEmailVerified: Boolean(data.isEmailVerified) }
          : {}),
        ...(data.isMobileVerified !== undefined
          ? { isMobileVerified: Boolean(data.isMobileVerified) }
          : {}),
      },
      select: recentUserSelect,
    });
  }

  static async deleteUser(adminId: string, userId: string) {
    if (adminId === userId) {
      throw new Error('You cannot delete your own admin account.');
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found.');

    await prisma.user.delete({ where: { id: userId } });
    return { success: true, message: 'User account deleted.' };
  }

  static async deleteVehicle(vehicleId: string) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new Error('Vehicle not found.');

    await prisma.vehicle.delete({ where: { id: vehicleId } });
    return { success: true, message: 'Vehicle and related records deleted.' };
  }

  static async getVehicles(search?: string) {
    const term = search?.trim();
    return prisma.vehicle.findMany({
      where: term
        ? {
            OR: [
              { nickname: { contains: term } },
              { registrationNumber: { contains: term } },
              { make: { contains: term } },
              { model: { contains: term } },
            ],
          }
        : undefined,
      select: {
        ...recentVehicleSelect,
        notes: true,
        _count: {
          select: {
            serviceRecords: true,
            documents: true,
            fuelLogs: true,
            expenses: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
