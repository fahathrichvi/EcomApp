import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../data');
const dbFile = path.join(dbPath, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true });
}

// Initialize database structure
const initDatabase = () => {
  if (!fs.existsSync(dbFile)) {
    const initialData = {
      users: [],
      products: [],
      categories: [],
      orders: [],
      orderItems: [],
      activityLogs: [],
    };
    fs.writeFileSync(dbFile, JSON.stringify(initialData, null, 2));
  }
};

// Load database
const loadDatabase = () => {
  initDatabase();
  try {
    const data = fs.readFileSync(dbFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading database:', error);
    return {
      users: [],
      products: [],
      categories: [],
      orders: [],
      orderItems: [],
      activityLogs: [],
    };
  }
};

// Save database
const saveDatabase = (data) => {
  try {
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving database:', error);
    throw error;
  }
};

// Database operations
class Database {
  constructor() {
    this.data = loadDatabase();
  }

  // Users
  getUsers() {
    return this.data.users || [];
  }

  getUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email) {
    return this.data.users.find(u => u.email === email);
  }

  createUser(user) {
    this.data.users.push(user);
    saveDatabase(this.data);
    return user;
  }

  updateUser(id, updates) {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.data.users[index] = { ...this.data.users[index], ...updates };
      saveDatabase(this.data);
      return this.data.users[index];
    }
    return null;
  }

  deleteUser(id) {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.data.users.splice(index, 1);
      saveDatabase(this.data);
      return true;
    }
    return false;
  }

  // Products
  getProducts() {
    return this.data.products || [];
  }

  getProductById(id) {
    return this.data.products.find(p => p.id === id);
  }

  createProduct(product) {
    this.data.products.push(product);
    saveDatabase(this.data);
    return product;
  }

  updateProduct(id, updates) {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.data.products[index] = { ...this.data.products[index], ...updates };
      saveDatabase(this.data);
      return this.data.products[index];
    }
    return null;
  }

  deleteProduct(id) {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index !== -1) {
      this.data.products.splice(index, 1);
      saveDatabase(this.data);
      return true;
    }
    return false;
  }

  // Categories
  getCategories() {
    return this.data.categories || [];
  }

  getCategoryById(id) {
    return this.data.categories.find(c => c.id === id);
  }

  createCategory(category) {
    this.data.categories.push(category);
    saveDatabase(this.data);
    return category;
  }

  updateCategory(id, updates) {
    const index = this.data.categories.findIndex(c => c.id === id);
    if (index !== -1) {
      this.data.categories[index] = { ...this.data.categories[index], ...updates };
      saveDatabase(this.data);
      return this.data.categories[index];
    }
    return null;
  }

  deleteCategory(id) {
    const index = this.data.categories.findIndex(c => c.id === id);
    if (index !== -1) {
      this.data.categories.splice(index, 1);
      saveDatabase(this.data);
      return true;
    }
    return false;
  }

  // Orders
  getOrders() {
    return this.data.orders || [];
  }

  getOrderById(id) {
    return this.data.orders.find(o => o.id === id);
  }

  createOrder(order) {
    this.data.orders.push(order);
    saveDatabase(this.data);
    return order;
  }

  updateOrder(id, updates) {
    const index = this.data.orders.findIndex(o => o.id === id);
    if (index !== -1) {
      this.data.orders[index] = { ...this.data.orders[index], ...updates };
      saveDatabase(this.data);
      return this.data.orders[index];
    }
    return null;
  }

  // Order Items
  getOrderItems(orderId) {
    return (this.data.orderItems || []).filter(item => item.order_id === orderId);
  }

  createOrderItem(item) {
    if (!this.data.orderItems) {
      this.data.orderItems = [];
    }
    this.data.orderItems.push(item);
    saveDatabase(this.data);
    return item;
  }

  // Activity Logs
  getActivityLogs(limit = 100, userId = null) {
    let logs = this.data.activityLogs || [];
    if (userId) {
      logs = logs.filter(log => log.user_id === userId);
    }
    return logs.slice(0, limit);
  }

  createActivityLog(log) {
    if (!this.data.activityLogs) {
      this.data.activityLogs = [];
    }
    this.data.activityLogs.push(log);
    saveDatabase(this.data);
    return log;
  }

  // Reload data (useful for multi-process scenarios)
  reload() {
    this.data = loadDatabase();
  }
}

const db = new Database();

export default db;
