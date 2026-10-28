import { Response } from 'express';
import { LicenceService } from './licence.service';

export class LicenceController {
  static async get(req: any, res: Response) {
    try {
      const licence = await LicenceService.getLicence(req.user.id);
      return res.json({ success: true, data: licence });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async save(req: any, res: Response) {
    try {
      const {
        licenceNumber,
        vehicleClasses,
        issueDate,
        expiryDate,
        issuingAuthority,
        bloodGroup,
        documentUrl,
      } = req.body;

      if (!licenceNumber || !vehicleClasses || !issueDate || !expiryDate) {
        return res.status(400).json({
          success: false,
          message:
            'Licence number, vehicle classes, issue date, and expiry date are required.',
        });
      }

      const licence = await LicenceService.saveLicence(req.user.id, {
        licenceNumber,
        vehicleClasses,
        issueDate,
        expiryDate,
        issuingAuthority,
        bloodGroup,
        documentUrl,
      });

      return res.json({
        success: true,
        message: 'Driving licence saved securely.',
        data: licence,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async delete(req: any, res: Response) {
    try {
      const result = await LicenceService.deleteLicence(req.user.id);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}

