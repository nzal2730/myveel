import bcrypt from 'bcryptjs';
import prisma from '../config/db';
import { SeedService } from '../modules/seed/seed.service';
import { NotificationsService } from '../modules/notifications/notifications.service';

// Primary demo account (auto-seeded via SEED_DEMO=true)
const DEMO_EMAIL = 'demo@myveel.app';
const DEMO_MOBILE = '9876543210';
const DEMO_PASSWORD = 'Demo@1234';

// Secondary visitor demo account (simple password)
const VISITOR_EMAIL = 'user@myveel.com';
const VISITOR_MOBILE = '9876500001';
const VISITOR_PASSWORD = '123456';

export async function ensureDemoData() {
  // ── 1. Primary demo account (demo@myveel.app / Demo@1234) ──────────────────
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
    console.log('[MYVEEL-BOOTSTRAP] Primary demo account created:', DEMO_EMAIL);
  }

  await SeedService.seedDemoData(user.id);
  await NotificationsService.syncReminders(user.id);

  console.log(
    `[MYVEEL-BOOTSTRAP] Demo ready — login: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`
  );

  // ── 2. Visitor demo account (user@myveel.com / 123456) ──────────────────────
  const mobileExists = await prisma.user.findUnique({
    where: { mobile: VISITOR_MOBILE },
  });

  // Only try to create visitor account if the mobile is free
  if (!mobileExists) {
    let visitor = await prisma.user.findUnique({ where: { email: VISITOR_EMAIL } });

    if (!visitor) {
      const visitorHash = await bcrypt.hash(VISITOR_PASSWORD, 10);
      visitor = await prisma.user.create({
        data: {
          name: 'Alex Carter',
          email: VISITOR_EMAIL,
          mobile: VISITOR_MOBILE,
          passwordHash: visitorHash,
          isEmailVerified: true,
          isMobileVerified: true,
          role: 'USER',
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
      console.log('[MYVEEL-BOOTSTRAP] Visitor demo account created:', VISITOR_EMAIL);
    }

    await SeedService.seedDemoData(visitor.id);
    await NotificationsService.syncReminders(visitor.id);

    console.log(
      `[MYVEEL-BOOTSTRAP] Visitor ready — login: ${VISITOR_EMAIL} / ${VISITOR_PASSWORD}`
    );
  } else if (mobileExists.email !== VISITOR_EMAIL) {
    console.log(
      '[MYVEEL-BOOTSTRAP] Visitor mobile already taken by another account, skipping visitor seed.'
    );
  }

  return user;
}
