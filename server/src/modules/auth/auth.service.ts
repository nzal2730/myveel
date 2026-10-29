import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/db';
import { env } from '../../config/env';
import { generateOtp, hashOtp, verifyOtpHash } from '../../utils/otp';

export class AuthService {
  static async register(data: { name: string; email: string; mobile: string; password: string }) {
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });
    if (existingEmail) {
      throw new Error('An account with this email address already exists.');
    }

    const existingMobile = await prisma.user.findUnique({
      where: { mobile: data.mobile.trim() },
    });
    if (existingMobile) {
      throw new Error('An account with this mobile number already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        mobile: data.mobile.trim(),
        passwordHash,
        isEmailVerified: true,
        isMobileVerified: true,
        settings: {
          create: {
            emailAlerts: true,
            smsAlerts: false,
            distanceUnit: 'km',
            currency: '₹',
            reminderDaysBefore: '30,15,7',
          },
        },
      },
      include: { settings: true },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    let devOtps: { emailOtp?: string; smsOtp?: string } | undefined;
    if (env.NODE_ENV === 'development') {
      try {
        const emailOtp = await this.createOtp(user.email, 'REGISTER_EMAIL');
        const smsOtp = await this.createOtp(user.mobile, 'REGISTER_SMS');
        devOtps = { emailOtp, smsOtp };
      } catch {
        // development OTP generation is non-blocking
      }
    }

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        avatar: user.avatar,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isMobileVerified: user.isMobileVerified,
        settings: user.settings,
      },
      devOtps,
    };
  }

  static async createOtp(target: string, type: string) {
    const normalizedTarget = target.trim().toLowerCase();

    // Check resend cooldown: 60 seconds
    const recentOtp = await prisma.otpCode.findFirst({
      where: {
        target: normalizedTarget,
        type,
        createdAt: { gte: new Date(Date.now() - 60 * 1000) },
      },
    });

    if (recentOtp) {
      throw new Error('Please wait 60 seconds before requesting a new OTP.');
    }

    const rawOtp = generateOtp();
    const codeHash = hashOtp(rawOtp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.otpCode.create({
      data: {
        target: normalizedTarget,
        type,
        codeHash,
        expiresAt,
        attempts: 0,
        used: false,
      },
    });

    console.log(`[MYVEEL-OTP] Target: ${normalizedTarget} | Type: ${type} | Code: ${rawOtp}`);
    return rawOtp;
  }

  static async verifyOtp(target: string, type: string, otp: string) {
    const normalizedTarget = target.trim().toLowerCase();

    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        target: normalizedTarget,
        type,
        used: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new Error('No active OTP found. Please request a new one.');
    }

    if (new Date() > otpRecord.expiresAt) {
      throw new Error('OTP has expired. Please request a new one.');
    }

    if (otpRecord.attempts >= 5) {
      throw new Error('Too many failed attempts. Please request a new OTP.');
    }

    const isValid = verifyOtpHash(otp, otpRecord.codeHash);
    if (!isValid) {
      await prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      throw new Error('Invalid OTP. Please check and try again.');
    }

    // Mark OTP as used
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    // If registration verification, update user status
    if (type === 'REGISTER_EMAIL') {
      await prisma.user.updateMany({
        where: { email: normalizedTarget },
        data: { isEmailVerified: true },
      });
    } else if (type === 'REGISTER_SMS') {
      await prisma.user.updateMany({
        where: { mobile: normalizedTarget },
        data: { isMobileVerified: true },
      });
    }

    return { success: true, message: 'OTP verified successfully' };
  }

  static async login(identifier: string, password: string) {
    const cleanId = identifier.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanId }, { mobile: cleanId }],
      },
      include: { settings: true },
    });

    if (!user) {
      throw new Error('Invalid email/mobile or password.');
    }

    let isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      // Allow demo accounts to also accept common demo passwords for convenience
      const demoPwds = ['123456', 'password123', 'Demo@1234', 'Demo1234', 'demo123'];
      const demoEmails = [
        'demo@myveel.app',
        'user@myveel.com',
        'demouser@myveel.com',
        'demo@myveel.dev',
      ];
      if (demoEmails.includes(user.email.toLowerCase()) && demoPwds.includes(password)) {
        isMatch = true;
      }
    }
    if (!isMatch) {
      throw new Error('Invalid email/mobile or password.');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        avatar: user.avatar,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isMobileVerified: user.isMobileVerified,
        settings: user.settings,
      },
    };
  }

  static async forgotPassword(target: string) {
    const cleanTarget = target.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanTarget }, { mobile: cleanTarget }],
      },
    });

    if (!user) {
      // Don't disclose user existence, but return generic success
      return { success: true, message: 'If an account exists, a reset code was generated.' };
    }

    const otp = await this.createOtp(user.email, 'PASSWORD_RESET');
    return {
      success: true,
      message: 'Reset code generated successfully.',
      target: user.email,
      devOtp: env.NODE_ENV === 'development' ? otp : undefined,
    };
  }

  static async resetPassword(target: string, otp: string, newPass: string) {
    const cleanTarget = target.trim().toLowerCase();
    await this.verifyOtp(cleanTarget, 'PASSWORD_RESET', otp);

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPass, salt);

    await prisma.user.update({
      where: { email: cleanTarget },
      data: { passwordHash },
    });

    return { success: true, message: 'Password has been reset successfully.' };
  }

  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        settings: true,
        _count: {
          select: { vehicles: true, notifications: { where: { isRead: false } } },
        },
      },
    });

    if (!user) throw new Error('User not found');

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      avatar: user.avatar,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isMobileVerified: user.isMobileVerified,
      settings: user.settings,
      unreadNotificationsCount: user._count.notifications,
      vehicleCount: user._count.vehicles,
    };
  }
}
