# HackMatrix Deployment Guide

This guide details how to host your HackMatrix MERN stack application in production using **Render** (for the backend) and **Vercel** (for the frontend).

---

## 💻 1. Deploying the Backend on Render

Render is ideal for hosting Node.js/Express web services.

### Steps:
1. Sign in to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository: `vaibhavraj26/hackmatrix-Hackathon-management-system`.
4. Configure the Web Service:
   - **Name**: `hackmatrix-backend` (or similar)
   - **Environment**: `Node`
   - **Root Directory**: `backend` *(CRITICAL: Set this to separate the backend code)*
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Select **Free**
5. Click **Advanced** and add the following **Environment Variables**:
    - `MONGODB_URI` = `your_mongodb_atlas_connection_string`
    - `JWT_SECRET` = `your_jwt_secret_key`
   - `NODE_ENV` = `production`
6. Click **Create Web Service**. 
7. Once deployed, copy the **Render URL** (e.g. `https://hackmatrix-backend.onrender.com`).

---

## ⚡ 2. Deploying the Frontend on Vercel

Vercel is the premier platform for static frontend applications.

### Steps:
1. Sign in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New** and select **Project**.
3. Import your GitHub repository: `vaibhavraj26/hackmatrix-Hackathon-management-system`.
4. Configure the Vercel Project:
   - **Framework Preset**: `Vite` *(Vercel should automatically detect this)*
   - **Root Directory**: Click Edit, select the `frontend` folder, and click Continue.
   - **Build Command**: `npm run build` *(Auto-configured)*
   - **Output Directory**: `dist` *(Auto-configured)*
5. Open the **Environment Variables** dropdown and add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.onrender.com/api` *(Paste your Render URL here, adding `/api` at the end)*
6. Click **Deploy**.

---

## ⚠️ Post-Deployment Checklist

- **Single Page Application Routing**: We have already added a `frontend/vercel.json` file to handle routing fallbacks. This ensures reloading routes like `/leaderboard` or `/profile` directly in the browser will not throw a Vercel 404 error.
- **Render Spin-up times**: On the free tier, Render databases/web services spin down after 15 minutes of inactivity. When launching the frontend for the first time after a break, it might take 30-50 seconds for the backend to respond as it spins back up.
