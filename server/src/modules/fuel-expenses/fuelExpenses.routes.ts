import { Router } from 'express';
import { FuelExpensesController } from './fuelExpenses.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate as any);

// Fuel routes
router.get('/fuel', FuelExpensesController.getFuelLogs);
router.post('/fuel', FuelExpensesController.addFuelLog);
router.delete('/fuel/:id', FuelExpensesController.deleteFuelLog);

// Expenses routes
router.get('/expenses', FuelExpensesController.getExpenses);
router.post('/expenses', FuelExpensesController.addManualExpense);
router.delete('/expenses/:id', FuelExpensesController.deleteExpense);

export default router;

