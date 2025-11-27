import express from 'express';
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import db from '../config/database.js';
import { generateId, getCurrentTimestamp, parseJSON, stringifyJSON } from '../utils/helpers.js';
import { logActivity } from './activityLogs.js';

const router = express.Router();

// Create user (admin only)
router.post('/', authenticateToken, requireAdmin, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('displayName').trim().notEmpty(),
  body('role').isIn(['customer', 'admin', 'super_admin', 'manager', 'inventory_manager', 'sales_person']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, displayName, role, permissions } = req.body;

    // Check if user exists
    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userId = generateId();
    const now = getCurrentTimestamp();

    const user = {
      id: userId,
      email,
      password_hash: passwordHash,
      display_name: displayName,
      role: role || 'customer',
      permissions: permissions ? stringifyJSON(permissions) : null,
      created_at: now,
      updated_at: now,
    };

    db.createUser(user);

    // Log activity
    logActivity(
      req.user.id,
      req.user.email,
      'create',
      'user',
      userId,
      { email, displayName, role: role || 'customer' }
    );

    res.status(201).json({
      id: userId,
      email,
      displayName,
      role: role || 'customer',
      permissions: permissions || [],
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const users = db.getUsers().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    res.json(users.map(user => ({
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      role: user.role,
      permissions: user.permissions ? parseJSON(user.permissions, []) : [],
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    })));
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user role
router.put('/:id/role', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { role, permissions } = req.body;
    const validRoles = ['customer', 'manager', 'admin', 'super_admin', 'inventory_manager', 'sales_person'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = db.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const now = getCurrentTimestamp();
    const updated = db.updateUser(req.params.id, {
      role,
      permissions: permissions ? stringifyJSON(permissions) : null,
      updated_at: now,
    });

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log activity
    logActivity(
      req.user.id,
      req.user.email,
      'update',
      'user',
      req.params.id,
      { role, permissions }
    );

    res.json({
      id: req.params.id,
      role,
      permissions: permissions || [],
      updatedAt: now,
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Delete user
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const user = db.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting yourself
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    db.deleteUser(req.params.id);
    
    // Log activity
    logActivity(
      req.user.id,
      req.user.email,
      'delete',
      'user',
      req.params.id,
      { email: user.email, displayName: user.display_name }
    );
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Update user profile
router.put('/:id/profile', authenticateToken, (req, res) => {
  try {
    // Users can only update their own profile unless admin
    if (req.params.id !== req.user.id && 
        req.user.role !== 'admin' && 
        req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { displayName } = req.body;
    const user = db.getUserById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const now = getCurrentTimestamp();
    const updated = db.updateUser(req.params.id, {
      display_name: displayName,
      updated_at: now,
    });

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log activity
    logActivity(
      req.user.id,
      req.user.email,
      'update',
      'user_profile',
      req.params.id,
      { displayName }
    );

    res.json({
      id: req.params.id,
      displayName,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
