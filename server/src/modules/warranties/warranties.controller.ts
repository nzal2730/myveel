import { Response } from 'express';
import { WarrantiesService } from './warranties.service';

export class WarrantiesController {
  static async getAll(req: any, res: Response) {
    try {
      const { vehicleId } = req.query;
      const warranties = await WarrantiesService.getAllWarranties(req.user.id, vehicleId as string);
      return res.json({ success: true, data: warranties });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getById(req: any, res: Response) {
    try {
      const warranty = await WarrantiesService.getById(req.user.id, req.params.id);
      return res.json({ success: true, data: warranty });
    } catch (err: any) {
      return res.status(404).json({ success: false, message: err.message });
    }
  }

  static async create(req: any, res: Response) {
    try {
      const {
        vehicleId,
        warrantyType,
        provider,
        coverageNotes,
        startDate,
        expiryDate,
        maxOdometer,
        documentUrl,
      } = req.body;

      if (!vehicleId || !warrantyType || !provider || !startDate || !expiryDate) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle, warranty type, provider, start date, and expiry date are required.',
        });
      }

      const warranty = await WarrantiesService.createWarranty(req.user.id, {
        vehicleId,
        warrantyType,
        provider,
        coverageNotes: coverageNotes || '',
        startDate,
        expiryDate,
        maxOdometer,
        documentUrl,
      });

      return res.status(201).json({
        success: true,
        message: 'Warranty recorded successfully.',
        data: warranty,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async update(req: any, res: Response) {
    try {
      const updated = await WarrantiesService.updateWarranty(req.user.id, req.params.id, req.body);
      return res.json({
        success: true,
        message: 'Warranty updated successfully.',
        data: updated,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async delete(req: any, res: Response) {
    try {
      const result = await WarrantiesService.deleteWarranty(req.user.id, req.params.id);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}

