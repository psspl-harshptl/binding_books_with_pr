// netlify/functions/reset.mjs
// POST /api/testimonials/reset → restores default testimonials (protected)
import {
  DEFAULT_TESTIMONIALS,
  saveTestimonials,
  verifyToken,
  extractToken,
  json,
  CORS_PREFLIGHT
} from './_shared.mjs';

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return CORS_PREFLIGHT;
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  if (!verifyToken(extractToken(event))) {
    return json(401, { success: false, message: 'Unauthorized. Valid admin session required.' });
  }

  try {
    await saveTestimonials(DEFAULT_TESTIMONIALS);
    return json(200, { success: true, testimonials: DEFAULT_TESTIMONIALS });
  } catch (e) {
    console.error('Reset error:', e);
    return json(500, { success: false, message: 'Failed to reset testimonials' });
  }
};
