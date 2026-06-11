// netlify/functions/login.mjs
// POST /api/login → verifies admin password, returns signed session token
import { verifyPassword, createToken, json, CORS_PREFLIGHT } from './_shared.mjs';

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return CORS_PREFLIGHT;
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const body = JSON.parse(event.body || '{}');
    const password = typeof body.password === 'string' ? body.password : '';

    if (!password) return json(400, { success: false, message: 'Password is required' });

    if (verifyPassword(password)) {
      const token = createToken();
      return json(200, { success: true, token });
    }

    return json(401, { success: false, message: 'Invalid admin credentials' });
  } catch (e) {
    console.error('Login error:', e);
    return json(400, { success: false, message: 'Invalid request body' });
  }
};
