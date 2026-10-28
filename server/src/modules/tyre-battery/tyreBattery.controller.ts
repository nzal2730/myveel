import { Response } from 'express';
import { TyreBatteryService } from './tyreBattery.service';

export class TyreBatteryController {
  static async getAll(req: any, res: Response) {
    try {
      const { vehicleId, itemType } = req.query;
      const items = await TyreBatteryService.getItems(
        req.user.id,
        vehicleId as string,
        itemType as string
      );
      return res.json({ success: true, data: items });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getById(req: any, res: Response) {
    try {
      const item = await TyreBatteryService.getById(req.user.id, req.params.id);
      return res.json({ success: true, data: item });
    } catch (err: any) {
      return res.status(404).json({ success: false, message: err.message });
    }
  }

  static async create(req: any, res: Response) {
    try {
      const {
        vehicleId,
        itemType,
        brand,
        model,
        position,
        sizeOrSerial,
        installedDate,
        installedOdometer,
        replacementDueAgeMonths,
        replacementDueKm,
        notes,
      } = req.body;

      if (!vehicleId || !itemType || !brand || !model || !installedDate) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle, item type, brand, model, and installed date are required.',
        });
      }

      const item = await TyreBatteryService.createItem(req.user.id, {
        vehicleId,
        itemType,
        brand,
        model,
        position,
        sizeOrSerial,
        installedDate,
        installedOdometer,
        replacementDueAgeMonths,
        replacementDueKm,
        notes,
      });

      return res.status(201).json({
        success: true,
        message: `${itemType === 'TYRE' ? 'Tyre' : 'Battery'} recorded successfully.`,
        data: item,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async update(req: any, res: Response) {
    try {
      const updated = await TyreBatteryService.updateItem(req.user.id, req.params.id, req.body);
      return res.json({
        success: true,
        message: 'Record updated successfully.',
        data: updated,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async logAction(req: any, res: Response) {
    try {
      const { action } = req.body; // 'ROTATE' or 'ALIGN'
      if (!action || !['ROTATE', 'ALIGN'].includes(action)) {
        return res
          .status(400)
          .json({ success: false, message: 'Valid action (ROTATE or ALIGN) required.' });
      }
      const updated = await TyreBatteryService.logAction(req.user.id, req.params.id, action);
      return res.json({
        success: true,
        message: `${action === 'ROTATE' ? 'Tyre rotation' : 'Wheel alignment'} logged.`,
        data: updated,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async delete(req: any, res: Response) {
    try {
      const result = await TyreBatteryService.deleteItem(req.user.id, req.params.id);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}

