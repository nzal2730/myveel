import { Response } from 'express';
import { VehiclesService } from './vehicles.service';

export class VehiclesController {
  static async getAll(req: any, res: Response) {
    try {
      const vehicles = await VehiclesService.getAllVehicles(req.user.id);
      return res.json({ success: true, data: vehicles });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getById(req: any, res: Response) {
    try {
      const vehicle = await VehiclesService.getVehicleById(req.user.id, req.params.id);
      return res.json({ success: true, data: vehicle });
    } catch (err: any) {
      return res.status(404).json({ success: false, message: err.message });
    }
  }

  static async create(req: any, res: Response) {
    try {
      const {
        nickname,
        make,
        model,
        year,
        registrationNumber,
        vehicleType,
        fuelType,
        photo,
        notes,
        initialOdometer,
      } = req.body;

      if (!nickname || !make || !model || !year || !registrationNumber) {
        return res.status(400).json({
          success: false,
          message: 'Nickname, make, model, year, and registration number are required.',
        });
      }

      const vehicle = await VehiclesService.createVehicle(req.user.id, {
        nickname,
        make,
        model,
        year: parseInt(year, 10),
        registrationNumber,
        vehicleType,
        fuelType,
        photo,
        notes,
        initialOdometer: initialOdometer ? parseInt(initialOdometer, 10) : 0,
      });

      return res.status(201).json({
        success: true,
        message: 'Vehicle added to your garage successfully.',
        data: vehicle,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async update(req: any, res: Response) {
    try {
      const vehicle = await VehiclesService.updateVehicle(req.user.id, req.params.id, req.body);
      return res.json({
        success: true,
        message: 'Vehicle updated successfully.',
        data: vehicle,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async delete(req: any, res: Response) {
    try {
      const result = await VehiclesService.deleteVehicle(req.user.id, req.params.id);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async uploadPhoto(req: any, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file uploaded' });
      }
      const photoUrl = `/uploads/${req.file.filename}`;
      return res.json({ success: true, photoUrl });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

