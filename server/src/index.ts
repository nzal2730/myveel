import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { startReminderScheduler, runManualSchedulerSync } from './jobs/reminderScheduler';

// Import route modules
import authRoutes from './modules/auth/auth.routes';
import vehiclesRoutes from './modules/vehicles/vehicles.routes';
import odometerRoutes from './modules/odometer/odometer.routes';
import servicesRoutes from './modules/services/services.routes';
import documentsRoutes from './modules/documents/documents.routes';
import insuranceRoutes from './modules/insurance/insurance.routes';
import warrantiesRoutes from './modules/warranties/warranties.routes';
import licenceRoutes from './modules/licence/licence.routes';
import tyreBatteryRoutes from './modules/tyre-battery/tyreBattery.routes';
import fuelExpensesRoutes from './modules/fuel-expenses/fuelExpenses.routes';
import nearbyRoutes from './modules/nearby/nearby.routes';
import careRoutes from './modules/care/care.routes';
import emergencyRoutes from './modules/emergency/emergency.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';
import reportsRoutes from './modules/reports/reports.routes';
import settingsRoutes from './modules/settings/settings.routes';
import seedRoutes from './modules/seed/seed.routes';
import adminRoutes from './modules/admin/admin.routes';

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static uploads directory
app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)));

// Serve static frontend build if present
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// System Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    system: 'MyVeel Smart Garage API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// Manual scheduler trigger for tests and development
app.post('/api/scheduler/trigger', async (_req: Request, res: Response) => {
  try {
    const result = await runManualSchedulerSync();
    res.json({ success: true, message: 'Background reminder job executed manually.', result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mount Modules
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/odometer', odometerRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/warranties', warrantiesRoutes);
app.use('/api/licence', licenceRoutes);
app.use('/api/tyre-battery', tyreBatteryRoutes);
app.use('/api/fuel-expenses', fuelExpensesRoutes);
app.use('/api/nearby', nearbyRoutes);
app.use('/api/care', careRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/admin', adminRoutes);

// Client SPA routing fallback
app.get('*', (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  next();
});

// Error Handling Middleware
app.use(errorHandler);

// Start server (only if not in test mode)
if (process.env.NODE_ENV !== 'test') {
  app.listen(env.PORT, () => {
    console.log(`=======================================================`);
    console.log(` 🚀 MYVEEL BACKEND SERVICE ACTIVE`);
    console.log(` 📡 Listening on: http://localhost:${env.PORT}`);
    console.log(` ⚙️  Environment: ${env.NODE_ENV}`);
    console.log(`=======================================================`);
    // Start background job scheduler
    startReminderScheduler();
  });
}

export default app;

