import bcrypt from 'bcryptjs';
import prisma from '../../config/db';

export class SettingsService {
  static async getSettings(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { settings: true },
    });
    if (!user) throw new Error('User not found');

    return {
      profile: {
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        isMobileVerified: user.isMobileVerified,
      },
      preferences: user.settings || {
        emailAlerts: true,
        smsAlerts: false,
        distanceUnit: 'km',
        currency: '₹',
        reminderDaysBefore: '30,15,7',
      },
    };
  }

  static async updateProfile(userId: string, data: any) {
    if (data.mobile) {
      const existing = await prisma.user.findFirst({
        where: { mobile: data.mobile.trim(), id: { not: userId } },
      });
      if (existing) throw new Error('Mobile number is already used by another account.');
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.mobile ? { mobile: data.mobile.trim() } : {}),
        ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
      },
    });

    return {
      name: updated.name,
      email: updated.email,
      mobile: updated.mobile,
      avatar: updated.avatar,
    };
  }

  static async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(currentPass, user.passwordHash);
    if (!isMatch) throw new Error('Current password is incorrect.');
    if (newPass.length < 6) throw new Error('New password must be at least 6 characters.');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPass, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { success: true, message: 'Password changed successfully.' };
  }

  static async updatePreferences(userId: string, data: any) {
    const updated = await prisma.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        emailAlerts: data.emailAlerts !== undefined ? Boolean(data.emailAlerts) : true,
        smsAlerts: data.smsAlerts !== undefined ? Boolean(data.smsAlerts) : false,
        distanceUnit: data.distanceUnit || 'km',
        currency: data.currency || '₹',
        reminderDaysBefore: data.reminderDaysBefore || '30,15,7',
      },
      update: {
        ...(data.emailAlerts !== undefined ? { emailAlerts: Boolean(data.emailAlerts) } : {}),
        ...(data.smsAlerts !== undefined ? { smsAlerts: Boolean(data.smsAlerts) } : {}),
        ...(data.distanceUnit ? { distanceUnit: data.distanceUnit } : {}),
        ...(data.currency ? { currency: data.currency } : {}),
        ...(data.reminderDaysBefore ? { reminderDaysBefore: data.reminderDaysBefore } : {}),
      },
    });

    return updated;
  }
}

