require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
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
  completedLessons: [], testResults: [], progress: {}, achievements: [], xpHistory: [],
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
      if (error) {
        if (error.code !== 'PGRST116') { // No rows found is not a critical error
           console.error(`🔍 Supabase Fetch Error [${error.code}]:`, error.message);
        }
      }
      if (data) {
        // Fallback: If password/username columns are missing in DB but exist in JSON state
        if (!data.password && data.state && data.state._password) data.password = data.state._password;
        if (!data.username && data.state && data.state._username) data.username = data.state._username;
        return data;
      }
    } catch (e) { console.warn('Supabase fetch exception:', e.message); }
  }
  return usersDB[id];
}

async function dbSave(id, data) {
  const saveObj = { email: id, ...data };
  
  // Extra layer: Keep password/username in state as backup in case columns are missing
  if (data.state) {
      if (data.password) data.state._password = data.password;
      if (data.username) data.state._username = data.username;
  }

  if (supabase) {
    try {
      const { error } = await supabase.from('profiles').upsert(saveObj);
      if (error) {
          console.error(`💾 Supabase Save Error [${error.code}]:`, error.message);
          
          // If any column is missing (PGRST204), try saving with only known columns
          if (error.code === 'PGRST204') {
              console.warn(`⚠️ Column missing. Retrying save with protected schema (email + state)...`);
              const backupObj = { email: id, state: data.state || {} };
              const { error: err2 } = await supabase.from('profiles').upsert(backupObj);
              if (err2) console.error('💾 Final Save Error:', err2.message);
              else console.log('✅ Progress saved (Extra fields moved to state JSON).');
          }
      } else {
          console.log(`✅ Data synced to Supabase for ${id}`);
      }
    } catch (e) { console.error('DB save exception:', e.message); }
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
  const { email, password, username } = req.body;
  if (!email || !password || !username) return res.json({ success: false, error: 'Missing information (Email, Username, or Password)' });
  
  const existing = await dbGet(email);
  if (existing) return res.json({ success: false, error: 'A user with this email already exists' });
  
  // HASH PASSWORD
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  const initialState = JSON.parse(JSON.stringify(defaultState));
  await dbSave(email, { password: hashedPassword, username, state: initialState });
  
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await dbGet(email);
  if (!user) return res.json({ success: false, error: 'No account found with this email' });
  
  // COMPARE PASSWORD
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.json({ success: false, error: 'Invalid password' });
  
  const token = jwt.sign({ email: user.email || email }, JWT_SECRET, { expiresIn: '7d' });
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

module.exports = app;
