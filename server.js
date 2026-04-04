require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'jlpt-super-secret-key';

// ── Supabase Setup ──
const isPlaceholder = !process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('your-project') || process.env.SUPABASE_URL.includes('placeholder');
let supabase = null;
let usersDB = {}; // Local Fallback

if (!isPlaceholder) {
  try {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    console.log('✅ Supabase database connected');
  } catch (e) { console.warn('⚠️ Supabase init failed:', e.message); }
}

app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ── Default user state ──
const defaultState = {
  level: 'N5', xp: 0, streak: 0, lastStudied: null, studyTimeSeconds: 0,
  completedLessons: [], testResults: [], progress: {}, achievements: [],
  weakAreas: {}, activityLog: {}, settings: { dailyGoalMinutes: 30, theme: 'light' },
  phoneNumber: '', learnedKanji: {},
  reminders: [
    { id: 1, time: '08:00', label: 'Morning vocabulary practice!', enabled: true },
    { id: 2, time: '21:00', label: 'Evening grammar review!', enabled: true },
  ],
  nextReminderId: 3,
};

// ── Database Layer ──
async function dbGet(id) {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('email', id).single();
      if (data) return data;
    } catch (e) {}
  }
  return usersDB[id];
}

async function dbSave(id, data) {
  if (supabase) {
    try {
      await supabase.from('profiles').upsert({ email: id, ...data });
    } catch (e) { console.error('DB save error:', e.message); }
  }
  usersDB[id] = { ...data };
}

// ── Auth Middleware (JWT) ──
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const emailHeader = req.headers['x-user-email'];
  
  if (emailHeader === 'guest') {
    req.userEmail = 'guest';
    return next();
  }

  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    req.userEmail = 'guest';
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.userEmail = 'guest';
      return next();
    }
    req.userEmail = user.email;
    next();
  });
}

// ══════════════════════════════════════════
//  AUTH ROUTES
// ══════════════════════════════════════════

app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.json({ success: false, error: 'Missing username/password' });
  
  const existing = await dbGet(email);
  if (existing) return res.json({ success: false, error: 'User already exists' });
  
  // CRITICAL: Deep clone defaultState to prevent object leakage
  await dbSave(email, { password, state: JSON.parse(JSON.stringify(defaultState)) });
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await dbGet(email);
  if (!user || user.password !== password) return res.json({ success: false, error: 'Invalid credentials' });
  
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token });
});

// ── PROTECTED STATE ROUTES ──
app.use('/api/state', authenticate);

app.get('/api/state', async (req, res) => {
  const id = req.userEmail;
  if (id === 'guest') return res.json({ success: true, data: JSON.parse(JSON.stringify(defaultState)) });
  const user = await dbGet(id);
  res.json({ success: true, data: user ? user.state : JSON.parse(JSON.stringify(defaultState)) });
});

app.patch('/api/state', async (req, res) => {
  const id = req.userEmail;
  if (id === 'guest') return res.json({ success: true });
  
  const user = await dbGet(id);
  const state = user ? user.state : JSON.parse(JSON.stringify(defaultState));
  Object.keys(req.body).forEach(k => { if (req.body[k] !== undefined) state[k] = req.body[k]; });
  await dbSave(id, { password: user ? user.password : '', state });
  res.json({ success: true });
});

app.post('/api/state/reset', async (req, res) => {
  const id = req.userEmail;
  if (id !== 'guest') {
    const user = await dbGet(id);
    await dbSave(id, { password: user ? user.password : '', state: JSON.parse(JSON.stringify(defaultState)) });
  }
  res.json({ success: true });
});

// XP & Other routes
app.post('/api/xp', authenticate, async (req, res) => {
  const id = req.userEmail;
  if (id === 'guest') return res.json({ success: true });
  const user = await dbGet(id);
  if (!user) return res.json({ success: false });
  user.state.xp = (user.state.xp || 0) + (Number(req.body.amount) || 0);
  await dbSave(id, user);
  res.json({ success: true, xp: user.state.xp });
});

app.post('/api/study-time', authenticate, async (req, res) => {
  const id = req.userEmail;
  if (id === 'guest') return res.json({ success: true });
  const user = await dbGet(id);
  if (!user) return res.json({ success: false });
  user.state.studyTimeSeconds = (user.state.studyTimeSeconds || 0) + (Number(req.body.seconds) || 0);
  await dbSave(id, user);
  res.json({ success: true, studyTimeSeconds: user.state.studyTimeSeconds });
});

// Serving frontend
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => {
  console.log(`\n🎌 JLPT Study Hub → http://localhost:${PORT}`);
  console.log('✅ JWT Authentication Middleware active');
});
