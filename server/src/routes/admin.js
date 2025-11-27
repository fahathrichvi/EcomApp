import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import db from '../config/database.js';

const router = express.Router();

// Get admin stats
router.get('/stats', authenticateToken, requireAdmin, (req, res) => {
  try {
    const totalProducts = db.getProducts().length;
    const totalOrders = db.getOrders().length;
    const totalUsers = db.getUsers().length;
    
    // Calculate total revenue (excluding cancelled orders)
    const orders = db.getOrders().filter(o => o.status !== 'cancelled');
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    // Count low stock items
    const lowStockCount = db.getProducts().filter(p => p.stock <= 10).length;
    
    // Count pending orders
    const pendingOrders = db.getOrders().filter(o => o.status === 'pending').length;

    res.json({
      totalProducts,
      totalOrders,
      totalRevenue,
      totalUsers,
      lowStockItems: lowStockCount,
      pendingOrders,
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

export default router;
