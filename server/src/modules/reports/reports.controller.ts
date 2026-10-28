import { Response } from 'express';
import prisma from '../../config/db';
import { generateVehicleReportPdf } from './pdfGenerator';

export class ReportsController {
  static async generateReport(req: any, res: Response) {
    try {
      const { vehicleId } = req.params;
      const {
        profile = 'true',
        services = 'true',
        odometer = 'true',
        documents = 'true',
        insurance = 'true',
        fuel = 'true',
        expenses = 'true',
      } = req.query;

      // Ownership enforcement
      const vehicle = await prisma.vehicle.findFirst({
        where: { id: vehicleId, userId: req.user.id },
        include: {
          serviceRecords: { orderBy: { serviceDate: 'desc' } },
          odometerReadings: { orderBy: { readingDate: 'desc' } },
          documents: { orderBy: { expiryDate: 'asc' } },
          insurancePolicies: { orderBy: { expiryDate: 'desc' } },
          fuelLogs: { orderBy: { logDate: 'desc' } },
          expenses: { orderBy: { expenseDate: 'desc' } },
        },
      });

      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found or you do not have permission to generate this report.',
        });
      }

      const fileName = `MyVeel_Report_${vehicle.registrationNumber}_${
        new Date().toISOString().split('T')[0]
      }.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

      generateVehicleReportPdf(
        {
          vehicle,
          sections: {
            profile: profile === 'true',
            services: services === 'true',
            odometer: odometer === 'true',
            documents: documents === 'true',
            insurance: insurance === 'true',
            fuel: fuel === 'true',
            expenses: expenses === 'true',
          },
        },
        res
      );
    } catch (err: any) {
      console.error('Error generating PDF report:', err);
      return res.status(500).json({ success: false, message: 'Failed to generate PDF report.' });
    }
  }
}

