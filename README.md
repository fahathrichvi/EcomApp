# Vovia - Online Shopping Platform

A modern, responsive e-commerce web application built with React, TypeScript, and a local Node.js/Express backend with SQLite database. Features comprehensive inventory management, multi-admin system with role-based access control, and a full customer shopping experience.

## Features

### Customer Features
- Browse products with search and category filtering
- Product details with image gallery
- Shopping cart with persistent storage
- Secure checkout process
- Order history and tracking
- User profile management

### Admin Features
- **Inventory Management**: Full CRUD operations for products
- **Multi-Admin System**: Role-based access control (Super Admin, Admin, Manager)
- **Permissions System**: Granular permissions for different actions
- **Activity Logs**: Track all admin actions
- **Dashboard**: Overview statistics and alerts
- **Order Management**: View and update order status
- **User Management**: Manage user roles and permissions
- **Stock Management**: Low stock alerts and tracking

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

### Backend
- **Node.js** with Express
- **SQLite** - Database (better-sqlite3)
- **JWT** - Authentication
- **Multer** - File uploads
- **bcrypt** - Password hashing

## Project Structure

```
Vovia/
├── src/                    # React frontend
│   ├── components/        # UI components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── context/           # React Context
│   └── ...
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── config/        # Database config
│   │   └── middleware/    # Auth middleware
│   └── uploads/           # Product images
└── database.db            # SQLite database
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- No external services required (everything runs locally)

### Installation

1. **Install frontend dependencies:**
   ```bash
   npm install
   ```

2. **Install backend dependencies:**
   ```bash
   cd server
   npm install
   cd ..
   ```

### Running the Application

#### Option 1: Run separately

**Terminal 1 - Start Backend:**
```bash
cd server
npm start
```
Backend will run on `http://localhost:3001`

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```
Frontend will run on `http://localhost:5173`

#### Option 2: Use concurrently (recommended)

Add to root `package.json`:
```json
"scripts": {
  "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
  "dev:server": "cd server && npm run dev",
  "dev:client": "vite"
}
```

Then run:
```bash
npm run dev
```

### First Time Setup

1. **Start the backend server** - The SQLite database will be created automatically on first run
2. **Register a new user** - Go to `/register` and create an account
3. **Create an admin user** (optional):
   - The first user can be manually updated in the database to have admin role
   - Or use the admin panel after logging in (if you have admin access)

### Environment Variables

Create a `.env` file in the `server` directory (optional):

```env
PORT=3001
JWT_SECRET=your-secret-key-change-in-production
```

For frontend, create `.env` in root (optional):

```env
VITE_API_URL=http://localhost:3001/api
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `GET /api/orders` - Get orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status (admin)

### Admin
- `GET /api/admin/stats` - Get admin statistics
- `GET /api/users` - Get all users (admin)
- `PUT /api/users/:id/role` - Update user role (admin)

## Database Schema

The SQLite database includes:
- `users` - User accounts with roles
- `products` - Product inventory
- `categories` - Product categories
- `orders` - Customer orders
- `order_items` - Order line items
- `activity_logs` - Admin activity tracking

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation
- SQL injection prevention (parameterized queries)

## Building for Production

**Frontend:**
```bash
npm run build
```

**Backend:**
The server runs directly with Node.js. For production, consider using PM2 or similar process manager.

## License

MIT
