import { Response } from 'express';
import { SettingsService } from './settings.service';

export class SettingsController {
  static async getSettings(req: any, res: Response) {
    try {
      const data = await SettingsService.getSettings(req.user.id);
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async updateProfile(req: any, res: Response) {
    try {
      const { name, mobile, avatar } = req.body;
      const data = await SettingsService.updateProfile(req.user.id, {
        name,
        mobile,
        avatar,
      });
      return res.json({
        success: true,
        message: 'Profile updated successfully.',
        data,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async changePassword(req: any, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Both current password and new password are required.',
        });
      }
      const result = await SettingsService.changePassword(
        req.user.id,
        currentPassword,
        newPassword
      );
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async updatePreferences(req: any, res: Response) {
    try {
      const { emailAlerts, smsAlerts, distanceUnit, currency, reminderDaysBefore } = req.body;
      const data = await SettingsService.updatePreferences(req.user.id, {
        emailAlerts,
        smsAlerts,
        distanceUnit,
        currency,
        reminderDaysBefore,
      });
      return res.json({
        success: true,
        message: 'Garage preferences saved.',
        data,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}

