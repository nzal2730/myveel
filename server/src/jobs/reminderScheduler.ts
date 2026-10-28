import cron from 'node-cron';
import prisma from '../config/db';
import { NotificationsService } from '../modules/notifications/notifications.service';

export function startReminderScheduler() {
  console.log('[MYVEEL-SCHEDULER] Daily maintenance & document reminder cron initialized (00:00 midnight).');

  // Schedule to run every day at midnight (0 0 * * *)
  cron.schedule('0 0 * * *', async () => {
    console.log('[MYVEEL-SCHEDULER] Running daily automated vehicle reminder sync...');
    try {
      const users = await prisma.user.findMany({ select: { id: true } });
      for (const u of users) {
        await NotificationsService.syncReminders(u.id);
      }
      console.log(`[MYVEEL-SCHEDULER] Completed daily reminder sync for ${users.length} users.`);
    } catch (err) {
      console.error('[MYVEEL-SCHEDULER] Error executing daily cron:', err);
    }
  });
}

export async function runManualSchedulerSync() {
  const users = await prisma.user.findMany({ select: { id: true } });
  let totalCreated = 0;
  for (const u of users) {
    const res = await NotificationsService.syncReminders(u.id);
    totalCreated += res.createdCount;
  }
  return { totalUsers: users.length, totalCreated };
}

