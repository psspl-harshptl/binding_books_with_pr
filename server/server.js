import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 5000;
const DATA_FILE = path.join(__dirname, 'data.json');

// SHA-256 hash of "admin123"
const ADMIN_PASSWORD_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';

// Memory store for active admin sessions
const activeSessions = new Set();

const DEFAULT_TESTIMONIALS = [
  {
    stars: 5,
    quote: "Krisha made my book launch feel like an absolute dream. She didn't just promote it—she built an entire ecosystem of readers who truly cared.",
    name: "Aria Mercer",
    subtitle: "Fantasy Novelist",
    avatar: "AM"
  },
  {
    stars: 5,
    quote: "Her Bookstagram insights and target strategy gave my debut mystery the momentum it needed to hit bestseller lists. Deeply professional!",
    name: "Julian Vance",
    subtitle: "Thriller Writer",
    avatar: "JV"
  },
  {
    stars: 5,
    quote: "I was skeptical about book PR agencies, but Krisha's human approach won me over. Personalized outreach that actually gets replies.",
    name: "Lydia Chen",
    subtitle: "Contemporary YA Author",
    avatar: "LC"
  },
  {
    stars: 5,
    quote: "As an influencer, working with Krisha is wonderful. She matches books perfectly with my reading taste. Highly recommended.",
    name: "@reads_and_rays",
    subtitle: "Bookstagram Creator",
    avatar: "RR"
  },
  {
    stars: 5,
    quote: "The influencer outreach was outstanding. My sci-fi series gained thousands of new readers and hit top charts within weeks. Highly professional execution!",
    name: "Marcus Sterling",
    subtitle: "Sci-Fi Author",
    avatar: "MS"
  },
  {
    stars: 5,
    quote: "Krisha treated my book with so much care and attention. The review campaign was incredibly successful and authentic. I couldn't be happier!",
    name: "Elena Rostova",
    subtitle: "Historical Fiction Writer",
    avatar: "ER"
  }
];

// Ensure database file exists
function loadTestimonials() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error("Error reading data file, using defaults", e);
  }
  
  // Write defaults if not exists
  saveTestimonials(DEFAULT_TESTIMONIALS);
  return DEFAULT_TESTIMONIALS;
}

function saveTestimonials(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error("Error writing data file", e);
  }
}

// Helper to check token authorization
function isAuthorized(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.split(' ')[1];
  return activeSessions.has(token);
}

// Helper to read JSON request body
function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}

// Send JSON Helper
function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    });
    res.end();
    return;
  }

  // 1. GET Testimonials (Public)
  if (pathname === '/api/testimonials' && req.method === 'GET') {
    const list = loadTestimonials();
    sendJSON(res, 200, list);
    return;
  }

  // 2. POST Login (Public)
  if (pathname === '/api/login' && req.method === 'POST') {
    try {
      const body = await getRequestBody(req);
      const password = body.password || '';
      
      const hash = crypto.createHash('sha256').update(password).digest('hex');
      
      if (hash === ADMIN_PASSWORD_HASH) {
        const token = crypto.randomBytes(32).toString('hex');
        activeSessions.add(token);
        sendJSON(res, 200, { success: true, token });
      } else {
        sendJSON(res, 401, { success: false, message: 'Invalid admin credentials' });
      }
    } catch (e) {
      sendJSON(res, 400, { success: false, message: 'Invalid JSON request payload' });
    }
    return;
  }

  // 2b. POST Subscribe (Public)
  if (pathname === '/api/subscribe' && req.method === 'POST') {
    try {
      const body = await getRequestBody(req);
      const email = body.email || '';
      const honeypot = body.bwb_honeypot || '';

      if (honeypot) {
        console.warn(`[Local Sub] Honeypot triggered by spam bot. Simulating success.`);
        sendJSON(res, 200, { success: true });
        return;
      }

      if (!email || !email.includes('@')) {
        sendJSON(res, 400, { success: false, message: 'A valid email address is required.' });
        return;
      }

      console.info(`[Local Sub] New subscriber simulated: ${email}`);
      sendJSON(res, 200, { success: true });
    } catch (e) {
      sendJSON(res, 400, { success: false, message: 'Invalid JSON request payload' });
    }
    return;
  }

  // Check auth for all other /api routes
  if (pathname.startsWith('/api') && !isAuthorized(req)) {
    sendJSON(res, 401, { success: false, message: 'Unauthorized. Admin authorization required.' });
    return;
  }

  // 3. POST Add Testimonial (Protected)
  if (pathname === '/api/testimonials' && req.method === 'POST') {
    try {
      const body = await getRequestBody(req);
      const { stars, quote, name, subtitle, avatar } = body;
      
      if (!name || !subtitle || !quote) {
        sendJSON(res, 400, { success: false, message: 'Missing required fields' });
        return;
      }

      const list = loadTestimonials();
      list.push({
        stars: parseInt(stars, 10) || 5,
        quote,
        name,
        subtitle,
        avatar: avatar || name.slice(0, 2).toUpperCase()
      });
      
      saveTestimonials(list);
      sendJSON(res, 201, { success: true, testimonials: list });
    } catch (e) {
      sendJSON(res, 400, { success: false, message: 'Invalid request' });
    }
    return;
  }

  // 4. PUT Edit Testimonial (Protected)
  if (pathname === '/api/testimonials' && req.method === 'PUT') {
    try {
      const indexStr = parsedUrl.searchParams.get('index');
      if (indexStr === null) {
        sendJSON(res, 400, { success: false, message: 'Missing index parameter' });
        return;
      }

      const idx = parseInt(indexStr, 10);
      const list = loadTestimonials();
      
      if (idx < 0 || idx >= list.length) {
        sendJSON(res, 404, { success: false, message: 'Testimonial index not found' });
        return;
      }

      const body = await getRequestBody(req);
      const { stars, quote, name, subtitle, avatar } = body;

      list[idx] = {
        stars: parseInt(stars, 10) || 5,
        quote: quote || list[idx].quote,
        name: name || list[idx].name,
        subtitle: subtitle || list[idx].subtitle,
        avatar: avatar || list[idx].avatar
      };

      saveTestimonials(list);
      sendJSON(res, 200, { success: true, testimonials: list });
    } catch (e) {
      sendJSON(res, 400, { success: false, message: 'Invalid request' });
    }
    return;
  }

  // 5. DELETE Testimonial (Protected)
  if (pathname === '/api/testimonials' && req.method === 'DELETE') {
    const indexStr = parsedUrl.searchParams.get('index');
    if (indexStr === null) {
      sendJSON(res, 400, { success: false, message: 'Missing index parameter' });
      return;
    }

    const idx = parseInt(indexStr, 10);
    const list = loadTestimonials();
    
    if (idx < 0 || idx >= list.length) {
      sendJSON(res, 404, { success: false, message: 'Testimonial index not found' });
      return;
    }

    list.splice(idx, 1);
    saveTestimonials(list);
    sendJSON(res, 200, { success: true, testimonials: list });
    return;
  }

  // 6. Reset Testimonials (Protected)
  if (pathname === '/api/testimonials/reset' && req.method === 'POST') {
    saveTestimonials(DEFAULT_TESTIMONIALS);
    sendJSON(res, 200, { success: true, testimonials: DEFAULT_TESTIMONIALS });
    return;
  }

  // 404 Catch-all
  sendJSON(res, 404, { error: 'Endpoint not found' });
});

server.listen(PORT, () => {
  console.log(`BWB PR API Server listening on port ${PORT}`);
});
