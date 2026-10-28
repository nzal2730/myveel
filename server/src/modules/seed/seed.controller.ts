import { Response } from 'express';
import { SeedService } from './seed.service';
import { NotificationsService } from '../notifications/notifications.service';

export class SeedController {
  static async seed(req: any, res: Response) {
    try {
      const result = await SeedService.seedDemoData(req.user.id);
      // Run reminder sync so notification center populates immediately with the seeded upcoming items!
      await NotificationsService.syncReminders(req.user.id);
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async clear(req: any, res: Response) {
    try {
      const result = await SeedService.clearDemoData(req.user.id);
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

