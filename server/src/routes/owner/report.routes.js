import { Router } from 'express';
import { revenue, fleet, bookings, csv, dashboardStats } from '../../controllers/report.controller.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { USER_ROLES } from '../../utils/constants.js';

const router = Router();

router.use(protect, restrictTo(USER_ROLES.OWNER));

router.get('/dashboard', dashboardStats);
router.get('/revenue', revenue);
router.get('/fleet', fleet);
router.get('/bookings', bookings);
router.get('/export', csv);

export default router;
