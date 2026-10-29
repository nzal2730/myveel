import bcrypt from 'bcryptjs';
import prisma from '../config/db';
import { SeedService } from '../modules/seed/seed.service';
import { NotificationsService } from '../modules/notifications/notifications.service';

const DEMO_EMAIL = 'demo@myveel.app';
const DEMO_MOBILE = '9876543210';
const DEMO_PASSWORD = 'Demo@1234';

export async function ensureDemoData() {
  let user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });

  if (!user) {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    user = await prisma.user.create({
      data: {
        name: 'Demo User',
        email: DEMO_EMAIL,
        mobile: DEMO_MOBILE,
        passwordHash,
        isEmailVerified: true,
        isMobileVerified: true,
        role: 'ADMIN',
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
    });
    console.log('[MYVEEL-BOOTSTRAP] Demo account created.');
  }

  await SeedService.seedDemoData(user.id);
  await NotificationsService.syncReminders(user.id);

  console.log(`[MYVEEL-BOOTSTRAP] Demo ready — login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  return user;
}
