import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Warning: SUPABASE_URL or SUPABASE_ANON_KEY environment variables are missing.');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');

class Database {
  // Users
  async getUsers() {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return data || [];
  }

  async getUserById(id) {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getUserByEmail(email) {
    const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createUser(user) {
    const { data, error } = await supabase.from('users').insert(user).select().single();
    if (error) throw error;
    return data;
  }

  async updateUser(id, updates) {
    const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async deleteUser(id) {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  // Products
  async getProducts() {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    return data || [];
  }

  async getProductById(id) {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createProduct(product) {
    const { data, error } = await supabase.from('products').insert(product).select().single();
    if (error) throw error;
    return data;
  }

  async updateProduct(id, updates) {
    const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async deleteProduct(id) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  // Categories
  async getCategories() {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) throw error;
    return data || [];
  }

  async getCategoryById(id) {
    const { data, error } = await supabase.from('categories').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createCategory(category) {
    const { data, error } = await supabase.from('categories').insert(category).select().single();
    if (error) throw error;
    return data;
  }

  async updateCategory(id, updates) {
    const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async deleteCategory(id) {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  // Orders
  async getOrders() {
    const { data, error } = await supabase.from('orders').select('*');
    if (error) throw error;
    return data || [];
  }

  async getOrderById(id) {
    const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createOrder(order) {
    const { data, error } = await supabase.from('orders').insert(order).select().single();
    if (error) throw error;
    return data;
  }

  async updateOrder(id, updates) {
    const { data, error } = await supabase.from('orders').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  // Order Items
  async getOrderItems(orderId) {
    const { data, error } = await supabase.from('order_items').select('*').eq('order_id', orderId);
    if (error) throw error;
    return data || [];
  }

  async createOrderItem(item) {
    const { data, error } = await supabase.from('order_items').insert(item).select().single();
    if (error) throw error;
    return data;
  }

  // Activity Logs
  async getActivityLogs(limit = 100, userId = null) {
    let query = supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(limit);
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async createActivityLog(log) {
    const { data, error } = await supabase.from('activity_logs').insert(log).select().single();
    if (error) throw error;
    return data;
  }

  async reload() {
    // No-op for Supabase
  }
}

const db = new Database();

export default db;
