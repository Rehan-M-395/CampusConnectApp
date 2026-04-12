import { Router } from 'express';
import { saveToken, triggerNotification } from '../controllers/notificationController';
import { authenticateRequest } from '../middleware/authMiddleware';

const router = Router();

// POST /api/save-token - Save FCM token (requires auth)
router.post('/save-token', authenticateRequest, saveToken);

// POST /api/trigger-notification - Manually trigger notification (for testing)
router.post('/trigger-notification', authenticateRequest, triggerNotification);

export default router;