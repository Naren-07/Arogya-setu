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
> [!IMPORTANT]
> Always use `https://` for production URLs.
