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
  const state = (user && user.state && typeof user.state === 'object') ? user.state : JSON.parse(JSON.stringify(defaultState));
  Object.keys(req.body).forEach(k => { if (req.body[k] !== undefined) state[k] = req.body[k]; });
  await dbSave(id, { password: user ? user.password : '', username: user ? user.username : '', state });
  res.json({ success: true });
});

app.post('/api/state/reset', async (req, res) => {
  const id = req.userEmail;
  if (id !== 'guest') {
    const user = await dbGet(id);
    await dbSave(id, { password: user ? user.password : '', username: user ? user.username : '', state: JSON.parse(JSON.stringify(defaultState)) });
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
    if (!message || !String(message).trim()) return res.json({ success: false, error: 'No message provided' });

    const trimmedMsg = String(message).trim();
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && !apiKey.includes('placeholder')) {
      try {
        const systemPrompt = `You are Sakura-sensei (さくら先生), a warm, encouraging, friendly Japanese language tutor chatting with a ${level} level student in the scenario "${scenario}".
Keep Japanese simple with Hiragana, easy Kanji and Furigana suited for ${level} students.
Respond ONLY with a valid JSON object matching this exact schema (no markdown formatting, no code fences):
{
  "japanese": "Your response in natural Japanese with furigana in parentheses e.g. 先生（せんせい）",
  "romaji": "Romaji reading of your response",
  "english": "English translation of your response",
  "correction": "Gentle correction tip if user made mistakes, or null if their input was good",
  "suggestedReplies": ["3 natural short Japanese replies the student can click next"]
}`;

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: `${systemPrompt}\n\nStudent says: "${trimmedMsg}"` }] }
            ],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.7 }
          })
        });

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            rawText = rawText.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
            const parsed = JSON.parse(rawText);
            if (parsed && parsed.japanese) {
              return res.json({ success: true, data: parsed });
            }
          }
        }
      } catch (gemErr) {
        console.warn('Gemini API call warning (using conversational fallback):', gemErr.message);
      }
    }

    // ── Robust Conversational Engine (Works 100% offline & out-of-the-box) ──
    const lowerMsg = trimmedMsg.toLowerCase();
    let reply = null;

    // Self Introduction / Names / Origins / Hobbies
    if (lowerMsg.includes('名前') || lowerMsg.includes('なまえ') || lowerMsg.includes('わたしは') || lowerMsg.includes('僕は') || lowerMsg.includes('my name') || lowerMsg.includes('ayush') || lowerMsg.includes('am ') || lowerMsg.includes('i am')) {
      reply = {
        japanese: 'お名前（なまえ）を教えてくれてありがとうございます！どうぞよろしくお願いします。趣味（しゅみ）は何（なに）ですか？',
        romaji: 'O-namae wo oshiete kurete arigatou gozaimasu! Douzo yoroshiku onegai shimasu. Shumi wa nan desu ka?',
        english: 'Thank you for telling me your name! Very nice to meet you. What are your hobbies?',
        correction: lowerMsg.includes('my name is') ? 'Tip: In Japanese, say "わたしは [Name] です" (Watashi wa [Name] desu).' : null,
        suggestedReplies: [
          '趣味はプログラミングです。',
          'アニメと音楽が好きです。',
          '日本語の勉強が趣味です！'
        ]
      };
    } else if (lowerMsg.includes('インド') || lowerMsg.includes('india') || lowerMsg.includes('国') || lowerMsg.includes('country') || lowerMsg.includes('from')) {
      reply = {
        japanese: 'インドですね！素晴らしい国（くに）ですね！カレーや紅茶（こうちゃ）がとても有名（ゆうめい）ですね。日本（にほん）へ来たことがありますか？',
        romaji: 'Indo desu ne! Subarashii kuni desu ne! Karee ya koucha ga totemo yuumei desu ne. Nihon e kita koto ga arimasu ka?',
        english: 'India! That is a wonderful country! Curry and tea are very famous. Have you ever visited Japan?',
        correction: null,
        suggestedReplies: [
          'まだ行ったことがありません。',
          'いつか日本へ旅行したいです！',
          '日本のアニメが大好きです。'
        ]
      };
    } else if (lowerMsg.includes('趣味') || lowerMsg.includes('hobby') || lowerMsg.includes('好き') || lowerMsg.includes('like') || lowerMsg.includes('anime') || lowerMsg.includes('アニメ') || lowerMsg.includes('game') || lowerMsg.includes('ゲーム')) {
      reply = {
        japanese: 'とても素敵（すてき）な趣味（しゅみ）ですね！楽しく（たのしく）続ける（つづける）のが一番（いちばん）大切（たいせつ）ですよ。',
        romaji: 'Totemo suteki na shumi desu ne! Tanoshiku tsuzukeru no ga ichiban taisetsu desu yo.',
        english: 'That is a wonderful hobby! Enjoying what you do is the most important thing.',
        correction: null,
        suggestedReplies: [
          'さくら先生の趣味は何ですか？',
          '毎日練習しています！',
          'もっと教えてください。'
        ]
      };
    }
    // Greetings & Politeness
    else if (lowerMsg.includes('おはよう') || lowerMsg.includes('good morning')) {
      reply = {
        japanese: 'おはようございます！今日も一日（いちにち）がんばりましょう！',
        romaji: 'Ohayou gozaimasu! Kyou mo ichinichi ganbarimashou!',
        english: 'Good morning! Let\'s do our best today as well!',
        correction: null,
        suggestedReplies: ['はい、がんばります！', '今日もよろしくお願いします！', '先生、お元気ですか？']
      };
    } else if (lowerMsg.includes('こんばんは') || lowerMsg.includes('good evening')) {
      reply = {
        japanese: 'こんばんは！夜（よる）の勉強（べんきょう）お疲（つか）れ様（さま）です！',
        romaji: 'Konbanwa! Yoru no benkyou otsukaresama desu!',
        english: 'Good evening! Great work studying in the evening!',
        correction: null,
        suggestedReplies: ['少し復習（ふくしゅう）します。', 'お疲れ様です！', '今日も楽しかったです。']
      };
    } else if (lowerMsg.includes('ありがとう') || lowerMsg.includes('thank') || lowerMsg.includes('thanks') || lowerMsg.includes('arigatou') || lowerMsg.includes('サンキュー')) {
      reply = {
        japanese: 'どういたしまして！いつでも気軽（きがる）に質問（しつもん）してくださいね！',
        romaji: 'Dou itashimashite! Itsudemo kigaru ni shitsumon shite kudasai ne!',
        english: 'You\'re very welcome! Feel free to ask questions anytime!',
        correction: null,
        suggestedReplies: ['はい、助かりました！', 'また練習します。', '先生、大好きです！']
      };
    } else if (lowerMsg.includes('さようなら') || lowerMsg.includes('bye') || lowerMsg.includes('じゃあね') || lowerMsg.includes('goodbye') || lowerMsg.includes('またね')) {
      reply = {
        japanese: 'またお話（はな）ししましょう！JLPTの勉強（べんきょう）、応援（おうえん）していますよ！',
        romaji: 'Mata o-hanashi shimashou! JLPT no benkyou, ouen shite imasu yo!',
        english: 'Let\'s talk again soon! I am cheering for your JLPT studies!',
        correction: null,
        suggestedReplies: ['ありがとうございました！', 'また明日！', 'がんばります！']
      };
    } else if (lowerMsg.includes('元気') || lowerMsg.includes('genki') || lowerMsg.includes('how are you')) {
      reply = {
        japanese: 'はい、元気（げんき）いっぱいです！あなたと日本語を話せてとても嬉しい（うれしい）です！',
        romaji: 'Hai, genki ippai desu! Anata to nihongo wo hanasete totemo ureshii desu!',
        english: 'Yes, I am full of energy! I am very happy to practice Japanese with you!',
        correction: null,
        suggestedReplies: ['わたしも元気です！', '楽しく勉強しましょう！', '質問があります。']
      };
    }
    // Restaurant / Food
    else if (lowerMsg.includes('メニュー') || lowerMsg.includes('おすすめ') || lowerMsg.includes('水') || lowerMsg.includes('いくら') || lowerMsg.includes('food') || lowerMsg.includes('order') || lowerMsg.includes('ラーメン') || lowerMsg.includes('寿司') || lowerMsg.includes('お腹')) {
      reply = {
        japanese: 'かしこまりました！今日（きょう）のおすすめは美味しい（おいしい）ラーメンと餃子（ぎょうざ）のセットです。いかがですか？',
        romaji: 'Kashikomarimashita! Kyou no o-susume wa oishii ramen to gyouza no setto desu. Ikaga desu ka?',
        english: 'Certainly! Today\'s recommendation is a delicious ramen and gyoza set. Would you like that?',
        correction: null,
        suggestedReplies: [
          'それを二つ（ふたつ）お願いします！',
          'お水（みず）をいただけますか？',
          'お会計（かいけい）をお願いします。'
        ]
      };
    }
    // Directions & Travel
    else if (lowerMsg.includes('駅') || lowerMsg.includes('どこ') || lowerMsg.includes('station') || lowerMsg.includes('where') || lowerMsg.includes('道') || lowerMsg.includes('電車') || lowerMsg.includes('トイレ') || lowerMsg.includes('hotel')) {
      reply = {
        japanese: '駅（えき）はここから歩（ある）いて五分（ごふん）くらいですよ。まっすぐ行って右（みぎ）に曲（ま）がってくださいね！',
        romaji: 'Eki wa koko kara aruite go-fun kurai desu yo. Massugu itte migi ni magatte kudasai ne!',
        english: 'The station is about a 5-minute walk from here. Go straight and then turn right!',
        correction: null,
        suggestedReplies: [
          'ありがとうございます！助（たす）かりました。',
          '近くにコンビニはありますか？',
          '切符（きっぷ）はどこで買えますか？'
        ]
      };
    }
    // Shopping
    else if (lowerMsg.includes('買') || lowerMsg.includes('服') || lowerMsg.includes('カード') || lowerMsg.includes('shopping') || lowerMsg.includes('price') || lowerMsg.includes('サイズ') || lowerMsg.includes('円')) {
      reply = {
        japanese: 'こちらは全部（ぜんぶ）で二千円（にせんえん）になります。クレジットカードも使（つか）えますよ！',
        romaji: 'Kochira wa zenbu de ni-sen en ni narimasu. Kurejitto kaado mo tsukaemasu yo!',
        english: 'The total comes to 2,000 yen. Credit cards are accepted as well!',
        correction: null,
        suggestedReplies: [
          'じゃあ、カードで払（はら）います。',
          '袋（ふくろ）をいただけますか？',
          'ありがとうございました！'
        ]
      };
    }
    // General Japanese Practice / Fallback
    else {
      reply = {
        japanese: 'よく話（はな）せましたね！日本語（にほんご）がどんどん上手（じょうず）になっていますよ。ほかにも何（なに）か話（はな）しましょうか？',
        romaji: 'Yoku hanasemashita ne! Nihongo ga dondon jouzu ni natte imasu yo. Hoka ni mo nanika hanashimashou ka?',
        english: 'Great speaking! Your Japanese is improving steadily. Shall we chat about anything else?',
        correction: null,
        suggestedReplies: [
          'はい、もっと練習したいです！',
          '日本語の勉強は楽しいです。',
          'さくら先生、ありがとうございます！'
        ]
      };
    }

    res.json({ success: true, data: reply });

  } catch (e) {
    console.error('AI chat route error:', e.message);
    res.json({
      success: true,
      data: {
        japanese: '素晴らしい（すばらしい）です！一緒（いっしょ）に日本語（にほんご）を練習（れんしゅう）しましょう！',
        romaji: 'Subarashii desu! Issho ni nihongo wo renshuu shimashou!',
        english: 'Wonderful! Let\'s practice Japanese together!',
        suggestedReplies: ['はい、がんばります！', 'よろしくお願いします！']
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
