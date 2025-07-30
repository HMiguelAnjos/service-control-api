import { Router } from 'express';
import expenseRoutes from './expense-routes';
import clientRoutes from './client-routes';
import inventoryRoutes from './inventory-routes';
import procedureTypeRoutes from './procedure-type-routes';
import productRoutes from './product-routes';
import profitRoutes from './profit-routes';
import serviceProductRoutes from './service-product-routes';
import serviceRoutes from './service-routes';

const router = Router();

router.use('/expenses', expenseRoutes);
router.use('/clients', clientRoutes);
router.use('/products', productRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/procedure-types', procedureTypeRoutes);
router.use('/profits', profitRoutes);
router.use('/services', serviceRoutes);
router.use('/service-products', serviceProductRoutes);

export default router;
