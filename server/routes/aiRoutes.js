import express from 'express';
import { generateResponse } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.post('/respond', generateResponse);

export default router;
