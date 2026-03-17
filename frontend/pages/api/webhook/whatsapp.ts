import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

/**
 * Twilio WhatsApp Webhook Handler
 * 
 * Receives incoming WhatsApp messages from Twilio and forwards them
 * to the Railway backend for processing.
 * 
 * Twilio sends POST requests with form-urlencoded body containing:
 * - Body: The message text
 * - From: Sender's WhatsApp number (whatsapp:+1234567890)
 * - To: Twilio sandbox number
 * - MessageSid: Unique message identifier
 */
export async function POST(req: NextRequest) {
  try {
    // Parse the form-urlencoded body from Twilio
    const formData = await req.formData();
    const body = Object.fromEntries(formData.entries());

    console.log('[Webhook] Received WhatsApp message:', {
      from: body.From,
      body: body.Body,
      messageSid: body.MessageSid,
    });

    // Forward to backend
    const backendResponse = await fetch(`${BACKEND_URL}/api/chat/whatsapp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(body as Record<string, string>).toString(),
    });

    if (!backendResponse.ok) {
      console.error('[Webhook] Backend error:', backendResponse.status);
      // Return a fallback TwiML response
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Sorry, we're experiencing technical difficulties. Please try again later.

⚠️ Disclaimer: This chatbot provides general guidance only. Please consult a doctor for medical advice.</Message>
</Response>`,
        {
          status: 200,
          headers: { 'Content-Type': 'text/xml' },
        }
      );
    }

    // Forward the TwiML response from backend
    const twimlResponse = await backendResponse.text();

    return new NextResponse(twimlResponse, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    });
  } catch (error) {
    console.error('[Webhook] Error processing WhatsApp message:', error);

    // Return error TwiML so Twilio doesn't retry
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Sorry, something went wrong. Please try again later.

⚠️ Disclaimer: This chatbot provides general guidance only. Please consult a doctor for medical advice.</Message>
</Response>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      }
    );
  }
}

// Twilio may send GET requests for webhook validation
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'swasthya-saathi-webhook',
    message: 'WhatsApp webhook is active. Send POST requests from Twilio.',
  });
}
