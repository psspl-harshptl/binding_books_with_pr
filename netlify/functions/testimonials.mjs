// netlify/functions/testimonials.mjs
// GET /api/testimonials    → public list
// POST /api/testimonials   → add (protected)
// PUT /api/testimonials    → edit by ?index=N (protected)
// DELETE /api/testimonials → delete by ?index=N (protected)
import {
  loadTestimonials,
  saveTestimonials,
  verifyToken,
  extractToken,
  json,
  CORS_PREFLIGHT
} from './_shared.mjs';

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return CORS_PREFLIGHT;

  const params = event.queryStringParameters || {};

  // ── GET (public) ──────────────────────────────────────────────────────────
  if (event.httpMethod === 'GET') {
    const list = await loadTestimonials();
    return json(200, list);
  }

  // ── Auth gate for all mutating methods ────────────────────────────────────
  if (!verifyToken(extractToken(event))) {
    return json(401, { success: false, message: 'Unauthorized. Valid admin session required.' });
  }

  // ── POST — add testimonial ────────────────────────────────────────────────
  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      const { stars, quote, name, subtitle, avatar } = body;

      if (!name || !subtitle || !quote) {
        return json(400, { success: false, message: 'Missing required fields: name, subtitle, quote' });
      }

      const list = await loadTestimonials();
      list.push({
        stars: parseFloat(stars) || 5,
        quote,
        name,
        subtitle,
        avatar: avatar || name.slice(0, 2).toUpperCase()
      });

      await saveTestimonials(list);
      return json(201, { success: true, testimonials: list });
    } catch (e) {
      console.error('POST testimonials error:', e);
      return json(400, { success: false, message: 'Invalid request body' });
    }
  }

  // ── PUT — edit testimonial ────────────────────────────────────────────────
  if (event.httpMethod === 'PUT') {
    try {
      const idx = parseInt(params.index, 10);
      if (isNaN(idx)) return json(400, { success: false, message: 'Missing ?index=N parameter' });

      const list = await loadTestimonials();
      if (idx < 0 || idx >= list.length) {
        return json(404, { success: false, message: `Testimonial at index ${idx} not found` });
      }

      const body = JSON.parse(event.body || '{}');
      const { stars, quote, name, subtitle, avatar } = body;

      list[idx] = {
        stars: parseFloat(stars) || list[idx].stars,
        quote: quote || list[idx].quote,
        name: name || list[idx].name,
        subtitle: subtitle || list[idx].subtitle,
        avatar: avatar || list[idx].avatar
      };

      await saveTestimonials(list);
      return json(200, { success: true, testimonials: list });
    } catch (e) {
      console.error('PUT testimonials error:', e);
      return json(400, { success: false, message: 'Invalid request body' });
    }
  }

  // ── DELETE — remove testimonial ───────────────────────────────────────────
  if (event.httpMethod === 'DELETE') {
    const idx = parseInt(params.index, 10);
    if (isNaN(idx)) return json(400, { success: false, message: 'Missing ?index=N parameter' });

    const list = await loadTestimonials();
    if (idx < 0 || idx >= list.length) {
      return json(404, { success: false, message: `Testimonial at index ${idx} not found` });
    }

    list.splice(idx, 1);
    await saveTestimonials(list);
    return json(200, { success: true, testimonials: list });
  }

  return json(405, { error: 'Method not allowed' });
};
