import { Response } from 'express';
import { CareService } from './care.service';

export class CareController {
  static async getAll(req: any, res: Response) {
    try {
      const { vehicleId } = req.query;
      const schedules = await CareService.getSchedules(req.user.id, vehicleId as string);
      return res.json({ success: true, data: schedules });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async create(req: any, res: Response) {
    try {
      const { vehicleId, title, careType, scheduledDate, recurrence, notes } = req.body;
      if (!title || !careType || !scheduledDate) {
        return res.status(400).json({
          success: false,
          message: 'Title, care type, and scheduled date are required.',
        });
      }

      const schedule = await CareService.createSchedule(req.user.id, {
        vehicleId,
        title,
        careType,
        scheduledDate,
        recurrence,
        notes,
      });

      return res.status(201).json({
        success: true,
        message: 'Care schedule created successfully.',
        data: schedule,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async complete(req: any, res: Response) {
    try {
      const updated = await CareService.completeSchedule(req.user.id, req.params.id);
      return res.json({
        success: true,
        message: 'Care task marked as completed.',
        data: updated,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async reschedule(req: any, res: Response) {
    try {
      const { scheduledDate } = req.body;
      if (!scheduledDate) {
        return res.status(400).json({ success: false, message: 'New scheduled date is required' });
      }
      const updated = await CareService.reschedule(req.user.id, req.params.id, scheduledDate);
      return res.json({
        success: true,
        message: 'Task rescheduled successfully.',
        data: updated,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async delete(req: any, res: Response) {
    try {
      const result = await CareService.deleteSchedule(req.user.id, req.params.id);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}

