import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import db from '../config/database.js';
import { generateId, getCurrentTimestamp } from '../utils/helpers.js';
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
    cb(null, 'category-' + uniqueSuffix + path.extname(file.originalname));
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

// Get all categories
router.get('/', (req, res) => {
  try {
    const categories = db.getCategories().sort((a, b) => a.name.localeCompare(b.name));
    res.json(categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      image: cat.image,
      createdAt: cat.created_at,
    })));
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get single category
router.get('/:id', (req, res) => {
  try {
    const category = db.getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({
      id: category.id,
      name: category.name,
      description: category.description,
      image: category.image,
      createdAt: category.created_at,
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Create category
router.post('/', authenticateToken, requireAdmin, upload.single('image'), (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;
    const categoryId = generateId();
    const now = getCurrentTimestamp();

    // Handle uploaded image or image URL
    let image = imageUrl || null;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const category = {
      id: categoryId,
      name,
      description: description || null,
      image: image || null,
      created_at: now,
    };

    db.createCategory(category);

    // Log activity
    logActivity(
      req.user.id,
      req.user.email,
      'create',
      'category',
      categoryId,
      { name }
    );

    res.status(201).json({
      id: categoryId,
      name,
      description,
      image,
      createdAt: now,
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category
router.put('/:id', authenticateToken, requireAdmin, upload.single('image'), (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;
    const category = db.getCategoryById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Handle uploaded image or image URL
    let image = imageUrl !== undefined ? imageUrl : category.image;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    const updated = db.updateCategory(req.params.id, {
      name,
      description: description || null,
      image: image || null,
    });

    if (!updated) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Log activity
    logActivity(
      req.user.id,
      req.user.email,
      'update',
      'category',
      req.params.id,
      { name }
    );

    res.json({
      id: req.params.id,
      name,
      description,
      image,
      createdAt: category.created_at,
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const category = db.getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    db.deleteCategory(req.params.id);
    
    // Log activity
    logActivity(
      req.user.id,
      req.user.email,
      'delete',
      'category',
      req.params.id,
      { name: category.name }
    );
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
