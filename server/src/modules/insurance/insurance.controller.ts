import { Response } from 'express';
import { InsuranceService } from './insurance.service';

export class InsuranceController {
  static async getAll(req: any, res: Response) {
    try {
      const { vehicleId } = req.query;
      const policies = await InsuranceService.getAllPolicies(req.user.id, vehicleId as string);
      return res.json({ success: true, data: policies });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getById(req: any, res: Response) {
    try {
      const policy = await InsuranceService.getPolicyById(req.user.id, req.params.id);
      return res.json({ success: true, data: policy });
    } catch (err: any) {
      return res.status(404).json({ success: false, message: err.message });
    }
  }

  static async create(req: any, res: Response) {
    try {
      const {
        vehicleId,
        insurer,
        policyNumber,
        coverType,
        premium,
        idv,
        startDate,
        expiryDate,
        documentUrl,
        notes,
        isActive,
      } = req.body;

      if (!vehicleId || !insurer || !policyNumber || !coverType || !startDate || !expiryDate) {
        return res.status(400).json({
          success: false,
          message:
            'Vehicle, insurer, policy number, cover type, start date, and expiry date are required.',
        });
      }

      const policy = await InsuranceService.createPolicy(req.user.id, {
        vehicleId,
        insurer,
        policyNumber,
        coverType,
        premium: Number(premium) || 0,
        idv: idv ? Number(idv) : undefined,
        startDate,
        expiryDate,
        documentUrl,
        notes,
        isActive,
      });

      return res.status(201).json({
        success: true,
        message: 'Insurance policy saved and expense linked successfully.',
        data: policy,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async renew(req: any, res: Response) {
    try {
      const policy = await InsuranceService.renewPolicy(req.user.id, req.params.id, req.body);
      return res.status(201).json({
        success: true,
        message: 'Policy renewed successfully. Previous policy archived into history.',
        data: policy,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async update(req: any, res: Response) {
    try {
      const updated = await InsuranceService.updatePolicy(req.user.id, req.params.id, req.body);
      return res.json({
        success: true,
        message: 'Insurance policy updated successfully.',
        data: updated,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async delete(req: any, res: Response) {
    try {
      const result = await InsuranceService.deletePolicy(req.user.id, req.params.id);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async getComparison(req: any, res: Response) {
    try {
      const { vehicleId } = req.query;
      const data = await InsuranceService.getPremiumComparison(req.user.id, vehicleId as string);
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

