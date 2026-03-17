# Deployment Guide: SwasthyaSaathi Lite

This guide explains how to deploy the application to **Railway (Backend)** and **Vercel (Frontend)**.

## 🚀 1. Backend Deployment (Railway)

1.  **Prepare Repository**: Ensure your code is pushed to a GitHub repository.
2.  **New Service**: On [Railway](https://railway.app), click **New Project** > **Deploy from GitHub repo**.
3.  **Configure Service**:
    -   Railway will automatically detect the `backend` folder and the `railway.json` file.
    -   Go to **Settings** > **General** > **Root Directory** and set it to `backend`.
4.  **Add Environment Variables**:
    Go to the **Variables** tab and add the keys from `backend/.env.production.example`:
    - `PORT`: `5000` (Railway provides this automatically, but good to set).
    - `NODE_ENV`: `production`
    - `GROQ_API_KEY`: Your Groq API key.
    - `TWILIO_ACCOUNT_SID`: Your Twilio SID.
    - `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token.
    - `FRONTEND_URL`: The URL of your Vercel deployment (you'll get this in the next section).
5.  **Deploy**: Railway will build and deploy your service using **Nixpacks**.

## 🎨 2. Frontend Deployment (Vercel)

1.  **New Project**: On [Vercel](https://vercel.com), click **Add New** > **Project**.
2.  **Import Repo**: Select your GitHub repository.
3.  **Configure Project**:
    -   **Root Directory**: Set this to `frontend`.
    -   **Framework Preset**: Next.js.
4.  **Add Environment Variables**:
    Add the keys from `frontend/.env.production.example`:
    - `NEXT_PUBLIC_BACKEND_URL`: The public URL of your Railway service (e.g., `https://back-production.up.railway.app`).
    - `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token.
5.  **Deploy**: Click **Deploy**. Vercel will provide you with a production URL.

## 🔗 3. Connecting the Dots

1.  **CORS Update**: Go back to Railway and update the `FRONTEND_URL` variable with the real Vercel URL (e.g., `https://swasthya-saathi.vercel.app`).
2.  **Twilio Webhook**: 
    - Log in to [Twilio Console](https://console.twilio.com).
    - Go to **Messaging** > **Try it Out** > **WhatsApp Sandbox Settings**.
    - Set the **When a message comes in** URL to:
      `https://your-vercel-domain.com/api/webhook/whatsapp`
    - Set the method to **POST**.

---

## 🛠️ Troubleshooting: "Railpack could not determine how to build the app"

If you see this error on Railway, it's because the builder is looking at the root of the repository instead of the `backend` folder.

### Option 1: The Automated Fix (Recommended)
I have added a `railway.json` and `package.json` at the **root** of the repository. Railway should now automatically detect that it's a Node.js app and run the backend.

### Option 2: Manual Fix in Railway UI
1. Go to your **Railway Project Dashboard**.
2. Click on the **Backend Service**.
3. Go to the **Settings** tab.
4. Scroll down to the **General** section.
5. Find **Root Directory** and set it to `backend`.
6. Railway will trigger a re-deploy and should find the code correctly.

## 🛠️ Troubleshooting: Vercel "404: NOT_FOUND"

If you see a Vercel 404 error on your main domain:

### 1. Check the Root Directory
This is the most common cause in a monorepo.
1. In the **Vercel Dashboard**, go to your project.
2. Go to **Settings** > **General**.
3. Look for **Root Directory** and ensure it is set to `frontend`.
4. If it's empty, set it to `frontend` and click **Save**.
5. Go to the **Deployments** tab and click **Redeploy** on the latest build.

### 2. Check Framework Preset
1. In **Settings** > **General**, ensure the **Framework Preset** is set to **Next.js**.

### 3. Check for Build Errors
1. Go to the **Deployments** tab in Vercel.
2. Click on the latest deployment.
3. Check the **Building** logs. If the build failed, Vercel might show a 404 if there's no previous successful deployment.

---

---
> [!IMPORTANT]
> Always use `https://` for production URLs.
