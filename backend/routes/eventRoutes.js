import express from 'express';
import { getEvents, createEvents } from "../controller/eventController.js";

const router = express.Router();
router.get('/', getEvents);
router.post('/', createEvents);
export default router;