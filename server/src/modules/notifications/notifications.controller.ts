import { Response } from 'express';
import { NotificationsService } from './notifications.service';

export class NotificationsController {
  static async getAll(req: any, res: Response) {
    try {
      const { category, isRead } = req.query;
      const data = await NotificationsService.getNotifications(req.user.id, {
        category: category as string,
        isRead: isRead !== undefined ? isRead === 'true' : undefined,
      });
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async markRead(req: any, res: Response) {
    try {
      await NotificationsService.markAsRead(req.user.id, req.params.id);
      return res.json({ success: true, message: 'Notification marked as read' });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async markAllRead(req: any, res: Response) {
    try {
      await NotificationsService.markAllAsRead(req.user.id);
      return res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async dismiss(req: any, res: Response) {
    try {
      await NotificationsService.dismiss(req.user.id, req.params.id);
      return res.json({ success: true, message: 'Notification dismissed' });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async sync(req: any, res: Response) {
    try {
      const result = await NotificationsService.syncReminders(req.user.id);
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

