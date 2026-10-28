import { Response } from 'express';
import { EmergencyService } from './emergency.service';

export class EmergencyController {
  static async getContacts(req: any, res: Response) {
    try {
      const data = await EmergencyService.getContacts(req.user.id);
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async createContact(req: any, res: Response) {
    try {
      const { name, contactType, phone, altPhone, policyOrAccountNo, notes } = req.body;
      if (!name || !contactType || !phone) {
        return res.status(400).json({
          success: false,
          message: 'Contact name, type, and phone number are required.',
        });
      }

      const contact = await EmergencyService.createContact(req.user.id, {
        name,
        contactType,
        phone,
        altPhone,
        policyOrAccountNo,
        notes,
      });

      return res.status(201).json({
        success: true,
        message: 'Emergency contact added successfully.',
        data: contact,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async updateContact(req: any, res: Response) {
    try {
      const updated = await EmergencyService.updateContact(req.user.id, req.params.id, req.body);
      return res.json({
        success: true,
        message: 'Contact updated successfully.',
        data: updated,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async deleteContact(req: any, res: Response) {
    try {
      const result = await EmergencyService.deleteContact(req.user.id, req.params.id);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}

