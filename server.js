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

// ══════════════════════════════════════════
//  AI VOICE CONVERSATION API (Sakura Sensei)
// ══════════════════════════════════════════
app.post('/api/ai-chat', async (req, res) => {
  try {
    const { message, level = 'N5', scenario = 'self_intro' } = req.body;
    if (!message) return res.json({ success: false, error: 'No message provided' });

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      const systemPrompt = `You are Sakura-sensei (さくら先生), a warm, encouraging Japanese language tutor conducting an interactive Japanese conversation with a ${level} level student in the scenario "${scenario}".
Responded ONLY with a valid JSON object matching this schema (do not wrap in markdown or code fences):
{
  "japanese": "Your response in clear Japanese (use Hiragana/Furigana/simple Kanji suited for ${level})",
  "romaji": "Romaji reading of your response",
  "english": "English translation of your response",
  "correction": "Gentle grammar/vocabulary correction if the user's input had mistakes, or null if their input was correct/good",
  "suggestedReplies": ["3 short Japanese reply options the student can click next"]
}`;

      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `${systemPrompt}\n\nStudent message: "${message}"` }] }
          ],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.7 }
        })
      });

      if (geminiRes.ok) {
        const data = await geminiRes.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText);
          return res.json({ success: true, data: parsed });
        }
      }
    }

    // ── Fallback Conversational Engine (Works out of the box!) ──
    const lowerMsg = message.toLowerCase();
    let reply = {
      japanese: '素晴らしい（すばらしい）です！よく出来（でき）ました！ほかには何（なに）がありますか？',
      romaji: 'Subarashii desu! Yoku dekimashita! Hoka ni wa nani ga arimasu ka?',
      english: 'Wonderful! Great job! Is there anything else?',
      correction: null,
      suggestedReplies: [
        'もっと練習（れんしゅう）したいです！',
        '質問（しつもん）があります。',
        'ありがとう、さくら先生！'
      ]
    };

    if (lowerMsg.includes('名前') || lowerMsg.includes('わたしは') || lowerMsg.includes('僕は') || lowerMsg.includes('です') || lowerMsg.includes('my name') || lowerMsg.includes('ayush')) {
      reply = {
        japanese: 'お名前（なまえ）を教えてくれてありがとう！どうぞよろしくお願いします。趣味（しゅみ）は何（なに）ですか？',
        romaji: 'O-namae wo oshiete kurete arigatou! Douzo yoroshiku onegai shimasu. Shumi wa nan desu ka?',
        english: 'Thank you for telling me your name! Nice to meet you. What are your hobbies?',
        correction: lowerMsg.includes('my name is') ? 'Tip: In Japanese, say "わたしは [Name] です" (Watashi wa [Name] desu).' : null,
        suggestedReplies: [
          '趣味は音楽（おんがく）を聞くことです。',
          'アニメとゲームが好きです。',
          '日本語を勉強することです。'
        ]
      };
    } else if (lowerMsg.includes('何') || lowerMsg.includes('どこ') || lowerMsg.includes('いつ') || lowerMsg.includes('where') || lowerMsg.includes('how') || lowerMsg.includes('駅') || lowerMsg.includes('station')) {
      reply = {
        japanese: '駅（えき）はここから歩（ある）いて五分（ごふん）くらいですよ。まっすぐ行ってくださいね！',
        romaji: 'Eki wa koko kara aruite go-fun kurai desu yo. Massugu itte kudasai ne!',
        english: 'The station is about a 5-minute walk from here. Go straight ahead!',
        correction: null,
        suggestedReplies: [
          'ありがとうございます！助（たす）かりました。',
          '近くにコンビニはありますか？',
          '切符（きっぷ）はどこで買えますか？'
        ]
      };
    } else if (lowerMsg.includes('メニュー') || lowerMsg.includes('おすすめ') || lowerMsg.includes('水') || lowerMsg.includes('水') || lowerMsg.includes('いくら') || lowerMsg.includes('food') || lowerMsg.includes('order')) {
      reply = {
        japanese: 'かしこまりました！今日（きょう）のおすすめは美味しい（おいしい）ラーメンと餃子（ぎょうざ）のセットです。いかがですか？',
        romaji: 'Kashikomarimashita! Kyou no o-susume wa oishii ramen to gyouza no setto desu. Ikaga desu ka?',
        english: 'Certainly! Today\'s recommendation is a delicious ramen and gyoza set. How about that?',
        correction: null,
        suggestedReplies: [
          'それを二つ（ふたつ）お願いします！',
          'お会計（かいけい）をお願いします。',
          'とても美味しそうです！'
        ]
      };
    } else if (lowerMsg.includes('買') || lowerMsg.includes('服') || lowerMsg.includes('カード') || lowerMsg.includes('shopping') || lowerMsg.includes('price')) {
      reply = {
        japanese: 'こちらは全部（ぜんぶ）で二千円（にせんえん）になります。クレジットカードも使（つか）えますよ！',
        romaji: 'Kochira wa zenbu de ni-sen en ni narimasu. Kredikto kaado mo tsukaemasu yo!',
        english: 'The total comes to 2,000 yen. You can also use credit cards!',
        correction: null,
        suggestedReplies: [
          'じゃあ、カードで払（はら）います。',
          '袋（ふくろ）をいただけますか？',
          'ありがとうございました！'
        ]
      };
    } else if (lowerMsg.includes('こんにちは') || lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
      reply = {
        japanese: 'こんにちは！お元気（げんき）ですか？今日も一緒に日本語（にほんご）を楽しく（たのしく）練習（れんしゅう）しましょう！',
        romaji: 'Konnichiwa! O-genki desu ka? Kyou mo issho ni nihongo wo tanoshiku renshuu shimashou!',
        english: 'Hello! How are you? Let\'s practice Japanese together joyfully today as well!',
        correction: null,
        suggestedReplies: [
          'はい、元気（げんき）です！',
          '少し（すこし）疲れ（つかれ）ました。',
          'さくら先生、よろしくお願いします！'
        ]
      };
    }

    res.json({ success: true, data: reply });

  } catch (e) {
    console.error('AI chat error:', e.message);
    res.json({
      success: true,
      data: {
        japanese: 'すみません、よく聞こ（きこ）えませんでした。もう一度（いちど）言ってください。',
        romaji: 'Sumimasen, yoku kikoemasen deshita. Mou ichido itte kudasai.',
        english: 'Sorry, I couldn\'t hear you clearly. Please say that again.',
        suggestedReplies: ['もう一度（いちど）話（はな）します。', 'はい、分かりました。']
      }
    });
  }
});

// Serving frontend
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => {
  console.log(`\n🎌 JLPT Study Hub → http://localhost:${PORT}`);
  console.log('✅ JWT Authentication Middleware active');
});

module.exports = app;
