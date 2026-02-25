# Vercel Deployment Guide

## Prerequisites

1. **Backend Server**: The backend server needs to be deployed separately. Vercel only deploys the frontend by default.

   **Options for Backend:**
   - Deploy the `server` folder to a separate service (Railway, Render, Heroku, etc.)
   - Or use Vercel Serverless Functions (requires refactoring)

2. **Environment Variables**: Set up environment variables in Vercel dashboard.

## Deployment Steps

### 1. Prepare Your Repository

Make sure all changes are committed:
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push
```

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
npm i -g vercel
vercel
```

#### Option B: Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (root of your project)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3. Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

Add:
```
VITE_API_URL=https://your-backend-url.com/api
```

Replace `https://your-backend-url.com/api` with your actual backend server URL.

### 4. Deploy

Click "Deploy" and wait for the build to complete.

## Important Notes

### Backend Deployment

The backend server (`/server` folder) needs to be deployed separately. Here are options:

1. **Railway** (Recommended):
   - Push your repo to GitHub
   - Connect Railway to your repo
   - Set root directory to `/server`
   - Deploy

2. **Render**:
   - Create a new Web Service
   - Point to `/server` directory
   - Use command: `npm start`

3. **Heroku**:
   - Create a new app
   - Set buildpack to Node.js
   - Set root to `/server`

### API URL Configuration

After deploying your backend, update the `VITE_API_URL` environment variable in Vercel to point to your backend URL.

Example:
- If backend is at `https://vovia-backend.railway.app`
- Set `VITE_API_URL=https://vovia-backend.railway.app/api`

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Ensure TypeScript errors are fixed
- Check build logs in Vercel dashboard

### API Calls Fail
- Verify `VITE_API_URL` is set correctly in Vercel environment variables
- Check CORS settings on your backend server
- Ensure backend is deployed and accessible

### 404 Errors on Routes
- The `vercel.json` file includes rewrites to handle client-side routing
- If issues persist, check the rewrites configuration

## Current Configuration

- **Build Command**: `npm run build` (runs `tsc && vite build`)
- **Output Directory**: `dist`
- **Framework**: Vite + React
- **Node Version**: Use Node.js 18+ in Vercel settings



