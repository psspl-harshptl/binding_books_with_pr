// netlify/functions/_shared.mjs
// Shared utilities used by all Netlify Functions — zero external dependencies
import { createHash, createHmac, timingSafeEqual } from 'crypto';

// ─── Default testimonials ─────────────────────────────────────────────────────
export const DEFAULT_TESTIMONIALS = [
  { stars: 5, quote: "Krisha made my book launch feel like an absolute dream. She didn't just promote it—she built an entire ecosystem of readers who truly cared.", name: "Aria Mercer", subtitle: "Fantasy Novelist", avatar: "AM" },
  { stars: 5, quote: "Her Bookstagram insights and target strategy gave my debut mystery the momentum it needed to hit bestseller lists. Deeply professional!", name: "Julian Vance", subtitle: "Thriller Writer", avatar: "JV" },
  { stars: 5, quote: "I was skeptical about book PR agencies, but Krisha's human approach won me over. Personalized outreach that actually gets replies.", name: "Lydia Chen", subtitle: "Contemporary YA Author", avatar: "LC" },
  { stars: 5, quote: "As an influencer, working with Krisha is wonderful. She matches books perfectly with my reading taste. Highly recommended.", name: "@reads_and_rays", subtitle: "Bookstagram Creator", avatar: "RR" },
  { stars: 5, quote: "The influencer outreach was outstanding. My sci-fi series gained thousands of new readers and hit top charts within weeks. Highly professional execution!", name: "Marcus Sterling", subtitle: "Sci-Fi Author", avatar: "MS" },
  { stars: 5, quote: "Krisha treated my book with so much care and attention. The review campaign was incredibly successful and authentic. I couldn't be happier!", name: "Elena Rostova", subtitle: "Historical Fiction Writer", avatar: "ER" }
];

// ─── Password verification ────────────────────────────────────────────────────
export function verifyPassword(password) {
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;
  if (!expectedHash) {
    // Fallback: SHA-256 of "admin123" (set env var in production!)
    const fallback = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';
    return createHash('sha256').update(password).digest('hex') === fallback;
  }
  return createHash('sha256').update(password).digest('hex') === expectedHash.toLowerCase();
}

// ─── Stateless JWT-like session tokens (no npm packages) ─────────────────────
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getSecret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET is not configured in environment variables');
  return s;
}

export function createToken() {
  const payload = Buffer.from(
    JSON.stringify({ iat: Date.now(), exp: Date.now() + TOKEN_TTL_MS })
  ).toString('base64url');
  const sig = createHmac('sha256', getSecret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;

  const expected = createHmac('sha256', getSecret()).update(payload).digest('base64url');
  try {
    const a = Buffer.from(sig, 'base64url');
    const b = Buffer.from(expected, 'base64url');
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }

  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof exp === 'number' && Date.now() < exp;
  } catch {
    return false;
  }
}

export function extractToken(event) {
  const auth = (event.headers['authorization'] || event.headers['Authorization'] || '');
  return auth.startsWith('Bearer ') ? auth.slice(7) : null;
}

// ─── Netlify Blobs data store ─────────────────────────────────────────────────
const BLOB_KEY = 'testimonials';

export async function loadTestimonials() {
  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('bwb-cms');
    const data = await store.get(BLOB_KEY, { type: 'json' });
    if (Array.isArray(data)) return data;
  } catch (e) {
    console.warn('Blob read failed, using defaults:', e.message);
  }
  return DEFAULT_TESTIMONIALS;
}

export async function saveTestimonials(list) {
  const { getStore } = await import('@netlify/blobs');
  const store = getStore('bwb-cms');
  await store.setJSON(BLOB_KEY, list);
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────
export function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    },
    body: JSON.stringify(body)
  };
}

export const CORS_PREFLIGHT = {
  statusCode: 204,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  },
  body: ''
};
