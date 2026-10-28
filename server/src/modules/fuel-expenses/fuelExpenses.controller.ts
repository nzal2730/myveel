import { Response } from 'express';
import { FuelExpensesService } from './fuelExpenses.service';

export class FuelExpensesController {
  static async getFuelLogs(req: any, res: Response) {
    try {
      const { vehicleId } = req.query;
      const data = await FuelExpensesService.getFuelLogs(req.user.id, vehicleId as string);
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async addFuelLog(req: any, res: Response) {
    try {
      const {
        vehicleId,
        logDate,
        fuelType,
        quantity,
        totalCost,
        pricePerUnit,
        odometer,
        isFullTank,
        notes,
      } = req.body;

      if (
        !vehicleId ||
        quantity === undefined ||
        totalCost === undefined ||
        odometer === undefined
      ) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle, quantity, total cost, and odometer reading are required.',
        });
      }

      const log = await FuelExpensesService.addFuelLog(req.user.id, {
        vehicleId,
        logDate,
        fuelType,
        quantity,
        totalCost,
        pricePerUnit,
        odometer,
        isFullTank,
        notes,
      });

      return res.status(201).json({
        success: true,
        message: 'Fuel fill-up recorded and expense synced successfully.',
        data: log,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async deleteFuelLog(req: any, res: Response) {
    try {
      const result = await FuelExpensesService.deleteFuelLog(req.user.id, req.params.id);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async getExpenses(req: any, res: Response) {
    try {
      const { vehicleId, category, startDate, endDate } = req.query;
      const data = await FuelExpensesService.getExpenses(req.user.id, {
        vehicleId: vehicleId as string,
        category: category as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });
      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async addManualExpense(req: any, res: Response) {
    try {
      const { vehicleId, expenseDate, category, amount, description, receiptUrl } = req.body;
      if (!vehicleId || amount === undefined || !description) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle, amount, and description are required.',
        });
      }

      const expense = await FuelExpensesService.addManualExpense(req.user.id, {
        vehicleId,
        expenseDate,
        category,
        amount,
        description,
        receiptUrl,
      });

      return res.status(201).json({
        success: true,
        message: 'Expense recorded successfully.',
        data: expense,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async deleteExpense(req: any, res: Response) {
    try {
      const result = await FuelExpensesService.deleteExpense(req.user.id, req.params.id);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}

