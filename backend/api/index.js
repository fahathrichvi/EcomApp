import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from '../src/routes/auth.js';
import productRoutes from '../src/routes/products.js';
import categoryRoutes from '../src/routes/categories.js';
import orderRoutes from '../src/routes/orders.js';
import userRoutes from '../src/routes/users.js';
import adminRoutes from '../src/routes/admin.js';
import activityLogRoutes from '../src/routes/activityLogs.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/activity-logs', activityLogRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Vercel Serverless Function is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

export default app;
