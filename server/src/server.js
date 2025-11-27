import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

import db from './config/database.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';
import activityLogRoutes from './routes/activityLogs.js';
import { generateId, getCurrentTimestamp } from './utils/helpers.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/activity-logs', activityLogRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Initialize admin user if it doesn't exist
const initAdminUser = async () => {
  try {
    const existingAdmin = db.getUserByEmail('admin@shop.com');
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('admin', 10);
      const adminId = generateId();
      const now = getCurrentTimestamp();

      const adminUser = {
        id: adminId,
        email: 'admin@shop.com',
        password_hash: passwordHash,
        display_name: 'Admin',
        role: 'admin',
        permissions: null,
        created_at: now,
        updated_at: now,
      };

      db.createUser(adminUser);
      console.log('✓ Admin user created: admin@shop.com / admin');
    } else {
      console.log('✓ Admin user already exists');
    }
  } catch (error) {
    console.error('Error initializing admin user:', error);
  }
};

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  await initAdminUser();
});

