import express from 'express';
import {adminLoginController} from '../controller/controller.js';
import {adminDashboardController} from '../controller/controller.js';
import { authPostMiddleware } from '../Middleware/auth.js';
import {isAuthenticated} from '../Middleware/auth.js';
import {getUnreadCount, getBookings, markAllNotificationsRead, getBookingById, approveBooking, deleteBooking} from '../controller/controller.js';

const router = express.Router();

router.get("/", adminLoginController);

router.get("/dashboard", isAuthenticated, adminDashboardController);
router.get("/api/bookings/unread-count", isAuthenticated, getUnreadCount);
router.get("/api/bookings", isAuthenticated, getBookings);
router.get("/api/bookings/:id", isAuthenticated, getBookingById);
router.post("/api/bookings/read-all", isAuthenticated, markAllNotificationsRead);
router.post("/api/bookings/:id/approve", isAuthenticated, approveBooking);
router.delete("/api/bookings/:id", isAuthenticated, deleteBooking);



// POST ROUTES
router.post("/login", authPostMiddleware);

export default router;

