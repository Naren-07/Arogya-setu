# SwasthyaSaathi Lite

> AI-powered multilingual healthcare chatbot for rural India

## Overview

SwasthyaSaathi Lite is a multilingual AI chatbot that provides basic healthcare awareness to rural and semi-urban populations via WhatsApp and SMS. It supports English and Hindi, offering symptom guidance, vaccination schedules, preventive health tips, and outbreak alerts.

## Tech Stack

| Layer | Technology | Deployment |
|-------|-----------|------------|
| Frontend / API | Next.js 14 (App Router) | Vercel |
| Backend | Node.js + Express | Railway |
| AI | OpenAI / Gemini API | - |
| Messaging | Twilio WhatsApp Sandbox | - |
| Translation | Google Translate API | - |
| Data | JSON files | - |

## Project Structure

```
swasthya-saathi/
├── frontend/          # Next.js (Vercel)
├── backend/           # Express (Railway)
├── shared/            # Shared constants, types, utils
├── docs/              # Documentation
└── .planning/         # GSD planning artifacts
```

## Getting Started

### Prerequisites
- Node.js 20.x LTS
- npm 9+
- Twilio account (free sandbox)
- OpenAI or Google Gemini API key

### Setup

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run dev
```

## Environment Variables

### frontend/.env.local
```
NEXT_PUBLIC_BACKEND_URL=https://your-backend.up.railway.app
TWILIO_AUTH_TOKEN=xxxx
```

### backend/.env
```
PORT=5000
OPENAI_API_KEY=xxxx
TWILIO_ACCOUNT_SID=xxxx
TWILIO_AUTH_TOKEN=xxxx
```

## Request Flow

1. User sends message (WhatsApp)
2. Twilio hits webhook (Vercel API)
3. Vercel forwards to backend (Railway)
4. Backend processes via AI
5. Response sent back to user

## License

MIT

## Disclaimer

⚠️ This chatbot provides general health guidance only. Always consult a qualified doctor for medical advice.
