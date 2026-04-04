require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Supabase Setup with Auth ──
const isPlaceholder = !process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('your-project') || process.env.SUPABASE_URL.includes('placeholder');
let supabase = null;
let usersDB = {}; // Fallback in-memory DB

if (!isPlaceholder) {
  try {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    console.log('✅ Supabase client initialized');
  } catch (e) {
    console.warn('⚠️ Supabase init failed:', e.message);
  }
}

// ── Twilio setup (optional) ──
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
  try {
    const twilio = require('twilio');
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('✅ Twilio SMS client initialized');
  } catch (e) {
    console.warn('⚠️ Twilio init failed:', e.message);
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

async function getProfile(req) {
  const email = req.headers['x-user-email'];
  if (!email || email === 'guest') return JSON.parse(JSON.stringify(defaultState));
  
  if (supabase) {
    try {
      const { data, error } = await supabase.from('profiles').select('state').eq('email', email).single();
      if (data) return data.state;
      // If profile not found, maybe initialize it
      if (error && error.code === 'PGRST116') {
        await supabase.from('profiles').insert({ email, state: defaultState });
        return defaultState;
      }
    } catch (e) { console.error('DB fetch error:', e); }
  }
  
  if (usersDB[email]) return usersDB[email].state;
  return JSON.parse(JSON.stringify(defaultState));
}

async function updateProfile(req, updates) {
  const email = req.headers['x-user-email'];
  if (!email || email === 'guest') return;
  
  const state = await getProfile(req);
  Object.keys(updates).forEach(k => {
    if (updates[k] !== undefined) state[k] = updates[k];
  });
  
  if (supabase) {
    try {
      await supabase.from('profiles').upsert({ email, state });
    } catch (e) { console.error('DB save error:', e); }
  }
  
  if (!usersDB[email]) usersDB[email] = { password: '', state };
  usersDB[email].state = state;
}

// ══════════════════════════════════════════
//  AUTH ROUTES (Now with Real Supabase Auth)
// ══════════════════════════════════════════

// POST Register
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.json({ success: false, error: 'Missing email or password' });
  
  if (supabase) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return res.json({ success: false, error: error.message });
    
    // Initialize profile
    await supabase.from('profiles').upsert({ email, state: defaultState });
    return res.json({ success: true, user: data.user });
  }
  
  // Fallback mode
  if (usersDB[email]) return res.json({ success: false, error: 'Already registered locally' });
  usersDB[email] = { password, state: JSON.parse(JSON.stringify(defaultState)) };
  res.json({ success: true });
});

// POST Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.json({ success: false, error: error.message });
    return res.json({ success: true, user: data.user });
  }

  // Fallback mode
  if (usersDB[email] && usersDB[email].password === password) return res.json({ success: true });
  res.json({ success: false, error: 'Invalid credentials or account not found' });
});

// GET full state
app.get('/api/state', async (req, res) => res.json({ success: true, data: await getProfile(req) }));

// PATCH partial state update
app.patch('/api/state', async (req, res) => {
  await updateProfile(req, req.body);
  res.json({ success: true });
});

// POST reset state completely
app.post('/api/state/reset', async (req, res) => {
  const email = req.headers['x-user-email'];
  if (email && email !== 'guest') {
    if (supabase) await supabase.from('profiles').upsert({ email, state: defaultState });
    if (usersDB[email]) usersDB[email].state = JSON.parse(JSON.stringify(defaultState));
  }
  res.json({ success: true });
});

// POST add XP
app.post('/api/xp', async (req, res) => {
  const st = await getProfile(req);
  st.xp = (st.xp || 0) + (Number(req.body.amount) || 0);
  await updateProfile(req, { xp: st.xp });
  res.json({ success: true, xp: st.xp });
});

app.post('/api/study-time', async (req, res) => {
  const st = await getProfile(req);
  st.studyTimeSeconds = (st.studyTimeSeconds || 0) + (Number(req.body.seconds) || 0);
  await updateProfile(req, { studyTimeSeconds: st.studyTimeSeconds });
  res.json({ success: true, studyTimeSeconds: st.studyTimeSeconds });
});

app.post('/api/test-result', async (req, res) => {
  const st = await getProfile(req);
  const result = { ...req.body, timestamp: new Date().toISOString() };
  if (!st.testResults) st.testResults = [];
  st.testResults.unshift(result);
  if (st.testResults.length > 30) st.testResults = st.testResults.slice(0, 30);
  
  if (result.weakAreas) {
    if (!st.weakAreas) st.weakAreas = {};
    result.weakAreas.forEach(area => { st.weakAreas[area] = (st.weakAreas[area] || 0) + 1; });
  }
  st.xp = (st.xp || 0) + Math.round((result.score || 0) / 100 * 200 + 50);
  await updateProfile(req, { testResults: st.testResults, weakAreas: st.weakAreas, xp: st.xp });
  res.json({ success: true });
});

// Reminders
app.get('/api/reminders', async (req, res) => {
  const st = await getProfile(req);
  res.json({ success: true, reminders: st.reminders || [], phoneNumber: st.phoneNumber });
});

app.post('/api/reminders', async (req, res) => {
  const st = await getProfile(req);
  if (!st.reminders) st.reminders = [];
  const rem = { id: st.nextReminderId++, time: req.body.time, label: req.body.label, enabled: true };
  st.reminders.push(rem);
  await updateProfile(req, { reminders: st.reminders });
  res.json({ success: true, reminder: rem });
});

// Serve frontend
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => {
  console.log(`\n🎌 JLPT Study Hub → http://localhost:${PORT}`);
  if (isPlaceholder) console.log('💡 Note: Supabase is NOT configured. Using Local In-Memory Mode.');
  else console.log('✅ Real Supabase Auth Activated.');
});
