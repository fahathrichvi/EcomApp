import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import db from '../config/database.js';
import { generateId, getCurrentTimestamp, parseJSON, stringifyJSON } from '../utils/helpers.js';
import { logActivity } from './activityLogs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    let products = await db.getProducts();

    // Filter by category
    if (req.query.categoryId) {
      products = products.filter(p => p.category_id === req.query.categoryId);
    }

    // Search
    if (req.query.search) {
      const searchTerm = req.query.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        (p.description && p.description.toLowerCase().includes(searchTerm))
      );
    }

    // Sort by created_at desc
    products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      costPrice: product.cost_price || null,
      expenses: product.expenses || null,
      discount: product.discount || null,
      images: parseJSON(product.images, []),
      stock: product.stock,
      category: product.category,
      categoryId: product.category_id,
      promotionalBadge: product.promotional_badge || null,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
      createdBy: product.created_by,
      updatedBy: product.updated_by,
    }));

    res.json({ products: formattedProducts });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await db.getProductById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      costPrice: product.cost_price || null,
      expenses: product.expenses || null,
      discount: product.discount || null,
      images: parseJSON(product.images, []),
      stock: product.stock,
      category: product.category,
      categoryId: product.category_id,
      promotionalBadge: product.promotional_badge || null,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
      createdBy: product.created_by,
      updatedBy: product.updated_by,
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product
router.post('/', authenticateToken, requireAdmin, upload.array('images', 10), async (req, res) => {
  try {
    const { name, description, price, stock, categoryId, category, costPrice, expenses, discount, promotionalBadge } = req.body;
    
    // Handle uploaded images
    const imageUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const productId = generateId();
    const now = getCurrentTimestamp();

    const product = {
      id: productId,
      name,
      description,
      price: parseFloat(price),
      cost_price: costPrice ? parseFloat(costPrice) : null,
      expenses: expenses ? parseFloat(expenses) : null,
      discount: discount ? parseFloat(discount) : null,
      stock: parseInt(stock),
      category_id: categoryId || null,
      category: category || '',
      images: stringifyJSON(imageUrls),
      promotional_badge: promotionalBadge || null,
      created_by: req.user.id,
      updated_by: req.user.id,
      created_at: now,
      updated_at: now,
    };

    await db.createProduct(product);

    // Log activity
    await logActivity(
      req.user.id,
      req.user.email,
      'create',
      'product',
      productId,
      { name, price: parseFloat(price), stock: parseInt(stock) }
    );

    res.status(201).json({
      id: productId,
      name,
      description,
      price: parseFloat(price),
      costPrice: costPrice ? parseFloat(costPrice) : null,
      expenses: expenses ? parseFloat(expenses) : null,
      discount: discount ? parseFloat(discount) : null,
      stock: parseInt(stock),
      categoryId,
      category,
      images: imageUrls,
      promotionalBadge: promotionalBadge || null,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/:id', authenticateToken, requireAdmin, upload.array('images', 10), async (req, res) => {
  try {
    const { name, description, price, stock, categoryId, category, costPrice, expenses, discount, promotionalBadge } = req.body;
    const productId = req.params.id;

    // Get existing product
    const existing = await db.getProductById(productId);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Handle new images
    let images = parseJSON(existing.images, []);
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      images = [...images, ...newImages];
    }

    const now = getCurrentTimestamp();

    const updated = await db.updateProduct(productId, {
      name,
      description,
      price: parseFloat(price),
      cost_price: costPrice ? parseFloat(costPrice) : null,
      expenses: expenses ? parseFloat(expenses) : null,
      discount: (discount !== undefined && discount !== '' && discount !== null && !isNaN(parseFloat(discount))) ? parseFloat(discount) : null,
      stock: parseInt(stock),
      category_id: categoryId || null,
      category: category || '',
      images: stringifyJSON(images),
      promotional_badge: promotionalBadge || null,
      updated_by: req.user.id,
      updated_at: now,
    });

    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Log activity
    await logActivity(
      req.user.id,
      req.user.email,
      'update',
      'product',
      productId,
      { name, price: parseFloat(price), stock: parseInt(stock) }
    );

    res.json({
      id: productId,
      name,
      description,
      price: parseFloat(price),
      costPrice: costPrice ? parseFloat(costPrice) : null,
      expenses: expenses ? parseFloat(expenses) : null,
      discount: (discount !== undefined && discount !== '' && discount !== null && !isNaN(parseFloat(discount))) ? parseFloat(discount) : null,
      stock: parseInt(stock),
      categoryId,
      category,
      images,
      promotionalBadge: promotionalBadge || null,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const product = await db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await db.deleteProduct(req.params.id);
    
    // Log activity
    await logActivity(
      req.user.id,
      req.user.email,
      'delete',
      'product',
      req.params.id,
      { name: product.name }
    );
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Get low stock products
router.get('/admin/low-stock', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const products = await db.getProducts()
      .filter(p => p.stock <= threshold)
      .sort((a, b) => a.stock - b.stock);
    
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      costPrice: product.cost_price || null,
      expenses: product.expenses || null,
      images: parseJSON(product.images, []),
      stock: product.stock,
      category: product.category,
      categoryId: product.category_id,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    }));

    res.json(formattedProducts);
  } catch (error) {
    console.error('Get low stock error:', error);
    res.status(500).json({ error: 'Failed to fetch low stock products' });
  }
});

export default router;
