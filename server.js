require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Supabase Setup ──
const isPlaceholder = !process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('your-project') || process.env.SUPABASE_URL.includes('placeholder');
let supabase = null;
let usersDB = {}; // Local Fallback

if (!isPlaceholder) {
  try {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    console.log('✅ Supabase database connected');
  } catch (e) {
    console.warn('⚠️ Supabase init failed:', e.message);
  }
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

// ── Database Layer (Profiles Table) ──
async function dbGet(id) {
  if (supabase) {
    const { data } = await supabase.from('profiles').select('*').eq('email', id).single();
    if (data) return data;
  }
  return usersDB[id];
}

async function dbSave(id, data) {
  if (supabase) {
    await supabase.from('profiles').upsert({ email: id, ...data });
  }
  usersDB[id] = { ...data };
}

// ══════════════════════════════════════════
//  AUTH ROUTES (SIMPLE USERNAME/PASSWORD)
// ══════════════════════════════════════════

// POST Register
app.post('/api/auth/register', async (req, res) => {
  const { email: id, password } = req.body;
  if (!id || !password) return res.json({ success: false, error: 'Missing username or password' });
  
  const existing = await dbGet(id);
  if (existing) return res.json({ success: false, error: 'User already exists' });
  
  await dbSave(id, { password, state: defaultState });
  res.json({ success: true });
});

// POST Login
app.post('/api/auth/login', async (req, res) => {
  const { email: id, password } = req.body;
  const user = await dbGet(id);
  
  if (!user) return res.json({ success: false, error: 'User not found' });
  if (user.password !== password) return res.json({ success: false, error: 'Incorrect password' });
  
  res.json({ success: true });
});

// ── STATE API ──
app.get('/api/state', async (req, res) => {
  const id = req.headers['x-user-email'];
  if (!id || id === 'guest') return res.json({ success: true, data: defaultState });
  
  const user = await dbGet(id);
  res.json({ success: true, data: user ? user.state : defaultState });
});

app.patch('/api/state', async (req, res) => {
  const id = req.headers['x-user-email'];
  if (!id || id === 'guest') return res.json({ success: true });
  
  const user = await dbGet(id);
  const state = user ? user.state : JSON.parse(JSON.stringify(defaultState));
  
  Object.keys(req.body).forEach(k => {
    if (req.body[k] !== undefined) state[k] = req.body[k];
  });
  
  await dbSave(id, { password: user ? user.password : '', state });
  res.json({ success: true });
});

app.post('/api/state/reset', async (req, res) => {
  const id = req.headers['x-user-email'];
  if (id && id !== 'guest') {
    const user = await dbGet(id);
    await dbSave(id, { password: user ? user.password : '', state: defaultState });
  }
  res.json({ success: true });
});

// XP & Study Time
app.post('/api/xp', async (req, res) => {
  const id = req.headers['x-user-email'];
  const user = await dbGet(id);
  if (!user) return res.json({ success: false });
  user.state.xp = (user.state.xp || 0) + (Number(req.body.amount) || 0);
  await dbSave(id, user);
  res.json({ success: true, xp: user.state.xp });
});

app.post('/api/study-time', async (req, res) => {
  const id = req.headers['x-user-email'];
  const user = await dbGet(id);
  if (!user) return res.json({ success: false });
  user.state.studyTimeSeconds = (user.state.studyTimeSeconds || 0) + (Number(req.body.seconds) || 0);
  await dbSave(id, user);
  res.json({ success: true, studyTimeSeconds: user.state.studyTimeSeconds });
});

app.post('/api/test-result', async (req, res) => {
  const id = req.headers['x-user-email'];
  const user = await dbGet(id);
  if (!user) return res.json({ success: false });
  
  const result = { ...req.body, timestamp: new Date().toISOString() };
  if (!user.state.testResults) user.state.testResults = [];
  user.state.testResults.unshift(result);
  if (user.state.testResults.length > 30) user.state.testResults = user.state.testResults.slice(0, 30);
  
  if (result.weakAreas) {
    if (!user.state.weakAreas) user.state.weakAreas = {};
    result.weakAreas.forEach(area => { user.state.weakAreas[area] = (user.state.weakAreas[area] || 0) + 1; });
  }
  user.state.xp = (user.state.xp || 0) + Math.round((result.score || 0) / 100 * 200 + 50);
  await dbSave(id, user);
  res.json({ success: true });
});

// Reminders
app.get('/api/reminders', async (req, res) => {
  const id = req.headers['x-user-email'];
  const user = await dbGet(id);
  if (!user) return res.json({ success: true, reminders: defaultState.reminders });
  res.json({ success: true, reminders: user.state.reminders || [], phoneNumber: user.state.phoneNumber });
});

app.post('/api/reminders', async (req, res) => {
  const id = req.headers['x-user-email'];
  const user = await dbGet(id);
  if (!user) return res.json({ success: false });
  const rem = { id: user.state.nextReminderId++, time: req.body.time, label: req.body.label, enabled: true };
  user.state.reminders.push(rem);
  await dbSave(id, user);
  res.json({ success: true, reminder: rem });
});

// Serve frontend
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => {
  console.log(`\n🎌 JLPT Study Hub → http://localhost:${PORT}`);
  if (isPlaceholder) console.log('💡 Note: Supabase not configured. Using Local Storage.');
  else console.log('✅ Simple Username/Password Authentication Active (Profiles DB Mode)');
});
