import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import db from '../config/database.js';
import { generateId, getCurrentTimestamp, parseJSON, stringifyJSON } from '../utils/helpers.js';

const router = express.Router();

// Create activity log (helper function)
export const logActivity = (userId, userEmail, action, resource, resourceId = null, details = null) => {
  try {
    const logId = generateId();
    const now = getCurrentTimestamp();
    
    const log = {
      id: logId,
      user_id: userId,
      user_email: userEmail,
      action,
      resource,
      resource_id: resourceId,
      details: details ? stringifyJSON(details) : null,
      timestamp: now,
    };

    await db.createActivityLog(log);
  } catch (error) {
    console.error('Log activity error:', error);
  }
};

// Get activity logs
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const userId = req.query.userId || null;

    const logs = await db.getActivityLogs(limit, userId);
    
    res.json(logs.map(log => ({
      id: log.id,
      userId: log.user_id,
      userEmail: log.user_email,
      action: log.action,
      resource: log.resource,
      resourceId: log.resource_id,
      details: log.details ? parseJSON(log.details, {}) : null,
      timestamp: log.timestamp,
    })));
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

export default router;
