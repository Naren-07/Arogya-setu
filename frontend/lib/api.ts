import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

/**
 * Send a chat message to the backend API
 */
export async function sendMessage(message: string, language: string = 'en') {
  const response = await axios.post(`${BACKEND_URL}/api/chat`, {
    message,
    language,
  });
  return response.data;
}

/**
 * Check backend health status
 */
export async function checkHealth() {
  const response = await axios.get(`${BACKEND_URL}/api/health`);
  return response.data;
}
