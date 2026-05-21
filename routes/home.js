import express from 'express';
import { homePageController } from '../controller/controller.js';
import { bookingController } from '../controller/controller.js';
const router = express.Router();


router.get("/", homePageController);

// POST ROUTES CLIENT SIDE


router.post("/book-appointment", bookingController);

export default router;