import { Router } from 'express';
import adminRoutes from './admin-routes';
import authRoutes from './auth-routes';
import availabilityRoutes from './availability-routes';
import appointmentRoutes from './appointment-routes';
import calendarRoutes from './calendar-routes';
import clientRoutes from './client-routes';
import clientPhotoRoutes from './client-photo-routes';
import dashboardRoutes from './dashboard-routes';
import expenseRoutes from './expense-routes';
import inventoryRoutes from './inventory-routes';
import procedureTypeRoutes from './procedure-type-routes';
import procedureTypeProductRoutes from './procedure-type-product-routes';
import productRoutes from './product-routes';
import profitRoutes from './profit-routes';
import serviceRoutes from './service-routes';
import stockPurchaseRoutes from './stock-purchase-routes';

const router = Router();

router.use('/admin', adminRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/auth', authRoutes);
router.use('/availability', availabilityRoutes);
router.use('/calendar', calendarRoutes);
router.use('/clients', clientRoutes);
router.use('/clients/:clientId/photos', clientPhotoRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/expenses', expenseRoutes);
router.use('/products', productRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/procedure-types', procedureTypeRoutes);
router.use('/procedure-types/:procedureTypeId/products', procedureTypeProductRoutes);
router.use('/profits', profitRoutes);
router.use('/services', serviceRoutes);
router.use('/stock-purchases', stockPurchaseRoutes);

export default router;
