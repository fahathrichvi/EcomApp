# Quick Setup Guide

## Installation

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

## Running the Application

### Option 1: Run Both Servers Separately

**Terminal 1 - Backend Server:**
```bash
cd server
npm start
```
Backend runs on: `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Frontend runs on: `http://localhost:5173`

### Option 2: Use Concurrently (Recommended)

First install concurrently:
```bash
npm install --save-dev concurrently
```

Then update `package.json` scripts:
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

## First Steps

1. **Start the backend server** - The SQLite database will be created automatically
2. **Start the frontend** - Open `http://localhost:5173`
3. **Register a new account** - Go to `/register`
4. **To make yourself admin:**
   - The database file is at `server/database.db`
   - You can use a SQLite browser or update via the admin panel if you have access
   - Or manually update the `role` field in the `users` table to `'admin'` or `'super_admin'`

## Troubleshooting

- **Port already in use**: Change the port in `server/src/server.js` (default: 3001)
- **Database errors**: Delete `server/database.db` and restart the server to recreate it
- **Image upload issues**: Make sure `server/uploads` directory exists and has write permissions
- **CORS errors**: Check that the backend is running and the API URL is correct

## Environment Variables (Optional)

Create `server/.env`:
```env
PORT=3001
JWT_SECRET=your-secret-key-here
```

Create `.env` in root:
```env
VITE_API_URL=http://localhost:3001/api
```


