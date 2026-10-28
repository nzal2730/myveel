import { Response } from 'express';
import { OdometerService } from './odometer.service';

export class OdometerController {
  static async getReadings(req: any, res: Response) {
    try {
      const { vehicleId } = req.query;
      if (!vehicleId) {
        return res.status(400).json({ success: false, message: 'vehicleId is required' });
      }
      const data = await OdometerService.getReadings(req.user.id, vehicleId as string);
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async addReading(req: any, res: Response) {
    try {
      const { vehicleId, reading, readingDate, isCorrection, notes } = req.body;
      if (!vehicleId || reading === undefined) {
        return res.status(400).json({ success: false, message: 'vehicleId and reading are required' });
      }
      const record = await OdometerService.addReading(req.user.id, {
        vehicleId,
        reading,
        readingDate,
        isCorrection,
        notes,
      });
      return res.status(201).json({
        success: true,
        message: 'Odometer reading saved successfully.',
        data: record,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async deleteReading(req: any, res: Response) {
    try {
      const result = await OdometerService.deleteReading(req.user.id, req.params.id);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}

