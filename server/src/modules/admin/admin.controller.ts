import { Response } from 'express';
import { AdminService } from './admin.service';

export class AdminController {
  static async getOverview(_req: any, res: Response) {
    try {
      const data = await AdminService.getOverview();
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getUsers(req: any, res: Response) {
    try {
      const data = await AdminService.getUsers(req.query.search as string | undefined);
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getVehicles(req: any, res: Response) {
    try {
      const data = await AdminService.getVehicles(req.query.search as string | undefined);
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async updateUserRole(req: any, res: Response) {
    try {
      const data = await AdminService.updateUserRole(
        req.user.id,
        req.params.id,
        req.body.role
      );
      return res.json({ success: true, message: 'User role updated.', data });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async updateUserVerification(req: any, res: Response) {
    try {
      const data = await AdminService.updateUserVerification(req.params.id, req.body);
      return res.json({ success: true, message: 'Verification status updated.', data });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async deleteUser(req: any, res: Response) {
    try {
      const data = await AdminService.deleteUser(req.user.id, req.params.id);
      return res.json({ success: true, ...data });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async deleteVehicle(req: any, res: Response) {
    try {
      const data = await AdminService.deleteVehicle(req.params.id);
      return res.json({ success: true, ...data });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}
