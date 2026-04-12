import { Router } from 'express';
import authRoutes from './auth-routes';
import clientRoutes from './client-routes';
import dashboardRoutes from './dashboard-routes';
import expenseRoutes from './expense-routes';
import inventoryRoutes from './inventory-routes';
import procedureTypeRoutes from './procedure-type-routes';
import productRoutes from './product-routes';
import profitRoutes from './profit-routes';
import serviceProductRoutes from './service-product-routes';
import serviceRoutes from './service-routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/expenses', expenseRoutes);
router.use('/products', productRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/procedure-types', procedureTypeRoutes);
router.use('/profits', profitRoutes);
router.use('/services', serviceRoutes);
router.use('/service-products', serviceProductRoutes);

export default router;
