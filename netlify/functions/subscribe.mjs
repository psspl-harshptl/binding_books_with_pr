// netlify/functions/subscribe.mjs
// POST /api/subscribe → handles subscriber sign-ups & dispatches notifications using Resend API
import { json, CORS_PREFLIGHT } from './_shared.mjs';

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return CORS_PREFLIGHT;
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const body = JSON.parse(event.body || '{}');
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const honeypot = typeof body.bwb_honeypot === 'string' ? body.bwb_honeypot.trim() : '';

    // 1. Honeypot check (spam bot prevention)
    if (honeypot) {
      console.warn(`[Subscribe] Honeypot triggered. Silent bypass for bot.`);
      return json(200, { success: true, message: 'Subscribed successfully.' });
    }

    // 2. Email validation
    if (!email || !email.includes('@')) {
      return json(400, { success: false, message: 'A valid email address is required.' });
    }

    // 3. Env variables retrieval
    const resendKey = process.env.RESEND_API_KEY;
    const senderEmail = process.env.SENDER_EMAIL || 'onboarding@resend.dev';
    const adminEmail = process.env.ADMIN_EMAIL || 'bindingwithbookspr@gmail.com';

    if (!resendKey) {
      console.error('[Subscribe] Config Error: RESEND_API_KEY is not defined.');
      return json(500, { success: false, message: 'Server configuration error. API key missing.' });
    }

    // 4. Draft emails
    const welcomeHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to the Constellation</title>
        <style>
          body {
            background-color: #faf8f5;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #4a423b;
            margin: 0;
            padding: 30px 10px;
            -webkit-font-smoothing: antialiased;
          }
          .wrapper {
            max-width: 520px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #eae2d5;
            border-top: 4px solid #a83d5a;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(74, 66, 59, 0.05);
            overflow: hidden;
          }
          .inner-container {
            padding: 35px 30px;
          }
          .header {
            text-align: center;
            border-bottom: 1px solid #eae2d5;
            padding-bottom: 20px;
            margin-bottom: 25px;
          }
          .logo {
            font-family: 'Georgia', 'Garamond', serif;
            font-size: 20px;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            color: #a83d5a;
            font-weight: bold;
            margin: 0;
          }
          .subtitle {
            font-size: 9px;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            color: #cfa87b;
            margin-top: 4px;
            font-weight: 600;
          }
          .greeting {
            font-family: 'Georgia', 'Garamond', serif;
            font-size: 16px;
            color: #1f1b18;
            margin-top: 0;
            margin-bottom: 15px;
          }
          .message {
            font-size: 14px;
            line-height: 1.6;
            color: #4a423b;
            margin-bottom: 20px;
          }
          .highlight {
            color: #a83d5a;
            font-weight: 500;
          }
          .signature-section {
            margin-top: 35px;
            border-top: 1px dashed #eae2d5;
            padding-top: 20px;
          }
          .signature-block {
            text-align: right;
          }
          .sig-thanks {
            font-size: 11px;
            color: #7c7770;
            display: block;
          }
          .sig-name {
            font-family: 'Georgia', 'Garamond', serif;
            font-style: italic;
            font-size: 22px;
            color: #a83d5a;
            display: block;
            margin-top: 3px;
          }
          .footer {
            background-color: #121826;
            padding: 25px 20px;
            text-align: center;
            font-size: 11px;
            color: #a19fa6;
            line-height: 1.5;
          }
          .footer-logo {
            color: #d6b3bd;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            font-weight: bold;
            margin-bottom: 6px;
            font-size: 11px;
          }
          .footer p {
            margin: 4px 0;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="inner-container">
            <div class="header">
              <div class="logo">Binding with Books</div>
              <div class="subtitle">Bespoke Book Public Relations</div>
            </div>
            
            <p class="greeting">Dear Reader,</p>
            
            <p class="message">Thank you so much for subscribing to the Binding with Books newsletter. We are absolutely thrilled to welcome you to our reader constellation! ✨</p>
            
            <p class="message">Whether you are an author preparing to share your next story with the world, an influencer looking to collaborate on creative campaigns, or simply a passionate reader searching for your next favorite book—you are now part of our journey.</p>
            
            <p class="message">Moving forward, we will keep you updated on physical and digital <span class="highlight">ARC opportunities</span>, Bookstagram and TikTok review tours, and exclusive PR tips.</p>
            
            <p class="message">If you have any questions or want to collaborate, feel free to reply directly to this email or visit our website.</p>
            
            <div class="signature-section">
              <div class="signature-block">
                <span class="sig-thanks">Thanks for stopping by!</span>
                <span class="sig-name">Krisha</span>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-logo">Binding with Books PR</div>
            <p>You received this email because you subscribed to our newsletter updates.</p>
            <p>&copy; ${new Date().getFullYear()} Binding with Books PR. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const adminHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            background-color: #faf8f5;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #4a423b;
            padding: 30px 20px;
          }
          .card {
            max-width: 500px;
            margin: 0 auto;
            background-color: #ffffff;
            border-top: 4px solid #a83d5a;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(74, 66, 59, 0.05);
            padding: 30px;
          }
          .title {
            font-family: Georgia, serif;
            font-size: 18px;
            color: #a83d5a;
            margin-top: 0;
            border-bottom: 1px solid #eae2d5;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #cfa87b;
            margin-bottom: 5px;
            font-weight: bold;
          }
          .email-val {
            font-size: 16px;
            font-weight: bold;
            color: #1f1b18;
            background: #faf8f5;
            padding: 10px 15px;
            border-radius: 4px;
            border-left: 3px solid #d6b3bd;
            word-break: break-all;
          }
          .meta {
            font-size: 11px;
            color: #7c7770;
            margin-top: 25px;
            border-top: 1px solid #eae2d5;
            padding-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="title">🌟 New Subscriber Constellation Alert</div>
          <p>A new visitor has just subscribed to the newsletter on your website.</p>
          <div class="label">Subscriber Email Address:</div>
          <div class="email-val">${email}</div>
          <div class="meta">Timestamp: ${new Date().toLocaleString()}</div>
        </div>
      </body>
      </html>
    `;

    // 5. Send requests in parallel to Resend API
    const welcomePromise = fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `Binding with Books PR <${senderEmail}>`,
        to: email,
        subject: 'Welcome to the Constellation! ✨',
        html: welcomeHtml
      })
    });

    const adminPromise = fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `Binding with Books PR <${senderEmail}>`,
        to: adminEmail,
        subject: 'New Subscriber Alert! 🌟',
        html: adminHtml
      })
    });

    const [welcomeRes, adminRes] = await Promise.all([welcomePromise, adminPromise]);

    const welcomeData = await welcomeRes.json().catch(() => ({}));
    const adminData = await adminRes.json().catch(() => ({}));

    if (!welcomeRes.ok) {
      console.error('[Subscribe] Welcome email dispatch failed:', welcomeData);
    }
    if (!adminRes.ok) {
      console.error('[Subscribe] Admin alert dispatch failed:', adminData);
    }

    // Return success to the client if the subscriber email request succeeded
    if (welcomeRes.ok) {
      console.info(`[Subscribe] Successfully subscribed & notified: ${email}`);
      return json(200, { success: true, message: 'Subscribed successfully.' });
    } else {
      return json(500, { 
        success: false, 
        message: 'Could not send welcome email.', 
        error: welcomeData.message || 'Unknown error' 
      });
    }

  } catch (e) {
    console.error('[Subscribe] Fatal error:', e);
    return json(500, { 
      success: false, 
      message: 'Internal server error occurred.',
      error: e.message,
      stack: e.stack
    });
  }
};
