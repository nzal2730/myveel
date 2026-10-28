import { Response } from 'express';
import { ServicesService } from './services.service';

export class ServicesController {
  static async getAll(req: any, res: Response) {
    try {
      const { vehicleId, serviceType, startDate, endDate } = req.query;
      const services = await ServicesService.getAllServices(req.user.id, {
        vehicleId: vehicleId as string,
        serviceType: serviceType as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });
      return res.json({ success: true, data: services });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getById(req: any, res: Response) {
    try {
      const service = await ServicesService.getServiceById(req.user.id, req.params.id);
      return res.json({ success: true, data: service });
    } catch (err: any) {
      return res.status(404).json({ success: false, message: err.message });
    }
  }

  static async create(req: any, res: Response) {
    try {
      const {
        vehicleId,
        serviceDate,
        serviceType,
        workshopName,
        description,
        partsReplaced,
        cost,
        odometer,
        invoiceUrl,
        nextDueMonths,
        nextDueKm,
      } = req.body;

      if (!vehicleId || !serviceDate || !serviceType || !workshopName) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle, service date, service type, and workshop name are required.',
        });
      }

      const service = await ServicesService.createService(req.user.id, {
        vehicleId,
        serviceDate,
        serviceType,
        workshopName,
        description: description || '',
        partsReplaced,
        cost: Number(cost) || 0,
        odometer: Number(odometer) || 0,
        invoiceUrl,
        nextDueMonths: nextDueMonths ? Number(nextDueMonths) : undefined,
        nextDueKm: nextDueKm ? Number(nextDueKm) : undefined,
      });

      return res.status(201).json({
        success: true,
        message: 'Service record logged and expense linked successfully.',
        data: service,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async update(req: any, res: Response) {
    try {
      const updated = await ServicesService.updateService(req.user.id, req.params.id, req.body);
      return res.json({
        success: true,
        message: 'Service record updated successfully.',
        data: updated,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async delete(req: any, res: Response) {
    try {
      const result = await ServicesService.deleteService(req.user.id, req.params.id);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async getReminders(req: any, res: Response) {
    try {
      const { vehicleId } = req.query;
      const reminders = await ServicesService.getReminders(req.user.id, vehicleId as string);
      return res.json({ success: true, data: reminders });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async completeReminder(req: any, res: Response) {
    try {
      const updated = await ServicesService.completeReminder(req.user.id, req.params.id);
      return res.json({
        success: true,
        message: 'Reminder marked as completed.',
        data: updated,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}

