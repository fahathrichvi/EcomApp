import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import db from '../config/database.js';
import { generateId, getCurrentTimestamp, parseJSON, stringifyJSON } from '../utils/helpers.js';
import { logActivity } from './activityLogs.js';

const router = express.Router();

// Get orders
router.get('/', authenticateToken, (req, res) => {
  try {
    let orders = db.getOrders();

    // If not admin, only show user's orders
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'manager') {
      orders = orders.filter(o => o.user_id === req.user.id);
    }

    // Filter by status if provided
    if (req.query.status) {
      orders = orders.filter(o => o.status === req.query.status);
    }

    // Sort by created_at desc and limit
    orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    orders = orders.slice(0, 100);

    const formattedOrders = orders.map(order => {
      // Get order items
      const items = db.getOrderItems(order.id);
      
      return {
        id: order.id,
        userId: order.user_id,
        items: items.map(item => ({
          productId: item.product_id,
          product: {
            id: item.product_id,
            name: '', // Will be populated below
            price: item.price,
            images: [],
          },
          quantity: item.quantity,
        })),
        total: order.total,
        status: order.status,
        shippingAddress: parseJSON(order.shipping_address, {}),
        createdAt: order.created_at,
        updatedAt: order.updated_at,
      };
    });

    // Populate product details for items
    for (const order of formattedOrders) {
      for (const item of order.items) {
        const product = db.getProductById(item.productId);
        if (product) {
          item.product = {
            id: product.id,
            name: product.name,
            price: product.price,
            images: parseJSON(product.images, []),
          };
        }
      }
    }

    res.json(formattedOrders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const order = db.getOrderById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check permissions
    if (order.user_id !== req.user.id && 
        req.user.role !== 'admin' && 
        req.user.role !== 'super_admin' && 
        req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const items = db.getOrderItems(order.id);
    
    const formattedItems = items.map(item => {
      const product = db.getProductById(item.product_id);
      return {
        productId: item.product_id,
        product: {
          id: product?.id || item.product_id,
          name: product?.name || '',
          price: item.price,
          images: product ? parseJSON(product.images, []) : [],
        },
        quantity: item.quantity,
      };
    });

    res.json({
      id: order.id,
      userId: order.user_id,
      items: formattedItems,
      total: order.total,
      status: order.status,
      shippingAddress: parseJSON(order.shipping_address, {}),
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Create order
router.post('/', authenticateToken, (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must have at least one item' });
    }

    // Calculate total and validate stock
    let total = 0;
    for (const item of items) {
      const product = db.getProductById(item.productId);
      if (!product) {
        return res.status(400).json({ error: `Product ${item.productId} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }
      total += product.price * item.quantity;
    }

    const orderId = generateId();
    const now = getCurrentTimestamp();

    // Create order
    const order = {
      id: orderId,
      user_id: req.user.id,
      total,
      status: 'pending',
      shipping_address: stringifyJSON(shippingAddress),
      created_at: now,
      updated_at: now,
    };

    db.createOrder(order);

    // Create order items and update stock
    for (const item of items) {
      const itemId = generateId();
      const product = db.getProductById(item.productId);
      
      db.createOrderItem({
        id: itemId,
        order_id: orderId,
        product_id: item.productId,
        quantity: item.quantity,
        price: product.price,
      });

      // Update product stock
      db.updateProduct(item.productId, {
        stock: product.stock - item.quantity,
      });
    }

    // Log activity
    logActivity(
      req.user.id,
      req.user.email,
      'create',
      'order',
      orderId,
      { total, itemCount: items.length }
    );

    res.status(201).json({
      id: orderId,
      message: 'Order created successfully',
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update order status
router.put('/:id/status', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const now = getCurrentTimestamp();
    const updated = db.updateOrder(req.params.id, {
      status,
      updated_at: now,
    });

    if (!updated) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Log activity
    logActivity(
      req.user.id,
      req.user.email,
      'update',
      'order',
      req.params.id,
      { status, previousStatus: order.status }
    );

    res.json({
      id: req.params.id,
      status,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;
