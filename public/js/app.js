// ── STATE ──
let S = {
  level:'N5', xp:0, streak:0, lastStudied:null, studyTimeSeconds:0,
  completedLessons:[], testResults:[], progress:{}, achievements:[], xpHistory:[],
  weakAreas:{}, activityLog:{}, settings:{theme:'light'},
  timerRunning:false, timerSeconds:0, timerInterval:null, lastSyncedSeconds: 0,
  currentQuiz:null, currentExam:null, examTimer:null,
  learnedKanji:{},
  username: null,
};
let reminders=[];

let currentUser = localStorage.getItem('jlptEmail');
let currentToken = localStorage.getItem('jlptToken');
let isGuest = !currentUser || localStorage.getItem('jlptGuest') === 'true';

// Auto-Guest if fresh visit without account
if (!currentUser && !localStorage.getItem('jlptGuest')) {
  isGuest = true;
  localStorage.setItem('jlptGuest', 'true');
}

// ── DATE HELPERS ──
function todayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function yesterdayKey() {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ── LOCAL STORAGE (Universal Offline & Instant Persistence) ──
const LS_APP_KEY = 'jlpt_app_state';
const LS_GUEST_KEY = 'jlpt_guest_state';

function saveLocalState() {
  const snap = {
    level: S.level, xp: S.xp, streak: S.streak,
    lastStudied: S.lastStudied, studyTimeSeconds: S.studyTimeSeconds,
    testResults: S.testResults, progress: S.progress,
    weakAreas: S.weakAreas, activityLog: S.activityLog,
    learnedKanji: S.learnedKanji, settings: S.settings,
    xpHistory: S.xpHistory,
    reminders: reminders,
    username: S.username
  };
  try {
    const json = JSON.stringify(snap);
    localStorage.setItem(LS_APP_KEY, json);
    localStorage.setItem(LS_GUEST_KEY, json);
  } catch(e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

function loadLocalState() {
  try {
    const raw = localStorage.getItem(LS_APP_KEY) || localStorage.getItem(LS_GUEST_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}

function applyStateData(d, isServerMerge = false) {
  if (!d) return;
  if (isServerMerge) {
    // Intelligent merge: local progress is NEVER wiped out by older or empty server data
    S.level = d.level || S.level || 'N5';
    S.xp = Math.max(S.xp || 0, d.xp || 0);
    S.studyTimeSeconds = Math.max(S.studyTimeSeconds || 0, d.studyTimeSeconds || 0);
    S.streak = Math.max(S.streak || 0, d.streak || 0);
    
    // Pick the latest lastStudied date
    if (d.lastStudied) {
      if (!S.lastStudied || d.lastStudied >= S.lastStudied) {
        S.lastStudied = d.lastStudied;
      }
    }
    
    // Merge progress & kanji (union of all learned items)
    S.progress = Object.assign({}, d.progress || {}, S.progress || {});
    S.learnedKanji = Object.assign({}, d.learnedKanji || {}, (d.progress && d.progress.learnedKanji) || {}, S.learnedKanji || {});
    S.weakAreas = Object.assign({}, d.weakAreas || {}, S.weakAreas || {});
    S.activityLog = Object.assign({}, d.activityLog || {}, S.activityLog || {});
    
    // Deduplicate test results
    const combinedTests = [...(S.testResults || []), ...(d.testResults || [])];
    const testMap = new Map();
    combinedTests.forEach(t => {
      const key = `${t.title || 'Test'}_${t.timestamp || 0}_${t.score || 0}`;
      if (!testMap.has(key)) testMap.set(key, t);
    });
    S.testResults = Array.from(testMap.values()).sort((a,b) => (b.timestamp || 0) - (a.timestamp || 0)).slice(0, 30);

    // Deduplicate XP history
    const combinedXP = [...(S.xpHistory || []), ...(d.xpHistory || [])];
    const xpMap = new Map();
    combinedXP.forEach(x => {
      const key = `${x.date}_${x.amount}_${x.reason}`;
      if (!xpMap.has(key)) xpMap.set(key, x);
    });
    S.xpHistory = Array.from(xpMap.values()).sort((a,b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 50);

    if (d.settings) S.settings = Object.assign({}, S.settings, d.settings);
    if (d.reminders && d.reminders.length) reminders = d.reminders;
    if (d.username || d._username) S.username = d.username || d._username;
  } else {
    // Initial local hydration
    if (d.level) S.level = d.level;
    if (d.xp !== undefined) S.xp = d.xp;
    if (d.streak !== undefined) S.streak = d.streak;
    if (d.lastStudied) S.lastStudied = d.lastStudied;
    if (d.studyTimeSeconds !== undefined) S.studyTimeSeconds = d.studyTimeSeconds;
    if (d.completedLessons) S.completedLessons = d.completedLessons;
    if (d.testResults) S.testResults = d.testResults;
    if (d.progress) S.progress = d.progress;
    if (d.achievements) S.achievements = d.achievements;
    if (d.weakAreas) S.weakAreas = d.weakAreas;
    if (d.activityLog) S.activityLog = d.activityLog;
    if (d.xpHistory) S.xpHistory = d.xpHistory;
    if (d.settings) S.settings = d.settings;
    if (d.learnedKanji) S.learnedKanji = d.learnedKanji;
    else if (d.progress && d.progress.learnedKanji) S.learnedKanji = d.progress.learnedKanji;
    if (d.reminders && d.reminders.length) reminders = d.reminders;
    if (d.username || d._username) S.username = d.username || d._username;
  }
}

// ── API (Local-First + Server Sync) ──
const api = async (method, path, body) => {
  // Always update in-memory state and save to local storage immediately
  if (method === 'PATCH' && body) {
    if (body.reminders !== undefined) reminders = body.reminders;
    Object.keys(body).forEach(k => { if (body[k] !== undefined) S[k] = body[k]; });
    if (body.progress && !body.learnedKanji && S.learnedKanji) {
      body.learnedKanji = S.learnedKanji;
    }
    saveLocalState();
  } else if (method === 'POST') {
    if (path === '/api/study-time' && body && body.seconds) {
      S.studyTimeSeconds = (S.studyTimeSeconds || 0) + body.seconds;
      saveLocalState();
    } else if (path === '/api/xp' && body && body.amount) {
      S.xp = (S.xp || 0) + body.amount;
      saveLocalState();
    }
  }

  // If Guest, local storage is the source of truth for user state persistence routes
  if (isGuest && (path.startsWith('/api/state') || path === '/api/xp' || path === '/api/study-time')) {
    if (method === 'GET') {
      const d = loadLocalState();
      return { success: true, data: d || {} };
    }
    return { success: true };
  }

  // For all users (guests & authenticated), sync/fetch with server
  try {
    const r = await fetch(path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': currentUser || 'guest',
        ...(currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });
    const res = await r.json();
    return res;
  } catch(e) {
    console.warn('Server sync offline/unavailable, preserved local state:', e.message);
    return { success: true, localOnly: true };
  }
};

// ── AUTHENTICATION ──
function showAuthPage() {
  document.getElementById('auth-layer').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}
function closeAuthPage() {
  if (currentUser || isGuest) {
    document.getElementById('auth-layer').style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}
function toggleAuth(isReg) {
  document.getElementById('authUsernameGroup').style.display = isReg ? 'block' : 'none';
  document.getElementById('registerActions').style.display = isReg ? 'block' : 'none';
  document.getElementById('loginActions').style.display = isReg ? 'none' : 'block';
  document.getElementById('authError').style.display = 'none';
}
async function handleAuth(type) {
  const email = document.getElementById('authEmail').value.trim();
  const pwd = document.getElementById('authPwd').value.trim();
  const user = document.getElementById('authUsername').value.trim();
  const errEl = document.getElementById('authError');
  const btn = document.querySelector(type === 'register' ? '#registerActions .btn-primary' : '#loginActions .btn-primary');
  errEl.style.display = 'none';

  if (!email || !pwd) {
    errEl.textContent = 'Please enter both email and password.';
    errEl.style.display = 'block';
    return;
  }
  if (type === 'register' && !user) {
    errEl.textContent = 'Please choose a username.';
    errEl.style.display = 'block';
    return;
  }

  const originalText = btn ? btn.textContent : '';
  if (btn) { btn.textContent = 'Please wait...'; btn.disabled = true; }

  try {
    const r = await fetch(`/api/auth/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pwd, username: user })
    });
    const res = await r.json();

    if (res.success && res.token) {
      localStorage.setItem('jlptEmail', email);
      localStorage.setItem('jlptToken', res.token);
      localStorage.removeItem('jlptGuest');
      isGuest = false;
      currentUser = email;
      currentToken = res.token;

      // Migrate existing local progress into the account
      const localState = loadLocalState();
      if (localState) {
        try {
          await fetch('/api/state', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'x-user-email': email,
              'Authorization': `Bearer ${res.token}`
            },
            body: JSON.stringify(localState)
          });
        } catch(e) {}
      }
      location.reload();
    } else {
      errEl.textContent = res.error || 'Authentication failed. Please try again.';
      errEl.style.display = 'block';
      if (btn) { btn.textContent = originalText; btn.disabled = false; }
    }
  } catch (e) {
    errEl.textContent = 'Network error. Make sure the server is running.';
    errEl.style.display = 'block';
    if (btn) { btn.textContent = originalText; btn.disabled = false; }
  }
}
function handleLogout() {
  localStorage.removeItem('jlptEmail');
  localStorage.removeItem('jlptToken');
  localStorage.setItem('jlptGuest', 'true');
  location.reload();
}
function continueAsGuest() {
  localStorage.setItem('jlptGuest', 'true');
  localStorage.removeItem('jlptEmail');
  localStorage.removeItem('jlptToken');
  location.reload();
}

// ── INIT ──
async function init(){
  // 1. Immediately hydrate from local storage
  const localData = loadLocalState();
  if (localData) {
    applyStateData(localData, false);
  }

  const DEFAULT_REMINDERS = [
    { id: 1, time: '08:00', label: 'Morning vocabulary practice!', enabled: true },
    { id: 2, time: '21:00', label: 'Evening grammar review!', enabled: true }
  ];
  if (!reminders || !reminders.length) reminders = DEFAULT_REMINDERS;

  const al = document.getElementById('auth-layer');
  if (al) al.style.display = 'none';
  document.body.style.overflow = 'auto';

  const navAuthBtn = document.getElementById('navAuthBtn');
  if (navAuthBtn) {
    if (isGuest) {
      navAuthBtn.textContent = 'Sign In';
      navAuthBtn.onclick = showAuthPage;
    } else {
      navAuthBtn.textContent = 'Logout';
      navAuthBtn.onclick = handleLogout;
    }
  }

  if (!S.username && currentUser) S.username = currentUser.split('@')[0];
  applyTheme();
  updateLevelUI();
  
  // Auto-mark visit for study streak
  markActivity();
  
  // Initial render
  renderDashboard();
  renderStudyTimer();
  initReminderEngine();
  initMotivationalQuoteSystem();
  if(!document.querySelector('.mob-nav')) initMobileNav();
  initHashRouter();

  // 2. In background, if logged in, sync with server and merge
  if (!isGuest && currentUser) {
    try {
      const r = await api('GET', '/api/state');
      if (r && r.success && r.data && Object.keys(r.data).length > 0) {
        applyStateData(r.data, true);
        saveLocalState();
        updateLevelUI();
        renderDashboard();
        // Persist merged data back to server
        api('PATCH', '/api/state', {
          xp: S.xp, streak: S.streak, lastStudied: S.lastStudied,
          studyTimeSeconds: S.studyTimeSeconds, progress: S.progress,
          learnedKanji: S.learnedKanji, testResults: S.testResults,
          weakAreas: S.weakAreas, activityLog: S.activityLog,
          xpHistory: S.xpHistory
        });
      }
    } catch(e) {
      console.warn('Background server sync error:', e);
    }
  }
}

// ── THEME ──
function applyTheme(){/* light is default, dark adds class */if(S.settings.theme==='dark')document.body.classList.add('dark-mode');else document.body.classList.remove('dark-mode');}
function toggleTheme(){
  S.settings.theme=S.settings.theme==='dark'?'light':'dark';
  applyTheme();
  document.querySelector('.theme-btn').textContent=S.settings.theme==='dark'?'🌙':'☀️';
  api('PATCH','/api/state',{settings:S.settings});
}

// ── NAVIGATION & HASH ROUTER ──
function initHashRouter() {
  const handleHash = () => {
    const rawHash = (window.location.hash || '').replace(/^#\/?/, '').trim();
    if (rawHash) {
      const validPages = ['dashboard', 'learn', 'practice', 'test', 'exam', 'tracker', 'reminders', 'aivoice', 'resource'];
      if (validPages.includes(rawHash)) {
        goto(rawHash);
      }
    }
  };
  window.addEventListener('hashchange', handleHash);
  if (window.location.hash) {
    handleHash();
  }
}

function goto(page,btn){
  // Stop ongoing timed exam countdown if navigating away
  if (page !== 'exam' && S.examTimer) {
    clearInterval(S.examTimer);
    S.examTimer = null;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  const targetPage = document.getElementById('page-' + page);
  if (!targetPage) return;

  document.body.style.overflow = 'auto';
  document.querySelectorAll('.modal-overlay').forEach(m => { m.classList.remove('open'); m.classList.remove('active'); });
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  targetPage.classList.add('active');

  // Sync active navigation state on desktop and mobile
  document.querySelectorAll('.nav-btn').forEach(n => {
    const isTarget = n === btn || n.getAttribute('onclick')?.includes(`'${page}'`);
    n.classList.toggle('active', !!isTarget);
  });
  document.querySelectorAll('.mob-nav-btn').forEach(m => {
    const isTarget = m === btn || m.getAttribute('onclick')?.includes(`'${page}'`);
    m.classList.toggle('active', !!isTarget);
  });

  // Sync URL hash seamlessly
  if (window.location.hash.replace(/^#\/?/, '') !== page) {
    try { history.replaceState(null, '', '#' + page); } catch(e) {}
  }

  if(page==='dashboard')renderDashboard();
  else if(page==='learn')renderLearn();
  else if(page==='practice'){renderPractice('kana');document.querySelectorAll('#practiceTabs .tab-btn')[0]?.classList.add('active');}
  else if(page==='test')renderTestSets();
  else if(page==='exam')renderExamLobby();
  else if(page==='tracker')renderTracker();
  else if(page==='reminders')renderReminders();
  else if(page==='aivoice')initAiVoiceChat();
  else if(page==='resource')renderResource();
}

// ── LEVEL ──
function setLevel(lvl,btn){
  S.level=lvl;
  document.querySelectorAll('.lvl-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  updateLevelUI();
  api('PATCH','/api/state',{level:lvl});
  toast(`Switched to ${lvl} content`);
  const active=document.querySelector('.page.active');
  if(active){const pid=active.id.replace('page-','');goto(pid);}
}
function updateLevelUI(){
  const lb=document.getElementById('learnLevelBadge');
  if(lb)lb.textContent=S.level;
  document.getElementById('examLevelLabel').textContent=S.level;
  document.getElementById('streakNum').textContent=S.streak;
}

// ── DASHBOARD ──
function renderDashboard(){
  const now=new Date();
  document.getElementById('dashDate').textContent=now.toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  const greetingEl = document.getElementById('dashGreeting');
  const displayName = S.username || 'Guest';
  if(greetingEl) greetingEl.textContent = displayName + '!';

  const vocab=VOCAB[S.level]||[];
  const grammar=GRAMMAR[S.level]||[];
  const kanji=KANJI[S.level]||[];
  const kDone=Object.keys(S.learnedKanji).filter(k=>k.endsWith('_'+S.level)&&S.learnedKanji[k]).length;

  // Today card — day based on streak
  const day=Math.max(1,S.streak||1);
  const phases = S.level === 'N5' ? [
    {num:0, days:[1,5],name:'Writing Systems',tasks:['Basic Hiragana (46 chars)','Basic Katakana (46 chars)','Practice writing common words','Writing quiz & review','Intermediate writing drill'], keys:['cl-N5-w1','cl-N5-w2','cl-N5-w3','cl-N5-w4']},
    {num:1, days:[6,12],name:'Vocabulary milestones',tasks:['Numbers, counters, dates','Greetings & daily phrases','Family & body parts','Food, places, transport','Core verbs (25 words)','Adjectives (top 25)','Vocab full review'], keys:['cl-N5-v1','cl-N5-v2','cl-N5-v3','cl-N5-v4','cl-N5-v5']},
    {num:2, days:[13,20],name:'Grammar patterns',tasks:['は vs が particle','を + verb conjugation','に で から まで','Neg + question forms','Past tense ~ました','あります vs います','い-adj & な-adj','〜たい review'], keys:['cl-N5-g1','cl-N5-g2','cl-N5-g3','cl-N5-g4']},
    {num:3, days:[21,26],name:'Kanji Mastery',tasks:['Numbers (13)','Time/calendar kanji','People & nature','Action/directions','Kanji compounds','Reading with kanji'], keys:['cl-N5-k1','cl-N5-k2','cl-N5-k3']},
    {num:4, days:[27,35],name:'Exam Simulation',tasks:['Listening scenarios drill','AI free conversation roleplay','Section practice test','Live timed exam pass (≥60%)'], keys:['cl-N5-e1','cl-N5-e2','cl-N5-e3','cl-N5-e4']}
  ] : [
    {num:1, days:[1,7],name:'Advanced Vocabulary',tasks:['Complex objects','Abstract nouns','Advanced verbs','Formal expressions','Vocab drills','Contextual review'], keys:['cl-N4-v1','cl-N4-v2','cl-N4-v3']},
    {num:2, days:[8,18],name:'N4 Grammar',tasks:['Conditionals ~tara','Passive & causative','Hearsay ~rashii','Honorifics & keigo','Giving & receiving ~ageru'], keys:['cl-N4-g1','cl-N4-g2','cl-N4-g3','cl-N4-g4','cl-N4-g5']},
    {num:3, days:[19,25],name:'Kanji Mastery',tasks:['Identify 300 total kanji','Kanji compounds (N4)','Complex readings','Advanced stroke order'], keys:['cl-N4-k1','cl-N4-k2','cl-N4-k3']},
    {num:4, days:[26,35],name:'Exam Simulation',tasks:['N4 listening dialogue','N4 reading passage drill','N4 live exam simulation'], keys:['cl-N4-e1','cl-N4-e2','cl-N4-e3']}
  ];
  
  let activePhaseIndex = 0;
  for (let i = 0; i < phases.length; i++) {
    const isDone = phases[i].keys && phases[i].keys.length > 0 && phases[i].keys.every(k=>S.progress[k]);
    const isStarted = phases[i].keys && phases[i].keys.some(k=>S.progress[k]);
    
    if (isDone) {
      activePhaseIndex = i;
    } else if (isStarted || i === 0) {
      activePhaseIndex = i;
      break; 
    } else {
      break;
    }
  }
  
  let cp = phases[activePhaseIndex];
  const cpDone = cp.keys && cp.keys.length > 0 && cp.keys.every(k=>S.progress[k]);
  
  // Try to determine tasks completed in current phase
  let tasksDone = 0;
  if (cp.keys) tasksDone = cp.keys.filter(k=>S.progress[k]).length;
  const currentTaskText = cp.tasks[Math.min(tasksDone, cp.tasks.length-1)] || cp.tasks[0];

  const todayCard = document.querySelector('.today-card');
  if(todayCard){
    const quoteHtml = getTodayQuoteHtml();
    if(cpDone){
      todayCard.style.background = 'var(--teal)';
      todayCard.innerHTML = `<div class="today-label">PHASE ${cp.num} COMPLETE 🌟</div>
        <div class="today-phase" style="font-size:24px;margin-bottom:8px">Congratulations!</div>
        <div class="today-task today-quote-wrap" id="todayQuoteArea" onclick="cycleDarkMotivationQuote()" title="Click for new motivation & audio" style="font-size:13px;color:rgba(255,255,255,0.95);font-style:italic;line-height:1.5">${quoteHtml}</div>`;
    } else {
      todayCard.style.background = '';
      todayCard.innerHTML = `<div class="today-label">STUDY TASK</div>
        <div class="today-day">P${cp.num}</div>
        <div class="today-phase">${cp.name}</div>
        <div class="today-task" style="margin-bottom:6px">${currentTaskText}</div>
        <div class="today-quote-wrap" id="todayQuoteArea" onclick="cycleDarkMotivationQuote()" title="Click for new motivation & audio" style="border-top:1px solid rgba(255,255,255,0.18);padding-top:6px;font-size:11.5px;color:rgba(255,255,255,0.9);font-style:italic;line-height:1.4">${quoteHtml}</div>`;
    }
  }

  // Stats
  const vDone = Object.keys(S.progress||{}).filter(k=>k.startsWith('voc-')&&S.progress[k]&&k.endsWith('_'+S.level)).length;
  const gramDone = Object.keys(S.progress||{}).filter(k=>k.startsWith('gram-')&&S.progress[k]&&k.endsWith('_'+S.level)).length;
  
  const vPct = vocab.length ? Math.min(1, vDone / vocab.length) : 0;
  const gPct = grammar.length ? Math.min(1, gramDone / grammar.length) : 0;
  const kPct = kanji.length ? Math.min(1, kDone / kanji.length) : 0;

  document.getElementById('statVoc').innerHTML = vPct >= 1 ? `<span style="color:var(--teal);font-size:18px">All ${vocab.length} Mastered! 🌟</span>` : `${vDone} <span class="sep">/</span><span class="total"> ${vocab.length}</span>`;
  document.getElementById('sfVoc').style.width = (vPct*100) + '%';
  if(vPct >= 1) document.getElementById('sfVoc').style.background = 'var(--gold)';

  document.getElementById('statGram').innerHTML = gPct >= 1 ? `<span style="color:var(--teal);font-size:18px">All ${grammar.length} Mastered! 🌟</span>` : `${gramDone} <span class="sep">/</span><span class="total"> ${grammar.length}</span>`;
  document.getElementById('sfGram').style.width = (gPct*100) + '%';
  if(gPct >= 1) document.getElementById('sfGram').style.background = 'var(--gold)';

  document.getElementById('statKanji').innerHTML = kPct >= 1 ? `<span style="color:var(--teal);font-size:18px">All ${kanji.length} Mastered! 🌟</span>` : `${kDone} <span class="sep">/</span><span class="total"> ${kanji.length}</span>`;
  document.getElementById('sfKanji').style.width = (kPct*100) + '%';
  if(kPct >= 1) document.getElementById('sfKanji').style.background = 'var(--gold)';

  document.getElementById('statFlash').innerHTML = `${S.xp}`;
  document.getElementById('sfFlash').style.width = Math.min(100,(S.xp%500)/5)+'%';

  // Phase timeline
  const pt=document.getElementById('phaseTimeline');
  const colors=['var(--teal)','var(--indigo)','var(--gold)','var(--red)','var(--teal-mid)'];
  if(pt)pt.innerHTML=phases.map((ph,i)=>{
    const isTrackerDone = ph.keys && ph.keys.length > 0 && ph.keys.every(k=>S.progress[k]);
    const pct = isTrackerDone ? 100 : (day>ph.days[1]?100:(day<ph.days[0]?0:Math.round((day-ph.days[0]+1)/(ph.days[1]-ph.days[0]+1)*100)));
    const status = isTrackerDone ? 'done' : (day>ph.days[1]?'done':day>=ph.days[0]?'current':'upcoming');
    const badge = status==='done'?'<span class="phase-badge badge-done">Done</span>':status==='current'?'<span class="phase-badge badge-current">Current</span>':'<span class="phase-badge badge-upcoming">Upcoming</span>';
    return`<div class="phase-item"><div class="phase-dot" style="background:${colors[i%colors.length]}"></div><div class="phase-info"><div class="phase-name">Phase ${ph.num} — ${ph.name}</div><div class="phase-meta">Days ${ph.days[0]}–${ph.days[1]}</div><div class="phase-prog-bar"><div class="phase-prog-fill" style="background:${colors[i%colors.length]};width:${pct}%"></div></div></div>${badge}</div>`;
  }).join('');

  // Calendar
  buildCal();

  // Reminders
  const dr=document.getElementById('dashReminders');
  if(dr){
    const active=(reminders||[]).filter(r=>r.enabled);
    dr.innerHTML=active.length?active.map(r=>`<div class="reminder-row"><div class="rem-dot"></div>${r.label}<div class="rem-time">${r.time}</div></div>`).join(''):'<div style="font-size:13px;color:var(--muted)">No active reminders.</div>';
  }

  // Weak Areas
  const wa=document.getElementById('weakAreasPanel');
  const waKeys=Object.keys(S.weakAreas).sort((a,b)=>S.weakAreas[b]-S.weakAreas[a]);
  if(wa)wa.innerHTML=waKeys.length?waKeys.slice(0,5).map(k=>`<div class="weak-item"><span>${k}</span><span style="color:var(--red);font-weight:600">${S.weakAreas[k]} errors</span></div>`).join(''):'<div style="font-size:13px;color:var(--muted)">Take tests to identify weak areas!</div>';

  // Test History
  const th=document.getElementById('testHistoryPanel');
  if(th)th.innerHTML=S.testResults.slice(0,4).map(t=>`<div class="test-hist-item"><div style="display:flex;justify-content:space-between"><strong>${t.title||'Test'}</strong><span class="test-hist-score" style="color:${t.score>=60?'var(--teal)':'var(--red)'}">${Math.round(t.score)}%</span></div><div style="color:var(--muted);font-size:11px">${new Date(t.timestamp).toLocaleDateString()} · ${t.correct||0}/${t.total||0} correct</div></div>`).join('')||'<div style="font-size:13px;color:var(--muted)">No tests taken yet.</div>';

  // 5-Min Energetic Dark Motivation Quote
  updateTodayQuoteArea(currentMotivationalQuote);
}

// ── ⚡ ENERGETIC DARK MOTIVATIONAL QUOTES (5-MIN ROTATION + 10S TOAST) ──
const DARK_MOTIVATION_QUOTES = [
  {
    jp: '七転（ななころ）び八起（やお）き',
    r: 'Nanakorobi yaoki',
    text: 'Fall seven times, stand up eight.',
    source: '七転び八起き (Japanese Proverb)'
  },
  {
    jp: '勝（か）って兜（かぶと）の緒（お）を締（し）めよ',
    r: 'Katte kabuto no o wo shimeyo',
    text: 'After victory, tighten your helmet cords.',
    source: '武士道 (Samurai Code)'
  },
  {
    jp: '臥薪嘗胆（がしんしょうたん）',
    r: 'Gashin shōtan',
    text: 'Endure bitter struggle. Rule tomorrow.',
    source: '臥薪嘗胆 (Bushido Maxim)'
  },
  {
    jp: '一刀両断（いっとうりょうだん）',
    r: 'Ittō ryōdan',
    text: 'Cut clean through hesitation in one strike.',
    source: '一刀両断 (Bushido Maxim)'
  },
  {
    jp: '背水（はいすい）の陣（じん）',
    r: 'Haisui no jin',
    text: 'Burn every bridge. Victory or nothing.',
    source: '背水の陣 (Battle Maxim)'
  },
  {
    jp: '継続（けいぞく）は力（ちから）なり',
    r: 'Keizoku wa chikara nari',
    text: 'Consistency is supreme, lethal power.',
    source: '継続は力なり (Japanese Proverb)'
  },
  {
    jp: '不撓不屈（ふとうふくつ）',
    r: 'Futō fukutsu',
    text: 'An unyielding spirit bends for no obstacle.',
    source: '不撓不屈 (Samurai Creed)'
  },
  {
    jp: '百錬成鋼（ひゃくれんせいこう）',
    r: 'Hyakuren seikō',
    text: 'Iron becomes steel only through the fire.',
    source: '百錬成鋼 (Ancient Wisdom)'
  },
  {
    jp: '己（おのれ）に勝（か）つ',
    r: 'Onore ni katsu',
    text: 'Slay the weak version of yourself.',
    source: '己に勝つ (Bushido Principle)'
  },
  {
    jp: '明鏡止水（めいきょうしすい）',
    r: 'Meikyō shisui',
    text: 'Clear mind, lethal and absolute focus.',
    source: '明鏡止水 (Zen Philosophy)'
  },
  {
    jp: '初志貫徹（しょしかんてつ）',
    r: 'Shoshi kantetsu',
    text: 'Pierce through to the end. No excuses.',
    source: '初志貫徹 (Yojijukugo)'
  },
  {
    jp: '獅子奮迅（ししふんじん）',
    r: 'Shishi funjin',
    text: 'Attack with the fury of an unchained beast.',
    source: '獅子奮迅 (Warrior Maxim)'
  },
  {
    jp: '日進月歩（にっしんげっぽ）',
    r: 'Nisshin geppo',
    text: 'Relentless progress. Refuse to be average.',
    source: '日進月歩 (Evolution Code)'
  },
  {
    jp: '知行合一（ちこうごういつ）',
    r: 'Chikō gōitsu',
    text: 'Knowing is nothing. Massive action is truth.',
    source: '知行合一 (Bushido Code)'
  },
  {
    jp: '一期一会（いちごいちえ）',
    r: 'Ichigo ichie',
    text: 'Dominate this exact breath and hour.',
    source: '一期一会 (Way of Mastery)'
  },
  {
    jp: '塵（ちり）も積（つ）もれば山（やま）となる',
    r: 'Chiri mo tsumoreba yama to naru',
    text: 'Small daily disciplines build empires.',
    source: '塵積山 (Japanese Proverb)'
  },
  {
    jp: '精神一到（せいしんいっとう）何事（なにごと）か成（な）らざらん',
    r: 'Seishin ittō nanigoto ka narazaran',
    text: 'Obsessed focus breaks every barrier.',
    source: '精神一到 (Ancient Creed)'
  },
  {
    jp: '乾坤一擲（けんこんいってき）',
    r: 'Kenkon itteki',
    text: 'Stake everything on this battle. Win.',
    source: '乾坤一擲 (Grand Destiny)'
  },
  {
    jp: '明（あ）けない夜（よる）はない',
    r: 'Akenai yoru wa nai',
    text: 'No night lasts forever. Force the dawn.',
    source: '明けない夜はない (Proverb)'
  },
  {
    jp: '切磋琢磨（せっさたくま）',
    r: 'Sessa takuma',
    text: 'Grind relentlessly until your blade never dulls.',
    source: '切磋琢磨 (Samurai Creed)'
  }
];

let currentMotivationalQuote = DARK_MOTIVATION_QUOTES[0];
let nextQuoteSeconds = 300; // 5 minutes
let floatingQuoteTimeout = null;

function getRandomDarkMotivationQuote() {
  const cur = currentMotivationalQuote ? currentMotivationalQuote.jp : '';
  const candidates = DARK_MOTIVATION_QUOTES.filter(q => q.jp !== cur);
  return candidates[Math.floor(Math.random() * candidates.length)] || DARK_MOTIVATION_QUOTES[0];
}

function getTodayQuoteHtml(quote) {
  if (!quote) quote = currentMotivationalQuote || DARK_MOTIVATION_QUOTES[0];
  return `&ldquo;${quote.text}&rdquo;<br><span style="opacity:0.85;font-style:normal;font-size:0.9em;display:inline-block;margin-top:4px">&mdash; ${quote.source}</span>`;
}

function updateTodayQuoteArea(quote) {
  if (!quote) quote = currentMotivationalQuote || DARK_MOTIVATION_QUOTES[0];
  const area = document.getElementById('todayQuoteArea');
  if (!area) return;
  area.style.opacity = '0';
  area.style.transform = 'translateY(-3px)';
  setTimeout(() => {
    area.innerHTML = getTodayQuoteHtml(quote);
    area.style.opacity = '1';
    area.style.transform = 'translateY(0)';
  }, 220);
}

function cycleDarkMotivationQuote() {
  currentMotivationalQuote = getRandomDarkMotivationQuote();
  nextQuoteSeconds = 300;
  updateTodayQuoteArea(currentMotivationalQuote);
  const cleanAudio = cleanRubyAudio(currentMotivationalQuote.jp);
  playJapaneseAudio(cleanAudio);
  toast('⚡ ' + (currentMotivationalQuote.r || 'Dark Motivation'));
}

function showFloatingQuotePopup(quote) {
  const popup = document.getElementById('floatingQuoteToast');
  if (!popup) return;

  if (floatingQuoteTimeout) {
    clearTimeout(floatingQuoteTimeout);
    floatingQuoteTimeout = null;
  }

  const cleanAudio = cleanRubyAudio(quote.jp);

  popup.innerHTML = `
    <div class="fqt-card" style="background:rgba(18, 18, 26, 0.97);border:1.5px solid #ff3e3e;box-shadow:0 12px 35px rgba(255,62,62,0.3);color:#fff">
      <div class="fqt-header">
        <div class="fqt-badge" style="background:rgba(255,62,62,0.18);color:#ff5252;border:1px solid rgba(255,62,62,0.35)">
          <span class="pulse-dot" style="background:#ff3e3e;box-shadow:0 0 8px #ff3e3e"></span>
          <span>⚡ DARK MOTIVATION</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <button class="fqt-audio-btn" style="background:rgba(255,255,255,0.1);color:#fff;border-color:rgba(255,255,255,0.2)" onclick="playJapaneseAudio('${cleanAudio}')" title="Listen Pronunciation">🔊</button>
          <button class="fqt-close-btn" style="background:rgba(255,255,255,0.1);color:#fff;border-color:rgba(255,255,255,0.2)" onclick="dismissFloatingQuote()" title="Close">✕</button>
        </div>
      </div>
      <div class="fqt-jp" style="color:#fff;font-size:16.5px">${formatFuriganaRuby(quote.jp)}</div>
      <div class="fqt-romaji" style="color:#ff8a80;font-size:11.5px"><code>${quote.r}</code></div>
      <div class="fqt-en" style="color:rgba(255,255,255,0.94);font-size:12.5px;font-style:italic">&ldquo;${quote.text}&rdquo;<br><span style="font-size:11px;opacity:0.75">&mdash; ${quote.source}</span></div>
      <div class="fqt-timer-bar-wrap" style="background:rgba(255,255,255,0.15)">
        <div class="fqt-timer-bar" style="background:#ff3e3e"></div>
      </div>
    </div>
  `;

  popup.style.display = 'block';
  popup.classList.remove('hiding');
  popup.classList.add('showing');

  // Auto-dismiss after exactly 10 seconds (10000ms)
  floatingQuoteTimeout = setTimeout(() => {
    dismissFloatingQuote();
  }, 10000);
}

function dismissFloatingQuote() {
  const popup = document.getElementById('floatingQuoteToast');
  if (!popup) return;
  if (floatingQuoteTimeout) {
    clearTimeout(floatingQuoteTimeout);
    floatingQuoteTimeout = null;
  }
  popup.classList.remove('showing');
  popup.classList.add('hiding');
  setTimeout(() => {
    popup.style.display = 'none';
    popup.classList.remove('hiding');
  }, 350);
}

function updateDarkMotivationalQuote() {
  currentMotivationalQuote = getRandomDarkMotivationQuote();
  updateTodayQuoteArea(currentMotivationalQuote);

  // If user is on another screen (not dashboard), pop up for 10 seconds!
  const isDashActive = document.getElementById('page-dashboard') && 
                        document.getElementById('page-dashboard').classList.contains('active');
  if (!isDashActive) {
    showFloatingQuotePopup(currentMotivationalQuote);
  }
}

function initMotivationalQuoteSystem() {
  if (!currentMotivationalQuote) {
    currentMotivationalQuote = DARK_MOTIVATION_QUOTES[0];
  }
  updateTodayQuoteArea(currentMotivationalQuote);

  // 1-second ticker managing the 300-second (5 min) countdown
  if (window._quoteCountdownInterval) clearInterval(window._quoteCountdownInterval);
  window._quoteCountdownInterval = setInterval(() => {
    nextQuoteSeconds--;
    if (nextQuoteSeconds <= 0) {
      nextQuoteSeconds = 300;
      updateDarkMotivationalQuote();
    }
  }, 1000);
}

function buildCal(){
  const cal=document.getElementById('miniCal');
  if(!cal) return;
  const today=new Date();
  const yr=today.getFullYear();
  const mo=today.getMonth();
  const start=new Date(yr,mo,1);
  const dow=(start.getDay()+6)%7; // Monday-first
  const days=new Date(yr,mo+1,0).getDate();
  const todayNum=today.getDate();
  
  // Month label
  const monthNames=['January','February','March','April','May','June','July','August','September','October','November','December'];
  
  let html=`<div class="cal-month-label">${monthNames[mo]} ${yr}</div>`;
  html+='<div class="cal-day-headers"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span></div>';
  html+='<div class="cal-grid">';
  for(let i=0;i<dow;i++) html+='<div class="cal-cell"></div>';
  for(let d=1;d<=days;d++){
    // Use zero-padded key to match markActivity format
    const key=`${yr}-${String(mo+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    let cls = '';
    const isActive = S.activityLog[key];
    if(isActive) cls += ' done';
    if(d===todayNum) cls += ' today';
    html+=`<div class="cal-cell${cls}" title="${key}${isActive?' — Studied':''}"><span>${d}</span></div>`;
  }
  html+='</div>';
  cal.innerHTML=html;
}

// ── AUDIO TTS ──
function playJapaneseAudio(text) {
  if (!text || !('speechSynthesis' in window)) return;
  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.cancel();

    // Clean text: strip HTML, remove parenthesized furigana so words aren't doubled, clean separators
    let cleanText = String(text)
      .replace(/<[^>]*>/g, '')
      .replace(/（[^）]*）/g, '')
      .replace(/\([^)]*\)/g, '')
      .replace(/[/／·・]/g, '、')
      .trim();

    // Fallback: if entire text was inside parentheses, use text without brackets
    if (!cleanText) {
      cleanText = String(text).replace(/<[^>]*>/g, '').replace(/[()（）]/g, '').trim();
    }

    if (!cleanText || cleanText === '—') return;
    const u = new SpeechSynthesisUtterance(cleanText);
    u.lang = 'ja-JP';
    u.rate = 0.85;
    
    // Pick Japanese voice if available
    const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
    const jpVoice = voices.find(v => (v.lang === 'ja-JP' || v.lang === 'ja_JP') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Haruka') || v.name.includes('Ayumi') || v.name.includes('Kyoko') || v.name.includes('Otoya') || v.name.includes('Nanami'))) ||
                    voices.find(v => v.lang === 'ja-JP' || v.lang === 'ja_JP' || (v.lang && v.lang.startsWith('ja')));
    if (jpVoice) u.voice = jpVoice;

    window.speechSynthesis.speak(u);
  } catch(e) {
    console.warn('Speech synthesis error:', e);
  }
}

function playCurrentKanjiAudio() {
  if (!currentKanjiObj) return;
  let toSpeak = '';
  if (currentKanjiObj.kun && currentKanjiObj.kun !== '—') {
    toSpeak = currentKanjiObj.kun.split('/')[0].trim();
  } else if (currentKanjiObj.on && currentKanjiObj.on !== '—') {
    toSpeak = currentKanjiObj.on.split('/')[0].trim();
  } else {
    toSpeak = currentKanjiObj.k || currentKanjiObj.char || '';
  }
  playJapaneseAudio(toSpeak);
}

function playKanjiReadingAudio(type) {
  if (!currentKanjiObj) return;
  const val = type === 'on' ? currentKanjiObj.on : currentKanjiObj.kun;
  if (val && val !== '—') {
    playJapaneseAudio(val);
  } else if (currentKanjiObj.k || currentKanjiObj.char) {
    playJapaneseAudio(currentKanjiObj.k || currentKanjiObj.char);
  }
}

// ── KANA TO ROMAJI CONVERTER ──
function kanaToRomaji(str) {
  if (!str || str === '—') return '';
  const map = {
    'きゃ':'kya','きゅ':'kyu','きょ':'kyo','しゃ':'sha','しゅ':'shu','しょ':'sho',
    'ちゃ':'cha','ちゅ':'chu','ちょ':'cho','にゃ':'nya','にゅ':'nyu','にょ':'nyo',
    'ひゃ':'hya','ひゅ':'hyu','ひょ':'hyo','みゃ':'mya','みゅ':'myu','みょ':'myo',
    'りゃ':'rya','りゅ':'ryu','りょ':'ryo','ぎゃ':'gya','ぎゅ':'gyu','ぎょ':'gyo',
    'じゃ':'ja','じゅ':'ju','じょ':'jo','びゃ':'bya','びゅ':'byu','びょ':'byo',
    'ぴゃ':'pya','ぴゅ':'pyu','ぴょ':'pyo',
    'キャ':'kya','キュ':'kyu','キョ':'kyo','シャ':'sha','シュ':'shu','ショ':'sho',
    'チャ':'cha','チュ':'chu','チョ':'cho','ニャ':'nya','ニュ':'nyu','ニョ':'nyo',
    'ヒャ':'hya','ヒュ':'hyu','ヒョ':'hyo','ミャ':'mya','ミュ':'myu','ミョ':'myo',
    'リャ':'rya','リュ':'ryu','リョ':'ryo','ギャ':'gya','ギュ':'gyu','ギョ':'gyo',
    'ジャ':'ja','ジュ':'ju','ジョ':'jo','ビャ':'bya','ビュ':'byu','ビョ':'byo',
    'ピャ':'pya','ピュ':'pyu','ピョ':'pyo',
    'あ':'a','い':'i','う':'u','え':'e','お':'o',
    'か':'ka','き':'ki','く':'ku','け':'ke','こ':'ko',
    'さ':'sa','し':'shi','す':'su','せ':'se','そ':'so',
    'た':'ta','ち':'chi','つ':'tsu','て':'te','と':'to',
    'な':'na','に':'ni','ぬ':'nu','ね':'ne','の':'no',
    'は':'ha','ひ':'hi','ふ':'fu','へ':'he','ほ':'ho',
    'ま':'ma','み':'mi','む':'mu','め':'me','も':'mo',
    'や':'ya','ゆ':'yu','よ':'yo',
    'ら':'ra','り':'ri','る':'ru','れ':'re','ろ':'ro',
    'わ':'wa','を':'wo','ん':'n',
    'が':'ga','ぎ':'gi','ぐ':'gu','げ':'ge','ご':'go',
    'ざ':'za','じ':'ji','ず':'zu','ぜ':'ze','ぞ':'zo',
    'だ':'da','ぢ':'ji','づ':'zu','で':'de','ど':'do',
    'ば':'ba','び':'bi','ぶ':'bu','べ':'be','ぼ':'bo',
    'ぱ':'pa','ぴ':'pi','ぷ':'pu','ぺ':'pe','ぽ':'po',
    'ア':'a','イ':'i','ウ':'u','エ':'e','オ':'o',
    'カ':'ka','キ':'ki','ク':'ku','ケ':'ke','コ':'ko',
    'サ':'sa','シ':'shi','ス':'su','セ':'se','ソ':'so',
    'タ':'ta','チ':'chi','ツ':'tsu','テ':'te','ト':'to',
    'ナ':'na','ニ':'ni','ヌ':'nu','ネ':'ne','ノ':'no',
    'ハ':'ha','ヒ':'hi','フ':'fu','ヘ':'he','ホ':'ho',
    'マ':'ma','ミ':'mi','ム':'mu','メ':'me','モ':'mo',
    'ヤ':'ya','ユ':'yu','ヨ':'yo',
    'ラ':'ra','リ':'ri','ル':'ru','レ':'re','ロ':'ro',
    'ワ':'wa','ヲ':'wo','ン':'n',
    'ガ':'ga','ぎ':'gi','グ':'gu','ゲ':'ge','ゴ':'go',
    'ザ':'za','ジ':'ji','ズ':'zu','ゼ':'ze','ゾ':'zo',
    'ダ':'da','ヂ':'ji','ヅ':'zu','デ':'de','ド':'do',
    'バ':'ba','ビ':'bi','ブ':'bu','ベ':'be','ボ':'bo',
    'パ':'pa','ピ':'pi','プ':'pu','ペ':'pe','ポ':'po',
    'ー':'-'
  };

  const parts = str.split('/');
  return parts.map(part => {
    let p = part.trim();
    let res = '';
    for (let i = 0; i < p.length; i++) {
      if (p[i] === 'っ' || p[i] === 'ッ') {
        const nextTwo = p.substr(i + 1, 2);
        const nextOne = p.substr(i + 1, 1);
        const nextRom = map[nextTwo] || map[nextOne];
        if (nextRom) {
          res += nextRom[0];
          continue;
        }
      }
      const two = p.substr(i, 2);
      if (map[two]) {
        res += map[two];
        i++;
      } else if (map[p[i]]) {
        res += map[p[i]];
      } else {
        res += p[i];
      }
    }
    return res;
  }).join(' / ');
}

// ── LEARN ──
function renderLearn(){
  renderKanaGrid('hiragana');
  renderVocab();
  renderGrammar();
  renderKanji();
}
function learnTab(name,btn){
  document.querySelectorAll('.learn-section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('#learnTabs .tab-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('ls-'+name).classList.add('active');
  btn.classList.add('active');
}
function writingTab(name,btn){
  document.getElementById('hiragana-grid').style.display=name==='hiragana'?'':'none';
  document.getElementById('katakana-grid').style.display=name==='katakana'?'':'none';
  document.querySelectorAll('.writing-tabs .stab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  if(name==='katakana'&&!document.getElementById('katakana-grid').innerHTML)renderKanaGrid('katakana');
}
function grammarTab(name, btn) {
  const p = document.getElementById('grammar-sub-patterns');
  const pt = document.getElementById('grammar-sub-particles');
  const t = document.getElementById('grammar-sub-tenses');
  if (p) p.style.display = name === 'patterns' ? 'block' : 'none';
  if (pt) pt.style.display = name === 'particles' ? 'block' : 'none';
  if (t) t.style.display = name === 'tenses' ? 'block' : 'none';
  document.querySelectorAll('.grammar-tabs .stab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}
function renderKanaGrid(type){
  const data=type==='hiragana'?HIRAGANA:KATAKANA;
  const grid=document.getElementById(type+'-grid');
  grid.innerHTML=data.map(g=>`
    <div class="kana-group">${g.group}</div>
    ${g.chars.map(c=>`<div class="kana-card" onclick="openKanaModal('${c.jp}', '${c.r}', '${type}', '${g.group}')" style="cursor:pointer" title="Click to view stroke order & practice"><div class="kana-jp">${c.jp}</div><div class="kana-rom">${c.r}</div></div>`).join('')}
  `).join('');
}
// State for vocab filtering
window.vocabState = {
  cat: 'all',
  subCat: 'all',
  search: ''
};

function onVocabSearch(query) {
  window.vocabState.search = (query || '').trim().toLowerCase();
  const clearBtn = document.getElementById('vocabSearchClear');
  if (clearBtn) clearBtn.style.display = window.vocabState.search ? 'block' : 'none';
  renderVocabCards();
}

function clearVocabSearch() {
  const input = document.getElementById('vocabSearchInput');
  if (input) input.value = '';
  window.vocabState.search = '';
  const clearBtn = document.getElementById('vocabSearchClear');
  if (clearBtn) clearBtn.style.display = 'none';
  renderVocabCards();
}

function setVocabSubCat(sub) {
  window.vocabState.subCat = sub;
  document.querySelectorAll('.sub-filter-chip').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.sub === sub);
  });
  renderVocabCards();
}

function renderVocab(cat = null) {
  if (cat !== null) {
    window.vocabState.cat = cat;
    window.vocabState.subCat = 'all'; // reset sub-category on main category switch
  }
  const currentCat = window.vocabState.cat;
  const levelVocab = VOCAB[S.level] || VOCAB.N5 || [];
  const cats = [...new Set(levelVocab.map(v => v.cat))];

  // Render main category chips
  const filterBar = document.getElementById('vocabFilterBar');
  if (filterBar) {
    filterBar.innerHTML = ['all', ...cats].map(c =>
      `<button class="filter-chip${c === currentCat ? ' on' : ''}" onclick="renderVocab('${c}')">${c.charAt(0).toUpperCase() + c.slice(1)}</button>`
    ).join('');
  }

  // Handle Sub-filters & Notices
  const subFilterBar = document.getElementById('vocabSubFilterBar');
  const noticeArea = document.getElementById('vocabNoticeArea');

  if (noticeArea) {
    noticeArea.innerHTML = '';
  }

  if (currentCat === 'verbs') {
    if (subFilterBar) {
      subFilterBar.style.display = 'flex';
      subFilterBar.innerHTML = `
        <button class="sub-filter-chip${window.vocabState.subCat === 'all' ? ' active' : ''}" data-sub="all" onclick="setVocabSubCat('all')">All Verbs (85)</button>
        <button class="sub-filter-chip${window.vocabState.subCat === 'core' ? ' active' : ''}" data-sub="core" onclick="setVocabSubCat('core')">⭐ Core 20 Must-Know</button>
        <button class="sub-filter-chip${window.vocabState.subCat === 'g1' ? ' active' : ''}" data-sub="g1" onclick="setVocabSubCat('g1')">🟢 Group 1: う-verbs (57)</button>
        <button class="sub-filter-chip${window.vocabState.subCat === 'g2' ? ' active' : ''}" data-sub="g2" onclick="setVocabSubCat('g2')">🔵 Group 2: る-verbs (18)</button>
        <button class="sub-filter-chip${window.vocabState.subCat === 'g3' ? ' active' : ''}" data-sub="g3" onclick="setVocabSubCat('g3')">🔴 Irregular Verbs (10)</button>
      `;
    }
  } else if (currentCat === 'adjectives') {
    if (subFilterBar) {
      subFilterBar.style.display = 'flex';
      subFilterBar.innerHTML = `
        <button class="sub-filter-chip${window.vocabState.subCat === 'all' ? ' active' : ''}" data-sub="all" onclick="setVocabSubCat('all')">All Adjectives (66)</button>
        <button class="sub-filter-chip${window.vocabState.subCat === 'i' ? ' active' : ''}" data-sub="i" onclick="setVocabSubCat('i')">🟢 い-Adjectives (50)</button>
        <button class="sub-filter-chip${window.vocabState.subCat === 'na' ? ' active' : ''}" data-sub="na" onclick="setVocabSubCat('na')">🔵 な-Adjectives (16)</button>
      `;
    }
  } else {
    if (subFilterBar) subFilterBar.style.display = 'none';
  }

  renderVocabCards();
}

function renderVocabCards() {
  const levelVocab = VOCAB[S.level] || VOCAB.N5 || [];
  const currentCat = window.vocabState.cat;
  const currentSub = window.vocabState.subCat;
  const query = window.vocabState.search;

  let filtered = levelVocab.filter(v => {
    if (currentCat !== 'all' && v.cat !== currentCat) return false;

    if (currentCat === 'verbs') {
      if (currentSub === 'core' && !v.core) return false;
      if (currentSub === 'g1' && v.group !== 1) return false;
      if (currentSub === 'g2' && v.group !== 2) return false;
      if (currentSub === 'g3' && v.group !== 3) return false;
    } else if (currentCat === 'adjectives') {
      if (currentSub === 'i' && v.type !== 'i') return false;
      if (currentSub === 'na' && v.type !== 'na') return false;
    }

    if (query) {
      const matchJp = v.jp && v.jp.toLowerCase().includes(query);
      const matchR = v.r && v.r.toLowerCase().includes(query);
      const matchEn = v.en && v.en.toLowerCase().includes(query);
      const matchSub = v.sub && v.sub.toLowerCase().includes(query);
      if (!matchJp && !matchR && !matchEn && !matchSub) return false;
    }

    return true;
  });

  // Update count badge
  const countBadge = document.getElementById('vocabCountBadge');
  if (countBadge) {
    countBadge.textContent = `Showing ${filtered.length} word${filtered.length === 1 ? '' : 's'}`;
  }

  const grid = document.getElementById('vocabGrid');
  if (!grid) return;

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1 / -1; text-align:center; padding: 40px; color: var(--muted);">
      <div style="font-size:32px;margin-bottom:8px">🔍</div>
      <div style="font-size:16px;font-weight:600">No vocabulary found</div>
      <div style="font-size:13px;margin-top:4px">Try changing your search query or filter</div>
    </div>`;
    return;
  }

  let html = '';
  let lastSub = null;

  filtered.forEach((v) => {
    if (v.sub && v.sub !== lastSub && currentSub === 'all' && !query) {
      html += `<div class="vocab-section-header" style="grid-column: 1 / -1; margin-top: 24px; font-weight: 700; color: var(--accent, #e65100); border-bottom: 2px solid var(--accent, #e65100); padding-bottom: 6px; margin-bottom: 12px; font-size:16px;">
        ${v.sub}
      </div>`;
      lastSub = v.sub;
    } else if (!v.sub && lastSub !== null) {
      lastSub = null;
    }

    const key = `voc-${v.jp}_${S.level}`;
    const learned = S.progress[key];

    html += `
    <div class="vocab-card${learned ? ' learned' : ''}" onclick="this.classList.toggle('expanded')">
      <div class="vc-card-top">
        <div class="vc-badges">
          ${v.core ? '<span class="vocab-badge-core">⭐ Core N5</span>' : ''}
          <span class="vocab-badge-sub">${v.sub || v.cat}</span>
        </div>
        <button class="btn-secondary" style="padding:4px 8px;font-size:11px" onclick="event.stopPropagation(); toggleVocab('${key}', this.closest('.vocab-card'), '${v.en}')">
          ${learned ? 'Unmark' : 'Learned ✓'}
        </button>
      </div>

      <div style="display:flex;align-items:baseline;justify-content:space-between">
        <div class="vc-jp">
          ${v.jp}
          <button class="vc-audio-btn" onclick="event.stopPropagation(); playJapaneseAudio('${v.jp}')" title="Listen pronunciation">🔊</button>
        </div>
      </div>
      <div class="vc-read">${v.r}</div>
      <div class="vc-en">${v.en}</div>

      ${v.note ? `<div class="vc-note-box">💡 ${v.note}</div>` : ''}

      <div class="vc-example" style="margin-top:10px;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:6px;">
          <div style="font-family:'Noto Sans JP',sans-serif;font-size:13px;color:var(--ink)">${formatFuriganaRuby(v.ex)}</div>
          <button class="vc-audio-btn" onclick="event.stopPropagation(); playJapaneseAudio('${cleanRubyAudio(v.ex)}')" title="Listen example">🔊</button>
        </div>
        <div style="color:var(--teal);margin-top:3px;font-size:12px;">${v.exEn}</div>
      </div>
    </div>`;
  });

  grid.innerHTML = html;
}
async function toggleVocab(key, el, name) {
  S.progress[key] = !S.progress[key];
  if(S.progress[key]) {
    el.classList.add('learned');
    el.querySelector('button').textContent = 'Unmark';
    toast('Vocab learned! ✓ ' + name);
  } else {
    el.classList.remove('learned');
    el.querySelector('button').textContent = 'Learned ✓';
    toast('Unmarked');
  }
  markActivity();
  api('PATCH', '/api/state', { progress: S.progress, streak: S.streak, lastStudied: S.lastStudied, activityLog: S.activityLog });
}

function formatFuriganaRuby(text) {
  if (!text) return '';
  return String(text).replace(/([一-龯々ヶ]+)[（\(]([ぁ-んァ-ンa-zA-Z\s\/・]+)[\)）]/g, (m, k, r) => `<ruby>${k}<rt>${r}</rt></ruby>`);
}

function cleanRubyAudio(text) {
  if (!text) return '';
  return String(text)
    .replace(/<[^>]*>/g, '')
    .replace(/（[^）]*）/g, '')
    .replace(/\([^)]*\)/g, '')
    .trim();
}

function getGrammarFormula(g) {
  if (!g) return '';
  if (g.formula) return g.formula;
  const p = g.pattern || '';
  if (p === '〜は〜です') return '[Noun A] + は + [Noun B] + です';
  if (p === '〜が〜') return '[Noun / Question Word] + が + [Predicate / Liking / Ability]';
  if (p === '〜を〜') return '[Noun (Object)] + を + [Transitive Verb]';
  if (p === '〜に〜') return '[Time / Goal / Location] + に + [Verb / います / あります]';
  if (p === '〜で〜') return '[Place / Tool / Means] + で + [Action Verb]';
  if (p.includes('〜ます')) return '[Verb ます-stem] + ます / ません';
  if (p.includes('〜ました')) return '[Verb ます-stem] + ました / ませんでした';
  if (p.includes('〜たい')) return '[Verb ます-stem] + たいです (Want to do)';
  if (p.includes('〜てください')) return '[Verb て-form] + ください (Polite Request)';
  if (p.includes('〜ています')) return '[Verb て-form] + います (Ongoing action / state)';
  if (p.includes('〜てもいい')) return '[Verb て-form] + もいいです (Permission: May I...)';
  if (p.includes('〜てはいけない') || p.includes('〜てはいけません')) return '[Verb て-form] + はいけません (Prohibition: Must not)';
  if (p.includes('〜ないでください')) return '[Verb ない-form] + でください (Negative request)';
  if (p.includes('〜なければなりません') || p.includes('〜なくてはいけません')) return '[Verb ない-stem without い] + ければなりません (Obligation: Must)';
  if (p.includes('〜たことがある') || p.includes('〜たことがあります')) return '[Verb た-form] + ことがあります (Past Experience)';
  if (p.includes('〜ほうがいい')) return '[Verb た-form (do) / ない-form (don\'t)] + ほうがいいです (Advice)';
  if (p.includes('〜ことができる')) return '[Verb 辞書形 (Dictionary form)] + ことができます (Ability)';
  if (p.includes('〜まえに')) return '[Verb 辞書形 / Noun の] + まえに (Before doing...)';
  if (p.includes('〜あとで')) return '[Verb た-form / Noun の] + あとで (After doing...)';
  if (p.includes('〜とき')) return '[Verb / い-Adj / な-Adj な / Noun の] + とき (When...)';
  if (p.includes('〜から') || p.includes('〜ので')) return '[Plain / Polite Clause] + から / ので (Reason: Because...)';
  if (p.includes('〜ましょう')) return '[Verb ます-stem] + ましょう (Let\'s do!)';
  if (p.includes('〜つもり')) return '[Verb 辞書形 / ない-form] + つもりです (Intention: Plan to...)';
  return `${g.pattern} (${g.meaning})`;
}

function renderGrammar(){
  const data=GRAMMAR[S.level]||[];
  document.getElementById('grammarList').innerHTML=data.map((g)=>{
    const key = `gram-${g.pattern}_${S.level}`;
    const learned = S.progress[key];
    const formula = getGrammarFormula(g);
    return `
    <div class="gram-card${learned?' learned':''}" onclick="this.classList.toggle('open')">
      <div style="display:flex;justify-content:space-between;align-items:start">
        <div><div class="gram-pattern">${g.pattern}</div><div class="gram-meaning">${g.meaning}</div></div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;z-index:2">
          <span class="gram-tag">${g.tag}</span>
          <button class="btn-secondary" style="padding:4px 8px;font-size:11px" onclick="event.stopPropagation(); toggleGrammar('${key}', this.parentElement.parentElement.parentElement, '${g.pattern}')">${learned?'Unmark':'Learned ✓'}</button>
        </div>
      </div>
      <div class="gram-body">
        ${formula ? `
          <div class="gram-formula-banner">
            <span class="gram-formula-tag">Syntax Rule</span>
            <span class="gram-formula-text">${formula}</span>
          </div>` : ''}
        <div class="gram-explanation">${g.explanation}</div>
        ${g.examples.map(e=>`<div class="gram-example"><div class="gram-ex-jp">${formatFuriganaRuby(e.jp)}</div><div class="gram-ex-read">${e.r}</div><div class="gram-ex-en">${e.en}</div></div>`).join('')}
        ${g.notes?`<div class="gram-notes">💡 ${g.notes}</div>`:''}
      </div>
    </div>`
  }).join('');
}
async function toggleGrammar(key, el, name) {
  S.progress[key] = !S.progress[key];
  if(S.progress[key]) {
    el.classList.add('learned');
    el.querySelector('button').textContent = 'Unmark';
    toast('Pattern learned! ✓ ' + name);
  } else {
    el.classList.remove('learned');
    el.querySelector('button').textContent = 'Learned ✓';
    toast('Unmarked');
  }
  markActivity();
  api('PATCH', '/api/state', { progress: S.progress, streak: S.streak, lastStudied: S.lastStudied, activityLog: S.activityLog });
}
// ── KANJI MODAL & STROKE ORDER SYSTEM ──
let currentKanjiObj = null;
let currentKanjiKey = '';
let showStrokeNumbers = true;
let guideOn = true;
let isDrawing = false;
let lastX = 0, lastY = 0;

function renderKanji(cat='all'){
  const data=(KANJI[S.level]||[]).filter(k=>cat==='all'||k.cat===cat);
  const cats=[...new Set((KANJI[S.level]||[]).map(k=>k.cat))];
  document.getElementById('kanjiFilterBar').innerHTML=
    ['all',...cats].map(c=>`<button class="filter-chip${c===cat?' on':''}" onclick="renderKanji('${c}')">${c.charAt(0).toUpperCase()+c.slice(1)}</button>`).join('');
  document.getElementById('kanjiGrid').innerHTML=data.map(k=>{
    const key=k.k+'_'+S.level;const learned=S.learnedKanji[key];
    return`<div class="kanji-card${learned?' learned':''}" onclick="openKanjiModal('${k.k}')">
      ${learned?'<div class="kanji-learned-tag">✓ Learned</div>':''}
      <div class="kanji-ch">${k.k}</div>
      <div class="kanji-on">${k.on}</div>
      <div class="kanji-en">${k.en}</div>
    </div>`;
  }).join('');
}

let currentModalList = [];
let currentModalIndex = -1;

function openKanaModal(char, romaji, type, group) {
  const isHira = type === 'hiragana';
  const typeLabel = isHira ? 'Hiragana (ひらがな)' : 'Katakana (カタカナ)';
  
  // Build ordered character list for navigation
  const data = isHira ? HIRAGANA : KATAKANA;
  currentModalList = [];
  data.forEach(g => {
    (g.chars || []).forEach(c => {
      currentModalList.push({ char: c.jp, romaji: c.r, type: isHira ? 'hiragana' : 'katakana', group: g.group });
    });
  });
  currentModalIndex = currentModalList.findIndex(item => item.char === char);
  updateModalNavBtns();

  currentKanjiObj = { k: char, char: char, on: romaji, kun: romaji, en: `${typeLabel} character '${char}' (${romaji})`, cat: group };
  currentKanjiKey = 'kana_' + char;
  const strokeCount = char.length > 1 ? 3 : 2; // Default stroke count estimate for Kana

  // Update Header Elements
  document.getElementById('kmChar').textContent = char;
  document.getElementById('kmLevel').textContent = isHira ? 'Hiragana' : 'Katakana';
  document.getElementById('kmCategory').textContent = group || 'Kana';
  document.getElementById('kmStrokesBadge').textContent = strokeCount + ' strokes';
  document.getElementById('kmMeaning').textContent = `Sound: "${romaji}" · (${typeLabel})`;
  document.getElementById('kmOn').textContent = romaji;
  const onRomEl = document.getElementById('kmOnRom');
  if (onRomEl) onRomEl.textContent = `(${romaji})`;
  document.getElementById('kmKun').textContent = typeLabel;
  const kunRomEl = document.getElementById('kmKunRom');
  if (kunRomEl) kunRomEl.textContent = '';

  // Update Radical & Component info
  document.getElementById('kmRadicalText').textContent = `${typeLabel} - ${group}`;
  document.getElementById('kmCompText').textContent = `Standard Japanese syllabary character for pronunciation "${romaji}"`;
  document.getElementById('kmStrokeCountText').textContent = `${strokeCount} stroke(s)`;

  // Update Learned Button
  updateModalLearnedBtn();

  // Render Stroke Order Animation and Steps
  renderKanjiStrokeAnimation(char, strokeCount);

  // Render Related Kana from the same group
  const grpObj = data.find(g => g.group === group);
  const familyGrid = document.getElementById('kmFamilyGrid');
  if (grpObj && grpObj.chars) {
    familyGrid.innerHTML = grpObj.chars.filter(c => c.jp !== char).map(c => `
      <div class="km-fam-card" onclick="openKanaModal('${c.jp}', '${c.r}', '${type}', '${group}')">
        <div class="km-fam-k">${c.jp}</div>
        <div class="km-fam-reading">${c.r}</div>
      </div>
    `).join('');
  } else {
    familyGrid.innerHTML = '<div style="font-size:13px;color:var(--muted);grid-column:1/-1">No other characters in group.</div>';
  }

  // Initialize Practice Canvas
  initPracticeCanvas(char);

  // Show Modal
  const modal = document.getElementById('kanji-detail-modal');
  if(modal) {
    modal.classList.add('open');
    modal.classList.add('active');
  }
  document.body.style.overflow = 'hidden';
}

async function openKanjiModal(kanjiChar){
  const kanjiList = KANJI[S.level] || [];
  currentModalList = kanjiList.map(k => ({ char: k.k, type: 'kanji' }));
  currentModalIndex = currentModalList.findIndex(item => item.char === kanjiChar);
  updateModalNavBtns();

  // Search in current level first, then other level
  let kj = (KANJI[S.level]||[]).find(k => k.k === kanjiChar);
  let lvl = S.level;
  if(!kj){
    const otherLvl = S.level === 'N5' ? 'N4' : 'N5';
    kj = (KANJI[otherLvl]||[]).find(k => k.k === kanjiChar);
    if(kj) lvl = otherLvl;
  }
  if(!kj){
    // Generic fallback object if character is from extended list
    kj = { k: kanjiChar, on: '—', kun: '—', en: 'Japanese Kanji', cat: 'general' };
  }

  currentKanjiObj = kj;
  currentKanjiKey = kj.k + '_' + lvl;
  const meta = getKanjiMetadata(kj.k, kj.cat, lvl);

  const onRom = kanaToRomaji(kj.on);
  const kunRom = kanaToRomaji(kj.kun);

  // Update Header Elements
  document.getElementById('kmChar').textContent = kj.k;
  document.getElementById('kmLevel').textContent = lvl;
  document.getElementById('kmCategory').textContent = kj.cat || 'general';
  document.getElementById('kmStrokesBadge').textContent = meta.strokes + (meta.strokes === 1 ? ' stroke' : ' strokes');
  document.getElementById('kmMeaning').textContent = kj.en || '';
  
  document.getElementById('kmOn').textContent = kj.on || '—';
  const onRomEl = document.getElementById('kmOnRom');
  if (onRomEl) onRomEl.textContent = onRom ? `(${onRom})` : '';

  document.getElementById('kmKun').textContent = kj.kun || '—';
  const kunRomEl = document.getElementById('kmKunRom');
  if (kunRomEl) kunRomEl.textContent = kunRom ? `(${kunRom})` : '';

  // Update Radical & Component info
  document.getElementById('kmRadicalText').textContent = meta.rad;
  document.getElementById('kmCompText').textContent = meta.comp;
  document.getElementById('kmStrokeCountText').textContent = meta.strokes + (meta.strokes === 1 ? ' stroke' : ' strokes');

  // Update Learned Button
  updateModalLearnedBtn();

  // Render Stroke Order Animation
  renderKanjiStrokeAnimation(kj.k, meta.strokes);

  // Render Step-by-Step Sequence
  renderKanjiSteps(kj.k, meta.strokes);

  // Render Similar Kanji Family
  renderSimilarKanji(kj.k, meta.family, kj.cat, lvl);

  // Init Practice Canvas
  initPracticeCanvas(kj.k);

  // Show Modal
  const modal = document.getElementById('kanji-detail-modal');
  if(modal) {
    modal.classList.add('open');
    modal.classList.add('active');
  }
  document.body.style.overflow = 'hidden';
}

function closeKanjiModal(){
  const modal = document.getElementById('kanji-detail-modal');
  if(modal) {
    modal.classList.remove('open');
    modal.classList.remove('active');
  }
  document.body.style.overflow = 'auto';
}

function updateModalLearnedBtn(){
  const btn = document.getElementById('kmLearnedBtn');
  if(!btn) return;
  const isLearned = !!S.learnedKanji[currentKanjiKey];
  if(isLearned){
    btn.classList.add('active');
    btn.innerHTML = '<span>✓</span> Learned!';
  } else {
    btn.classList.remove('active');
    btn.innerHTML = '<span>＋</span> Mark Learned';
  }
}

function updateModalNavBtns(){
  const isFirst = currentModalIndex <= 0;
  const isLast = currentModalIndex < 0 || currentModalIndex >= currentModalList.length - 1;
  document.querySelectorAll('.km-prev-btn, #kmPrevBtn').forEach(btn => {
    btn.disabled = isFirst;
  });
  document.querySelectorAll('.km-next-btn, #kmNextBtn').forEach(btn => {
    btn.disabled = isLast;
  });
}

function navKanaModal(delta){
  if(currentModalIndex < 0 || !currentModalList.length) return;
  const targetIndex = currentModalIndex + delta;
  if(targetIndex >= 0 && targetIndex < currentModalList.length){
    const item = currentModalList[targetIndex];
    if(item.type === 'hiragana' || item.type === 'katakana'){
      openKanaModal(item.char, item.romaji, item.type, item.group);
    } else {
      openKanjiModal(item.char);
    }
  }
}

// Global Keyboard Navigation for Character Modal & Escape Key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeKanjiModal();
    closeModal();
    if (typeof closeAiKeyModal === 'function') closeAiKeyModal();
    return;
  }
  const modal = document.getElementById('kanji-detail-modal');
  if(!modal || !modal.classList.contains('open')) return;
  if(e.key === 'ArrowRight') { navKanaModal(1); }
  else if(e.key === 'ArrowLeft') { navKanaModal(-1); }
});

async function toggleKanjiFromModal(){
  if(!currentKanjiKey) return;
  S.learnedKanji[currentKanjiKey] = !S.learnedKanji[currentKanjiKey];
  S.progress.learnedKanji = S.learnedKanji;
  updateModalLearnedBtn();
  renderKanji(document.querySelector('#kanjiFilterBar .filter-chip.on')?.textContent?.toLowerCase() || 'all');
  markActivity();
  await api('PATCH','/api/state',{learnedKanji:S.learnedKanji,progress:S.progress,streak:S.streak,lastStudied:S.lastStudied,activityLog:S.activityLog});
  if(S.learnedKanji[currentKanjiKey]) toast('Kanji learned! ✓ ' + (currentKanjiObj?.en || ''));
  else toast('Unmarked');
}

// ── KANJI STROKE ANIMATION & SVG PLAYER ──
async function renderKanjiStrokeAnimation(kanjiChar, strokeCount){
  const box = document.getElementById('kmStrokeBox');
  if(!box) return;
  box.innerHTML = '<div style="color:var(--muted);font-size:13px">Loading stroke data...</div>';

  const svgUrl = getKanjiVGUrl(kanjiChar);
  try {
    const resp = await fetch(svgUrl);
    if(!resp.ok) throw new Error('SVG fetch failed');
    let svgText = await resp.text();
    
    // Inject custom stroke styling & stroke order animations
    box.innerHTML = svgText;
    const svgEl = box.querySelector('svg');
    if(svgEl){
      svgEl.setAttribute('width', '180');
      svgEl.setAttribute('height', '180');
      styleAndAnimateKanjiSVG(svgEl);

      // Extract path data for real step-by-step stroke diagrams!
      const paths = Array.from(svgEl.querySelectorAll('path')).map(p => p.getAttribute('d')).filter(Boolean);
      if(paths.length > 0){
        renderKanjiSteps(kanjiChar, paths);
        // Update stroke count badge with actual path count
        document.getElementById('kmStrokesBadge').textContent = paths.length + (paths.length === 1 ? ' stroke' : ' strokes');
        document.getElementById('kmStrokeCountText').textContent = paths.length + (paths.length === 1 ? ' stroke' : ' strokes');
      }
    }
  } catch(e) {
    // Fallback dynamic SVG stroke generator if offline or CDN unavailable
    box.innerHTML = generateFallbackKanjiSVG(kanjiChar, strokeCount);
    playKanjiStrokeAnimation();
    renderKanjiSteps(kanjiChar, strokeCount);
  }
}

function styleAndAnimateKanjiSVG(svgEl){
  const paths = svgEl.querySelectorAll('path');
  const texts = svgEl.querySelectorAll('text');

  // Reset all paths to clear previous animations
  paths.forEach((path) => {
    path.style.animation = 'none';
    path.style.strokeDashoffset = '0';
    path.style.strokeDasharray = 'none';
  });

  // Synchronous layout reflow to guarantee browser registers the animation reset
  void svgEl.getBoundingClientRect();

  // Apply stroke animation with sequential delay
  paths.forEach((path, idx) => {
    const length = path.getTotalLength ? Math.ceil(path.getTotalLength()) : 300;
    path.style.strokeDasharray = `${length} ${length}`;
    path.style.strokeDashoffset = `${length}`;
    path.style.animation = `drawKanjiStroke 0.85s ease forwards ${idx * 0.4}s`;
  });

  texts.forEach((text) => {
    text.style.display = showStrokeNumbers ? 'block' : 'none';
    text.style.fontSize = '12px';
    text.style.fill = 'var(--red)';
    text.style.fontFamily = 'var(--font-mono)';
  });
}

function generateFallbackKanjiSVG(kanjiChar, strokeCount){
  return `
    <svg width="180" height="180" viewBox="0 0 109 109" class="fallback-kanji-svg">
      <line x1="0" y1="54.5" x2="109" y2="54.5" stroke="var(--border)" stroke-dasharray="3,3" />
      <line x1="54.5" y1="0" x2="54.5" y2="109" stroke="var(--border)" stroke-dasharray="3,3" />
      <text x="54.5" y="76" font-size="78" text-anchor="middle" font-family="'Noto Sans JP', sans-serif" fill="var(--ink)" class="fallback-char-anim">${kanjiChar}</text>
    </svg>
  `;
}

function playKanjiStrokeAnimation(){
  const box = document.getElementById('kmStrokeBox');
  if(!box) return;
  const svgEl = box.querySelector('svg');
  if(svgEl && svgEl.querySelectorAll('path').length > 0){
    styleAndAnimateKanjiSVG(svgEl);
  } else {
    // Re-trigger fallback animation
    const textEl = box.querySelector('.fallback-char-anim');
    if(textEl){
      textEl.style.animation = 'none';
      void textEl.getBoundingClientRect(); // Reflow trigger
      textEl.style.animation = 'fadeInStroke 0.8s ease forwards';
    }
  }
}

function toggleStrokeNumbers(){
  showStrokeNumbers = !showStrokeNumbers;
  const btn = document.getElementById('kmNumberToggleBtn');
  if(btn) btn.textContent = showStrokeNumbers ? '# Hide Numbers' : '# Show Numbers';
  const box = document.getElementById('kmStrokeBox');
  if(box){
    box.querySelectorAll('text').forEach(t => {
      t.style.display = showStrokeNumbers ? 'block' : 'none';
    });
  }
}

// ── STEP-BY-STEP STROKE SEQUENCE ──
function renderKanjiSteps(kanjiChar, strokePathsOrCount){
  const row = document.getElementById('kmStepsRow');
  if(!row) return;
  
  let html = '';
  
  if(Array.isArray(strokePathsOrCount) && strokePathsOrCount.length > 0){
    const paths = strokePathsOrCount;
    const totalSteps = paths.length;
    
    for(let i = 1; i <= totalSteps; i++){
      // Previous cumulative strokes drawn in dark navy/ink
      const prevStrokesSvg = paths.slice(0, i - 1).map(d => `<path d="${d}" fill="none" stroke="var(--ink)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
      // Current NEW stroke highlighted in bright RED (#c0392b) with slightly thicker line
      const currentStrokeSvg = `<path d="${paths[i - 1]}" fill="none" stroke="#c0392b" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>`;

      html += `
        <div class="km-step-card">
          <div class="km-step-num">Step ${i}</div>
          <div class="km-step-svg-box">
            <svg viewBox="0 0 109 109" width="52" height="52">
              <line x1="0" y1="54.5" x2="109" y2="54.5" stroke="var(--border2)" stroke-dasharray="2,2" />
              <line x1="54.5" y1="0" x2="54.5" y2="109" stroke="var(--border2)" stroke-dasharray="2,2" />
              ${prevStrokesSvg}
              ${currentStrokeSvg}
            </svg>
          </div>
          <div class="km-step-lbl">${i === 1 ? 'Initial stroke' : i === totalSteps ? 'Final stroke' : 'Stroke ' + i}</div>
        </div>
      `;
    }
  } else {
    // Fallback if path array is not available
    const totalSteps = Math.min(Math.max(typeof strokePathsOrCount === 'number' ? strokePathsOrCount : 4, 1), 12);
    for(let i = 1; i <= totalSteps; i++){
      html += `
        <div class="km-step-card">
          <div class="km-step-num">Step ${i}</div>
          <div class="km-step-char" style="opacity:${0.3 + (i/totalSteps)*0.7}">${kanjiChar}</div>
          <div class="km-step-lbl">${i === 1 ? 'Initial stroke' : i === totalSteps ? 'Final stroke' : 'Stroke ' + i}</div>
        </div>
      `;
    }
  }
  row.innerHTML = html;
}


// ── SIMILAR KANJI FAMILY ──
function renderSimilarKanji(currentChar, familyArray=[], category='', currentLevel='N5'){
  const grid = document.getElementById('kmFamilyGrid');
  if(!grid) return;

  // Gather related kanji candidates
  let candidates = new Set(familyArray || []);
  
  // Add same category kanji if needed
  const pool = [...(KANJI.N5 || []), ...(KANJI.N4 || [])];
  pool.filter(k => k.cat === category && k.k !== currentChar).forEach(k => candidates.add(k.k));

  const list = Array.from(candidates).filter(c => c !== currentChar).slice(0, 10);

  if(list.length === 0){
    grid.innerHTML = '<div style="font-size:13px;color:var(--muted);grid-column:1/-1">No similar family kanji listed.</div>';
    return;
  }

  grid.innerHTML = list.map(ch => {
    const item = pool.find(k => k.k === ch) || { k: ch, on: '', en: '' };
    return `
      <div class="km-fam-card" onclick="openKanjiModal('${item.k}')" title="View stroke & details for ${item.k}">
        <div class="km-fam-ch">${item.k}</div>
        <div class="km-fam-en">${item.en || 'related'}</div>
      </div>
    `;
  }).join('');
}

// ── INTERACTIVE CANVAS PRACTICE PAD ──
function initPracticeCanvas(kanjiChar){
  const canvas = document.getElementById('kanjiPracticeCanvas');
  const watermark = document.getElementById('kmCanvasWatermark');
  if(!canvas) return;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  if(watermark){
    watermark.textContent = kanjiChar;
    watermark.style.display = guideOn ? 'flex' : 'none';
  }

  // Event Listeners for Mouse & Touch Drawing
  canvas.onmousedown = (e) => startDrawing(e, canvas);
  canvas.onmousemove = (e) => draw(e, canvas);
  canvas.onmouseup = () => stopDrawing();
  canvas.onmouseleave = () => stopDrawing();

  canvas.ontouchstart = (e) => { e.preventDefault(); startDrawing(e.touches[0], canvas); };
  canvas.ontouchmove = (e) => { e.preventDefault(); draw(e.touches[0], canvas); };
  canvas.ontouchend = () => stopDrawing();
}

function startDrawing(e, canvas){
  isDrawing = true;
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  lastX = (e.clientX - rect.left) * scaleX;
  lastY = (e.clientY - rect.top) * scaleY;
}

function draw(e, canvas){
  if(!isDrawing) return;
  const ctx = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const currentX = (e.clientX - rect.left) * scaleX;
  const currentY = (e.clientY - rect.top) * scaleY;

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(currentX, currentY);
  ctx.strokeStyle = '#c0392b'; // Dynamic stroke ink color
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  lastX = currentX;
  lastY = currentY;
}

function stopDrawing(){
  isDrawing = false;
}

function clearPracticeCanvas(){
  const canvas = document.getElementById('kanjiPracticeCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function toggleCanvasGuide(){
  guideOn = !guideOn;
  const watermark = document.getElementById('kmCanvasWatermark');
  const btn = document.getElementById('kmGuideBtn');
  if(watermark) watermark.style.display = guideOn ? 'flex' : 'none';
  if(btn) btn.textContent = guideOn ? 'Guide: ON' : 'Guide: OFF';
}


// ── ADVANCED PRACTICE HUB SYSTEM ──
function shuffle(arr) {
  return [...(arr || [])].sort(() => Math.random() - 0.5);
}
function shuffleWith(target, others) {
  return shuffle([target, ...others.filter(o => o !== target).slice(0, 3)]);
}
function renderFlashcards(subMode) {
  renderAdvancedFlashcards(subMode);
}

let practiceState = {
  type: 'kana',
  subMode: 'all',
  pool: [],
  idx: 0,
  correct: 0,
  answered: false,
  orderingState: { selected: [] },
  listeningSpeed: 1.0,
  showTranscript: false
};

const ADVANCED_PRACTICE_DATA = {
  ordering: [
    {
      prompt: 'わたしは [ 1 ] [ 2 ] [ ★ ] [ 4 ] たべます。',
      blocks: ['きょう', 'レストランで', 'すしを', 'ともだちと'],
      ansIndex: 2, // 'すしを' is the 3rd item (index 2)
      fullJp: 'わたしは　きょう　ともだちと　すしを　レストランで　たべます。',
      exp: 'Correct order: きょう (today) ➔ ともだちと (with friend) ➔ ★ すしを (sushi) ➔ レストランで (at restaurant).'
    },
    {
      prompt: 'あした [ 1 ] [ 2 ] [ ★ ] [ 4 ] いきます。',
      blocks: ['ともだちと', 'えいがかんへ', 'でんしゃで', 'がっこう'],
      ansIndex: 1,
      fullJp: 'あした　でんしゃで　えいがかんへ　ともだちと　いきます。',
      exp: 'Correct order: でんしゃで (by train) ➔ ★ えいがかんへ (to movie theater) ➔ ともだちと (with friend).'
    },
    {
      prompt: 'つくえの [ 1 ] [ 2 ] [ ★ ] [ 4 ] あります。',
      blocks: ['うえに', 'あおい', 'ほんが', 'きれい'],
      ansIndex: 2,
      fullJp: 'つくえの　うえに　あおい　ほんが　あります。',
      exp: 'Correct order: うえに (on top) ➔ あおい (blue) ➔ ★ ほんが (book).'
    },
    {
      prompt: 'たなかさんは [ 1 ] [ 2 ] [ ★ ] [ 4 ] はなします。',
      blocks: ['にほんごを', 'じょうずに', 'とても', 'えいご'],
      ansIndex: 1,
      fullJp: 'たなかさんは　にほんごを　とても record じょうずに　はなします。',
      exp: 'Correct order: にほんごを (Japanese) ➔ とても (very) ➔ ★ じょうずに (skillfully).'
    }
  ],
  grammarParticles: [
    { q: 'わたし（　）学生です。', opts: ['は', 'が', 'を', 'に'], ans: 0, exp: 'は (wa) marks the sentence topic: "As for me, I am a student."' },
    { q: '教室に　だれ（　）いますか。', opts: ['が', 'は', 'を', 'で'], ans: 0, exp: 'Question words like だれ (who) or 何 (what) always take the subject marker が when asking about identity.' },
    { q: '図書館（　）本を　読みます。', opts: ['で', 'に', 'を', 'へ'], ans: 0, exp: 'で marks the location where a dynamic action takes place (図書館で = at the library).' },
    { q: '部屋（　）猫が　います。', opts: ['に', 'で', 'を', 'と'], ans: 0, exp: 'に marks the location of static existence for います / あります (部屋に = in the room).' },
    { q: '毎朝　７時（　）起きます。', opts: ['に', 'で', 'を', 'は'], ans: 0, exp: 'に marks a specific numerical point in time (７時に = at 7 o\'clock).' },
    { q: '来週　京都（　）行きます。', opts: ['へ', 'で', 'を', 'から'], ans: 0, exp: 'へ (pronounced "e") marks the direction or destination of movement (京都へ = to Kyoto).' },
    { q: '朝ご飯に　パン（　）卵を　食べました。', opts: ['と', 'や', 'で', 'に'], ans: 0, exp: 'と forms an exhaustive listing ("A and B" — only these two items).' },
    { q: 'わたしは　日本語（　）分かります。', opts: ['が', 'を', 'で', 'に'], ans: 0, exp: 'Verbs of ability and state like 分かる (understand) and できる (can do) take が for their object.' },
    { q: '天気がいいので、公園（　）散歩します。', opts: ['を', 'で', 'に', 'へ'], ans: 0, exp: 'を marks the path or space through which motion occurs (公園を散歩する = walk through the park).' },
    { q: '駅（　）家まで　歩いて　１５分です。', opts: ['から', 'まで', 'に', 'で'], ans: 0, exp: 'から marks the starting point ("from the station"), paired with まで ("until home").' },
    { q: '毎日　午後５時（　）働きます。', opts: ['まで', 'から', 'に', 'で'], ans: 0, exp: 'まで indicates the ending limit or duration ("until 5 PM").' },
    { q: '新幹線は　バス（　）速いです。', opts: ['より', 'ほど', 'から', 'と'], ans: 0, exp: 'より marks the standard of comparison ("faster than a bus").' },
    { q: '田中さん（　）一緒に　映画を　見ました。', opts: ['と', 'に', 'で', 'を'], ans: 0, exp: 'と marks the partner or companion ("together with Tanaka-san").' },
    { q: '電車（　）学校へ　行きます。', opts: ['で', 'に', 'を', 'から'], ans: 0, exp: 'で indicates means of transportation or tools used (電車で = by train).' },
    { q: '机の上に　本（　）ペンなどが　あります。', opts: ['や', 'と', 'に', 'で'], ans: 0, exp: 'や marks a non-exhaustive listing ("books, pens, and other things like that").' },
    { q: '山田さんも　パーティーに　来ます（　）。', opts: ['か', 'ね', 'よ', 'の'], ans: 0, exp: 'か at the end of a sentence marks it as a polite question.' },
    { q: '今日は　とても　いい天気です（　）。', opts: ['ね', 'よ', 'か', 'わ'], ans: 0, exp: 'ね seeks mutual agreement and confirmation ("It\'s nice weather, isn\'t it?").' },
    { q: 'わたし（　）その映画を　見ました。', opts: ['も', 'を', 'に', 'で'], ans: 0, exp: 'も means "also / too" and replaces は or が to express inclusion.' },
    { q: '日本語（　）手紙を　書きました。', opts: ['で', 'に', 'を', 'へ'], ans: 0, exp: 'で marks the language or instrument used to complete an action (日本語で = in Japanese).' },
    { q: '父（　）ネクタイを　プレゼントしました。', opts: ['に', 'で', 'を', 'から'], ans: 0, exp: 'に marks the recipient or beneficiary of giving (父に = to my father).' }
  ],
  grammarConjugations: [
    { q: '「食べる」の　丁寧語（ます形）は？', opts: ['食べます', '食べた', '食べて', '食べない'], ans: 0, exp: 'The polite present form of 食べる is 食べます.' },
    { q: '「行く」の　て形は？', opts: ['行って', '行きて', '行いた', '行かない'], ans: 0, exp: '行く is an irregular exception: て-form is 行って (itte).' },
    { q: '「書く」の　否定形（ない形）は？', opts: ['書かない', '書きない', '書かないで', '書かなかった'], ans: 0, exp: 'Group 1 verb 書く becomes 書かない (kakanai).' },
    { q: '「高い」の　過去形（形容詞）は？', opts: ['高かったです', '高かったです', '高かった', '高くないです'], ans: 0, exp: 'i-adjective 高い past tense is 高かったです.' }
  ],
  listeningScenarios: [
    {
      id: 'sc1',
      title: 'あいさつと自己紹介 (Greeting & Intro)',
      icon: '👋',
      dialogue: [
        { speaker: 'A', jp: 'こんにちは！お名前は　何ですか。', r: 'Konnichiwa! Onamae wa nan desu ka.', en: 'Hello! What is your name?' },
        { speaker: 'B', jp: 'はじめまして。私は元気に　マイクです。アメリカから　来ました。', r: 'Hajimemashite. Watashi wa Maiku desu. Amerika kara kimashita.', en: 'Nice to meet you. I am Mike. I came from America.' },
        { speaker: 'A', jp: 'どうぞ　よろしく　お願いします！', r: 'Douzo yoroshiku onegaishimasu!', en: 'Pleased to meet you!' }
      ],
      question: {
        q: 'マイクさんは　どこから　来ましたか。',
        opts: ['アメリカ', '日本', 'イギリス', '中国'],
        ans: 0,
        exp: 'Mike states "アメリカから 来ました" (I came from America).'
      }
    },
    {
      id: 'sc2',
      title: 'コンビニでお買い物 (Shopping at Konbini)',
      icon: '🏪',
      dialogue: [
        { speaker: '店員', jp: 'いらっしゃいませ！お弁当は　温めますか。', r: 'Irasshaimase! Obentou wa atatamemasu ka.', en: 'Welcome! Shall I heat up your bento?' },
        { speaker: '客', jp: 'はい、お願いします。お茶も　一本ください。', r: 'Hai, onegaishimasu. Ocha mo ippon kudasai.', en: 'Yes, please. Also give me one bottle of green tea.' },
        { speaker: '店員', jp: 'かしこまりました。全部で　５００円です。', r: 'Kashikomarimashita. Zenbu de gohyaku-en desu.', en: 'Certainly. That will be 500 yen in total.' }
      ],
      question: {
        q: '全部で　いくらですか。',
        opts: ['５００円', '３００円', '１０００円', '４００円'],
        ans: 0,
        exp: 'The cashier states "全部で ５００円です" (500 yen in total).'
      }
    },
    {
      id: 'sc3',
      title: '道を聞く (Asking Directions)',
      icon: '🗺️',
      dialogue: [
        { speaker: 'A', jp: 'すみません、東京駅は　どこですか。', r: 'Sumimasen, Toukyou-eki wa doko desu ka.', en: 'Excuse me, where is Tokyo Station?' },
        { speaker: 'B', jp: 'あそこを　右に　曲がってください。交番の　隣に　あります。', r: 'Asoko wo migi ni magatte kudasai. Kouban no tonari ni arimasu.', en: 'Turn right over there. It is next to the police box.' },
        { speaker: 'A', jp: 'わかりました！ありがとうございます。', r: 'Wakarimashita! Arigatou gozaimasu.', en: 'Understood! Thank you very much.' }
      ],
      question: {
        q: '東京駅は　どこに　ありますか。',
        opts: ['交番の隣', '左の曲がり角', '学校の前', '公園の中'],
        ans: 0,
        exp: 'Person B says "交番の 隣に あります" (Next to the police box).'
      }
    }
  ]
};

function practiceTab(type, btn) {
  document.querySelectorAll('#practiceTabs .tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (type === 'particle') {
    practiceState.type = 'grammar';
    practiceState.subMode = 'particles';
    renderPracticeSubBar('grammar', 'particles');
    renderGrammarQuiz('particles');
    return;
  }
  renderPractice(type);
}

function renderPractice(type, subMode) {
  if (type === 'particle') {
    type = 'grammar';
    subMode = 'particles';
  }
  practiceState.type = type;
  
  if (!subMode) {
    if (type === 'kana') subMode = 'all';
    else if (type === 'vocab') subMode = 'meaning';
    else if (type === 'grammar') subMode = 'particles';
    else if (type === 'kanji') subMode = 'meaning';
    else if (type === 'flashcard') subMode = 'vocab';
    else if (type === 'listening') subMode = 'scenarios';
  }
  practiceState.subMode = subMode;

  renderPracticeSubBar(type, subMode);

  if (type === 'kana') renderKanaQuiz(subMode);
  else if (type === 'vocab') renderVocabQuiz(subMode);
  else if (type === 'grammar') renderGrammarQuiz(subMode);
  else if (type === 'kanji') renderKanjiQuiz(subMode);
  else if (type === 'flashcard') renderFlashcards(subMode);
  else if (type === 'listening') renderListeningHub(subMode);
}

function renderPracticeSubBar(type, currentSubMode) {
  const container = document.getElementById('practice-sub-bar');
  if (!container) return;

  let modes = [];
  if (type === 'kana') {
    modes = [
      { id: 'all', label: '⚡ All Kana' },
      { id: 'hiragana', label: 'ひ Hiragana Only' },
      { id: 'katakana', label: 'カ Katakana Only' },
      { id: 'combo', label: '🌀 Dakuon & Yoon' },
      { id: 'reverse', label: '🔄 Reverse (Romaji ➜ Kana)' }
    ];
  } else if (type === 'vocab') {
    modes = [
      { id: 'meaning', label: '📖 Meaning Quiz' },
      { id: 'reading', label: '🔤 Reading / Furigana' },
      { id: 'listening', label: '🎧 Audio Listening' },
      { id: 'fill', label: '✏️ Sentence Context' }
    ];
  } else if (type === 'grammar') {
    modes = [
      { id: 'particles', label: '助詞 Particle Challenge' },
      { id: 'ordering', label: '🧩 Sentence Ordering (並べ替え)' },
      { id: 'conjugation', label: '🔄 Verb Conjugations' }
    ];
  } else if (type === 'kanji') {
    modes = [
      { id: 'meaning', label: '漢 Meaning Match' },
      { id: 'reading', label: '音/訓 Onyomi & Kunyomi' },
      { id: 'context', label: '📄 Kanji in Sentence' }
    ];
  } else if (type === 'flashcard') {
    modes = [
      { id: 'vocab', label: '📚 Vocab Cards' },
      { id: 'kanji', label: '漢 Kanji Cards' },
      { id: 'grammar', label: '🔤 Grammar Cards' }
    ];
  } else if (type === 'listening') {
    modes = [
      { id: 'scenarios', label: '💬 Interactive Scenarios' },
      { id: 'resources', label: '📻 Curated Audio Resources' }
    ];
  }

  container.innerHTML = `
    <div style="font-size:12px;font-weight:600;color:var(--muted);margin-right:8px;text-transform:uppercase;letter-spacing:0.05em">Mode:</div>
    ${modes.map(m => `
      <button class="practice-sub-chip${m.id === currentSubMode ? ' active' : ''}" onclick="renderPractice('${type}', '${m.id}')">${m.label}</button>
    `).join('')}
  `;
}

// ── 1. KANA QUIZ ──
function renderKanaQuiz(subMode = 'all') {
  let chars = [];
  if (subMode === 'hiragana') {
    chars = HIRAGANA.flatMap(g => g.chars.map(c => ({ ...c, cat: 'Hiragana' })));
  } else if (subMode === 'katakana') {
    chars = KATAKANA.flatMap(g => g.chars.map(c => ({ ...c, cat: 'Katakana' })));
  } else if (subMode === 'combo') {
    const dakuon = [
      { jp: 'が', r: 'ga' }, { jp: 'ぎ', r: 'gi' }, { jp: 'ぐ', r: 'gu' }, { jp: 'げ', r: 'ge' }, { jp: 'ご', r: 'go' },
      { jp: 'ざ', r: 'za' }, { jp: 'じ', r: 'ji' }, { jp: 'ず', r: 'zu' }, { jp: 'ぜ', r: 'ze' }, { jp: 'ぞ', r: 'zo' },
      { jp: 'だ', r: 'da' }, { jp: 'ぢ', r: 'ji' }, { jp: 'づ', r: 'zu' }, { jp: 'で', r: 'de' }, { jp: 'ど', r: 'do' },
      { jp: 'ば', r: 'ba' }, { jp: 'び', r: 'bi' }, { jp: 'ぶ', r: 'bu' }, { jp: 'べ', r: 'be' }, { jp: 'ぼ', r: 'bo' },
      { jp: 'ぱ', r: 'pa' }, { jp: 'ぴ', r: 'pi' }, { jp: 'ぷ', r: 'pu' }, { jp: 'ぺ', r: 'pe' }, { jp: 'ぽ', r: 'po' }
    ];
    chars = dakuon.map(c => ({ ...c, cat: 'Dakuon' }));
  } else {
    chars = [...HIRAGANA, ...KATAKANA].flatMap(g => g.chars.map(c => ({ ...c, cat: g.group })));
  }

  const pool = shuffle(chars).slice(0, 10).map(c => {
    if (subMode === 'reverse') {
      const wrong = shuffle(chars.filter(k => k.jp !== c.jp)).slice(0, 3).map(k => k.jp);
      const opts = shuffle([c.jp, ...wrong]);
      return { q: c.r, opts, ans: opts.indexOf(c.jp), targetJp: c.jp, exp: `Romaji "${c.r}" = ${c.jp}` };
    } else {
      const wrong = shuffle(chars.filter(k => k.r !== c.r)).slice(0, 3).map(k => k.r);
      const opts = shuffle([c.r, ...wrong]);
      return { q: c.jp, opts, ans: opts.indexOf(c.r), targetJp: c.jp, exp: `${c.jp} = ${c.r}` };
    }
  });

  practiceState.pool = pool;
  practiceState.idx = 0;
  practiceState.correct = 0;
  practiceState.answered = false;
  renderKanaQuizCard();
}

function renderKanaQuizCard() {
  const { pool, idx, correct } = practiceState;
  const area = document.getElementById('practice-area');
  if (idx >= pool.length) {
    const pct = Math.round(correct / pool.length * 100);
    area.innerHTML = `
      <div class="quiz-wrap"><div class="quiz-result-card">
        <div class="quiz-result-score" style="color:var(--teal)">${pct}%</div>
        <div class="quiz-result-pct">${correct}/${pool.length} correct</div>
        <p style="color:var(--muted);margin-bottom:20px">${pct >= 80 ? '🎉 Outstanding Kana Mastery!' : 'Keep practicing daily!'}</p>
        <button class="btn-primary" onclick="renderKanaQuiz('${practiceState.subMode}')">Try Again</button>
      </div></div>`;
    return;
  }

  const q = pool[idx];
  const pct = Math.round(idx / pool.length * 100);

  area.innerHTML = `
    <div class="quiz-wrap">
      <div class="quiz-progress">Question ${idx + 1} of ${pool.length} · ✓ ${correct}</div>
      <div class="quiz-prog-bar"><div class="quiz-prog-fill" style="width:${pct}%"></div></div>
      <div class="quiz-card">
        <div style="display:flex;justify-content:center;align-items:center;gap:12px;margin-bottom:12px">
          <div style="font-size:64px;font-family:'Noto Sans JP',sans-serif;font-weight:700;color:var(--ink)">${q.q}</div>
          ${q.targetJp ? `<button class="pnd-audio-btn" style="font-size:20px;padding:8px 12px" onclick="playJapaneseAudio('${q.targetJp}')" title="Listen">🔊</button>` : ''}
        </div>
        <div class="quiz-hint">${practiceState.subMode === 'reverse' ? 'Select the correct Kana for this Romaji sound:' : 'What is the correct reading of this character?'}</div>
        <div class="quiz-options">
          ${q.opts.map((o, i) => `<button class="quiz-opt" onclick="checkKanaAnswer(${i})">${o}</button>`).join('')}
        </div>
        <div class="quiz-feedback" id="quizFeedback"></div>
        <button class="quiz-next-btn" id="quizNext" style="display:none" onclick="nextKanaQuestion()">Next →</button>
      </div>
    </div>`;
  
  if (q.targetJp) playJapaneseAudio(q.targetJp);
}

function checkKanaAnswer(i) {
  if (practiceState.answered) return;
  practiceState.answered = true;
  const q = practiceState.pool[practiceState.idx];
  const btns = document.querySelectorAll('.quiz-opt');
  btns.forEach(b => b.disabled = true);
  const isCorrect = i === q.ans;
  btns[i].classList.add(isCorrect ? 'correct' : 'wrong');
  if (!isCorrect) btns[q.ans].classList.add('correct');
  
  if (isCorrect) { practiceState.correct++; gainXP(5); }
  
  const fb = document.getElementById('quizFeedback');
  fb.className = 'quiz-feedback show ' + (isCorrect ? 'ok' : 'bad');
  fb.innerHTML = isCorrect ? '✓ Correct! ' + q.exp : '✗ ' + q.exp;
  document.getElementById('quizNext').style.display = 'inline-block';
}

function nextKanaQuestion() {
  practiceState.idx++;
  practiceState.answered = false;
  renderKanaQuizCard();
}

// ── 2. VOCAB QUIZ ──
function renderVocabQuiz(subMode = 'meaning') {
  const data = VOCAB[S.level] || VOCAB.N5;
  const pool = shuffle(data).slice(0, 10).map(v => {
    if (subMode === 'reading') {
      const wrong = shuffle(data.filter(x => x.r !== v.r)).slice(0, 3).map(x => x.r);
      const opts = shuffle([v.r, ...wrong]);
      return { q: `「${v.jp}」の　読み方は？`, opts, ans: opts.indexOf(v.r), tts: v.r, exp: `${v.jp} (${v.r}) = ${v.en}` };
    } else if (subMode === 'listening') {
      const wrong = shuffle(data.filter(x => x.en !== v.en)).slice(0, 3).map(x => x.en);
      const opts = shuffle([v.en, ...wrong]);
      return { q: `🎧 Listen to the audio word:`, opts, ans: opts.indexOf(v.en), tts: v.r, exp: `${v.jp} (${v.r}) = ${v.en}` };
    } else if (subMode === 'fill' && v.ex) {
      const wrong = shuffle(data.filter(x => x.jp !== v.jp)).slice(0, 3).map(x => x.jp);
      const opts = shuffle([v.jp, ...wrong]);
      const blankSentence = v.ex.replace(v.jp, '（　）');
      return { q: blankSentence, opts, ans: opts.indexOf(v.jp), tts: v.r, exp: `Full sentence: ${v.ex} (${v.exEn})` };
    } else {
      const wrong = shuffle(data.filter(x => x.en !== v.en)).slice(0, 3).map(x => x.en);
      const opts = shuffle([v.en, ...wrong]);
      return { q: `「${v.jp}」 (${v.r}) の意味は？`, opts, ans: opts.indexOf(v.en), tts: v.r, exp: `${v.jp} = ${v.en}` };
    }
  });

  practiceState.pool = pool;
  practiceState.idx = 0;
  practiceState.correct = 0;
  practiceState.answered = false;
  renderQuizCardGeneric();
}

// ── 3. GRAMMAR QUIZ ──
function renderGrammarQuiz(subMode = 'particles') {
  if (subMode === 'ordering') {
    practiceState.pool = shuffle(ADVANCED_PRACTICE_DATA.ordering);
    practiceState.idx = 0;
    practiceState.correct = 0;
    practiceState.answered = false;
    renderSentenceOrderingCard();
    return;
  }

  let data = [];
  if (subMode === 'conjugation') data = ADVANCED_PRACTICE_DATA.grammarConjugations;
  else data = ADVANCED_PRACTICE_DATA.grammarParticles;

  practiceState.pool = shuffle(data);
  practiceState.idx = 0;
  practiceState.correct = 0;
  practiceState.answered = false;
  renderQuizCardGeneric();
}

function renderSentenceOrderingCard() {
  const { pool, idx, correct } = practiceState;
  const area = document.getElementById('practice-area');
  if (idx >= pool.length) {
    const pct = Math.round(correct / pool.length * 100);
    area.innerHTML = `
      <div class="quiz-wrap"><div class="quiz-result-card">
        <div class="quiz-result-score" style="color:var(--indigo)">${pct}%</div>
        <div class="quiz-result-pct">${correct}/${pool.length} correct</div>
        <p style="color:var(--muted);margin-bottom:20px">${pct >= 70 ? '🧩 Sentence Structure Master!' : 'Keep practicing sentence blocks!'}</p>
        <button class="btn-primary" onclick="renderGrammarQuiz('ordering')">Try Again</button>
      </div></div>`;
    return;
  }

  const q = pool[idx];
  practiceState.orderingState = { selected: [], shuffled: shuffle(q.blocks) };
  const pct = Math.round(idx / pool.length * 100);

  area.innerHTML = `
    <div class="quiz-wrap">
      <div class="quiz-progress">Ordering Challenge ${idx + 1} of ${pool.length} · ✓ ${correct}</div>
      <div class="quiz-prog-bar"><div class="quiz-prog-fill" style="width:${pct}%"></div></div>
      
      <div class="ordering-container">
        <div style="font-size:13px;color:var(--muted);margin-bottom:6px">Arrange the blocks to complete the sentence:</div>
        <div class="quiz-q-text" style="font-size:22px;text-align:center">${q.prompt}</div>
        
        <div class="ordering-slots" id="orderingSlots">
          <!-- Filled by updateOrderingUI -->
        </div>

        <div style="font-size:12px;color:var(--muted);text-align:center;margin-bottom:8px">Click blocks below in the correct order:</div>
        <div class="ordering-pool" id="orderingPool">
          <!-- Filled by updateOrderingUI -->
        </div>

        <div style="display:flex;gap:10px;justify-content:center;margin-top:16px">
          <button class="btn-secondary" onclick="resetOrderingSlots()">Clear Slots ↺</button>
          <button class="btn-primary" id="submitOrderingBtn" onclick="checkOrderingAnswer()">Check Sentence ✓</button>
        </div>

        <div class="quiz-feedback" id="quizFeedback" style="margin-top:16px"></div>
        <button class="quiz-next-btn" id="quizNext" style="display:none;margin-top:12px" onclick="nextOrderingQuestion()">Next Sentence →</button>
      </div>
    </div>`;

  updateOrderingUI();
}

function updateOrderingUI() {
  const { selected, shuffled } = practiceState.orderingState;
  const q = practiceState.pool[practiceState.idx];

  const slotsEl = document.getElementById('orderingSlots');
  const poolEl = document.getElementById('orderingPool');
  if (!slotsEl || !poolEl) return;

  // Slots
  let slotsHtml = '';
  for (let i = 0; i < q.blocks.length; i++) {
    const isStar = i === q.ansIndex;
    if (selected[i] !== undefined) {
      const blockText = shuffled[selected[i]];
      slotsHtml += `<div class="ordering-slot-chip${isStar ? ' is-star' : ''}" onclick="removeOrderingSlot(${i})">${isStar ? '★ ' : ''}${blockText}</div>`;
    } else {
      slotsHtml += `<div class="ordering-slot-chip${isStar ? ' is-star' : ''}" style="border-style:dashed;opacity:0.5">${isStar ? '★ Slot ' + (i + 1) : 'Slot ' + (i + 1)}</div>`;
    }
  }
  slotsEl.innerHTML = slotsHtml;

  // Pool choices
  poolEl.innerHTML = shuffled.map((b, idx) => {
    const isUsed = selected.includes(idx);
    return `<button class="ordering-choice-chip${isUsed ? ' used' : ''}" onclick="selectOrderingChoice(${idx})">${b}</button>`;
  }).join('');
}

function selectOrderingChoice(choiceIdx) {
  if (practiceState.answered) return;
  const { selected, shuffled } = practiceState.orderingState;
  if (selected.length < shuffled.length && !selected.includes(choiceIdx)) {
    selected.push(choiceIdx);
    updateOrderingUI();
  }
}

function removeOrderingSlot(slotIdx) {
  if (practiceState.answered) return;
  practiceState.orderingState.selected.splice(slotIdx, 1);
  updateOrderingUI();
}

function resetOrderingSlots() {
  if (practiceState.answered) return;
  practiceState.orderingState.selected = [];
  updateOrderingUI();
}

function checkOrderingAnswer() {
  if (practiceState.answered) return;
  const { selected, shuffled } = practiceState.orderingState;
  const q = practiceState.pool[practiceState.idx];

  if (selected.length < shuffled.length) {
    toast('Please place all sentence blocks first!');
    return;
  }

  practiceState.answered = true;
  const userStarItem = shuffled[selected[q.ansIndex]];
  const isCorrect = userStarItem === q.blocks[q.ansIndex];

  if (isCorrect) {
    practiceState.correct++;
    gainXP(15, 'Sentence Ordering Star');
  }

  const fb = document.getElementById('quizFeedback');
  fb.className = 'quiz-feedback show ' + (isCorrect ? 'ok' : 'bad');
  fb.innerHTML = (isCorrect ? '✓ Excellent! Sentence arranged correctly!' : '✗ Incorrect order.') + `<br><div style="margin-top:6px;font-size:13px">${q.exp}</div> <button class="pnd-mini-audio" style="font-size:16px;margin-left:8px" onclick="playJapaneseAudio('${q.fullJp}')">🔊 Listen</button>`;

  document.getElementById('submitOrderingBtn').style.display = 'none';
  document.getElementById('quizNext').style.display = 'inline-block';
  playJapaneseAudio(q.fullJp);
}

function nextOrderingQuestion() {
  practiceState.idx++;
  practiceState.answered = false;
  renderSentenceOrderingCard();
}

// ── 4. KANJI QUIZ ──
function renderKanjiQuiz(subMode = 'meaning') {
  const kjList = KANJI[S.level] || KANJI.N5;
  const pool = shuffle(kjList).slice(0, 10).map(k => {
    if (subMode === 'reading') {
      const wrong = shuffle(kjList.filter(x => x.on !== k.on)).slice(0, 3).map(x => x.on);
      const opts = shuffle([k.on, ...wrong]);
      return { q: `「${k.k}」の　音読み（On）は？`, opts, ans: opts.indexOf(k.on), tts: k.kun || k.k, exp: `${k.k}: 音=${k.on}, 訓=${k.kun} (${k.en})` };
    } else if (subMode === 'context') {
      const wrong = shuffle(kjList.filter(x => x.k !== k.k)).slice(0, 3).map(x => x.k);
      const opts = shuffle([k.k, ...wrong]);
      return { q: `この　漢字は　どれですか？ (${k.en})`, opts, ans: opts.indexOf(k.k), tts: k.k, exp: `${k.k} = ${k.en}` };
    } else {
      const wrong = shuffle(kjList.filter(x => x.en !== k.en)).slice(0, 3).map(x => x.en);
      const opts = shuffle([k.en, ...wrong]);
      return { q: `「${k.k}」の　意味は？`, opts, ans: opts.indexOf(k.en), tts: k.k, exp: `${k.k}: ${k.en} (音: ${k.on} / 訓: ${k.kun})` };
    }
  });

  practiceState.pool = pool;
  practiceState.idx = 0;
  practiceState.correct = 0;
  practiceState.answered = false;
  renderQuizCardGeneric();
}

// ── GENERIC QUIZ RENDERER ──
function renderQuizCardGeneric() {
  const { pool, idx, correct } = practiceState;
  const area = document.getElementById('practice-area');
  if (idx >= pool.length) {
    const pct = Math.round(correct / pool.length * 100);
    area.innerHTML = `
      <div class="quiz-wrap"><div class="quiz-result-card">
        <div class="quiz-result-score" style="color:var(--green)">${pct}%</div>
        <div class="quiz-result-pct">${correct}/${pool.length} correct</div>
        <p style="color:var(--muted);margin-bottom:20px">${pct >= 70 ? '🎉 Great Job!' : 'Keep practicing daily!'}</p>
        <button class="btn-primary" onclick="renderPractice('${practiceState.type}', '${practiceState.subMode}')">Try Again</button>
      </div></div>`;
    return;
  }

  const q = pool[idx];
  const pct = Math.round(idx / pool.length * 100);

  area.innerHTML = `
    <div class="quiz-wrap">
      <div class="quiz-progress">Question ${idx + 1} of ${pool.length} · ✓ ${correct}</div>
      <div class="quiz-prog-bar"><div class="quiz-prog-fill" style="width:${pct}%"></div></div>
      <div class="quiz-card">
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin-bottom:14px">
          <div class="quiz-q-text" style="font-size:24px;margin-bottom:0">${q.q}</div>
          ${q.tts ? `<button class="pnd-audio-btn" onclick="playJapaneseAudio('${q.tts}')" title="Listen">🔊</button>` : ''}
        </div>
        <div class="quiz-options">
          ${q.opts.map((o, i) => `<button class="quiz-opt" onclick="checkGenericAnswer(${i})">${o}</button>`).join('')}
        </div>
        <div class="quiz-feedback" id="quizFeedback"></div>
        <button class="quiz-next-btn" id="quizNext" style="display:none" onclick="nextGenericQuestion()">Next →</button>
      </div>
    </div>`;

  if (practiceState.subMode === 'listening' && q.tts) {
    playJapaneseAudio(q.tts);
  }
}

function checkGenericAnswer(i) {
  if (practiceState.answered) return;
  practiceState.answered = true;
  const q = practiceState.pool[practiceState.idx];
  const btns = document.querySelectorAll('.quiz-opt');
  btns.forEach(b => b.disabled = true);
  const isCorrect = i === q.ans;
  btns[i].classList.add(isCorrect ? 'correct' : 'wrong');
  if (!isCorrect) btns[q.ans].classList.add('correct');

  if (isCorrect) { practiceState.correct++; gainXP(10); }

  const fb = document.getElementById('quizFeedback');
  fb.className = 'quiz-feedback show ' + (isCorrect ? 'ok' : 'bad');
  fb.innerHTML = isCorrect ? '✓ Correct! ' + (q.exp || '') : '✗ ' + (q.exp || `Correct: ${q.opts[q.ans]}`);
  document.getElementById('quizNext').style.display = 'inline-block';
}

function nextGenericQuestion() {
  practiceState.idx++;
  practiceState.answered = false;
  renderQuizCardGeneric();
}

// ── 5. SRS FLASHCARDS ──
function renderAdvancedFlashcards(subMode = 'vocab') {
  let deck = [];
  if (subMode === 'kanji') {
    deck = (KANJI[S.level] || KANJI.N5).map(k => ({ front: k.k, back: `${k.on} / ${k.kun}`, mean: k.en, tts: k.k }));
  } else if (subMode === 'grammar') {
    deck = (GRAMMAR[S.level] || GRAMMAR.N5).map(g => ({ front: g.pattern, back: g.meaning, mean: g.explanation, tts: g.pattern }));
  } else {
    deck = (VOCAB[S.level] || VOCAB.N5).map(v => ({ front: v.jp, back: v.r, mean: v.en, ex: v.ex, tts: v.r }));
  }

  practiceState.pool = shuffle(deck);
  practiceState.idx = 0;
  practiceState.srsState = { known: 0, mastered: 0, total: deck.length };

  renderSRSFlashcardCard();
}

function renderSRSFlashcardCard() {
  const { pool, idx, srsState } = practiceState;
  const area = document.getElementById('practice-area');

  if (idx >= pool.length) {
    area.innerHTML = `
      <div class="quiz-wrap"><div class="quiz-result-card">
        <div class="quiz-result-score" style="color:var(--teal)">100%</div>
        <div class="quiz-result-pct">Session Completed! 🎉 ${srsState.known} Reviewed · ${srsState.mastered} Mastered</div>
        <button class="btn-primary" style="margin-top:16px" onclick="renderAdvancedFlashcards('${practiceState.subMode}')">Review Again</button>
      </div></div>`;
    return;
  }

  const c = pool[idx];

  area.innerHTML = `
    <div class="srs-fc-wrap">
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;color:var(--muted);margin-bottom:12px">
        <span>Card ${idx + 1} of ${pool.length}</span>
        <span>Known: <strong style="color:var(--teal)">${srsState.known}</strong> · Mastered: <strong style="color:var(--indigo)">${srsState.mastered}</strong></span>
      </div>

      <div class="srs-fc-card" id="srsFc" onclick="toggleSRSFlip()">
        <div class="srs-fc-inner">
          <div class="srs-fc-front">
            <div style="font-size:54px;font-family:'Noto Sans JP',sans-serif;font-weight:700">${c.front}</div>
            <div style="font-size:12px;opacity:0.75;margin-top:12px">Tap card or press <kbd class="kbd-hint">Space</kbd> to flip 🔄</div>
          </div>
          <div class="srs-fc-back">
            <div style="font-size:28px;font-family:'Noto Sans JP',sans-serif;font-weight:700;color:var(--indigo);margin-bottom:6px">${formatFuriganaRuby(c.back)}</div>
            <div style="font-size:16px;font-weight:600;color:var(--teal);margin-bottom:10px">${c.mean}</div>
            ${c.ex ? `<div style="font-size:12px;color:var(--muted);text-align:center">${formatFuriganaRuby(c.ex)}</div>` : ''}
            <button class="pnd-audio-btn" style="margin-top:14px" onclick="event.stopPropagation(); playJapaneseAudio('${cleanRubyAudio(c.tts)}')">🔊 Listen</button>
          </div>
        </div>
      </div>

      <div class="srs-btn-row">
        <button class="srs-btn again" onclick="handleSRSAction('again')"><span class="srs-kbd-badge">1</span> 🔴 Again<span>+0 XP</span></button>
        <button class="srs-btn hard" onclick="handleSRSAction('hard')"><span class="srs-kbd-badge">2</span> 🟡 Hard<span>+2 XP</span></button>
        <button class="srs-btn good" onclick="handleSRSAction('good')"><span class="srs-kbd-badge">3</span> 🟢 Good<span>+5 XP</span></button>
        <button class="srs-btn easy" onclick="handleSRSAction('easy')"><span class="srs-kbd-badge">4</span> 🔵 Mastered<span>+10 XP</span></button>
      </div>

      <div class="srs-kbd-helper-row">
        <span>⌨️ Keyboard: <kbd class="kbd-hint">Space</kbd> Flip</span>
        <span><kbd class="kbd-hint">1</kbd> Again</span>
        <span><kbd class="kbd-hint">2</kbd> Hard</span>
        <span><kbd class="kbd-hint">3</kbd> Good</span>
        <span><kbd class="kbd-hint">4</kbd> Mastered</span>
      </div>
    </div>`;
}

function toggleSRSFlip() {
  const fc = document.getElementById('srsFc');
  if (fc) {
    fc.classList.toggle('flipped');
    if (fc.classList.contains('flipped')) {
      const c = practiceState.pool[practiceState.idx];
      if (c && c.tts) playJapaneseAudio(cleanRubyAudio(c.tts));
    }
  }
}

function handleSRSAction(rating) {
  if (rating === 'again') {
    // Re-queue at end
    const card = practiceState.pool[practiceState.idx];
    practiceState.pool.push(card);
  } else if (rating === 'hard') {
    gainXP(2, 'Flashcard Hard');
  } else if (rating === 'good') {
    practiceState.srsState.known++;
    gainXP(5, 'Flashcard Good');
  } else if (rating === 'easy') {
    practiceState.srsState.known++;
    practiceState.srsState.mastered++;
    gainXP(10, 'Flashcard Mastered');
  }

  practiceState.idx++;
  renderSRSFlashcardCard();
}

// Flashcard desktop keyboard handler
if (!window._srsKeydownAttached) {
  window._srsKeydownAttached = true;
  window.addEventListener('keydown', (e) => {
    const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

    const practicePage = document.getElementById('page-practice');
    if (!practicePage || !practicePage.classList.contains('active')) return;
    if (practiceState.type !== 'flashcard') return;

    if (e.code === 'Space') {
      e.preventDefault();
      toggleSRSFlip();
    } else if (e.key === '1' || e.code === 'Digit1' || e.code === 'Numpad1') {
      e.preventDefault();
      handleSRSAction('again');
    } else if (e.key === '2' || e.code === 'Digit2' || e.code === 'Numpad2') {
      e.preventDefault();
      handleSRSAction('hard');
    } else if (e.key === '3' || e.code === 'Digit3' || e.code === 'Numpad3') {
      e.preventDefault();
      handleSRSAction('good');
    } else if (e.key === '4' || e.code === 'Digit4' || e.code === 'Numpad4') {
      e.preventDefault();
      handleSRSAction('easy');
    }
  });
}

// ── 6. LISTENING HUB ──
function renderListeningHub(subMode = 'scenarios') {
  const area = document.getElementById('practice-area');
  const speed = practiceState.listeningSpeed || 1.0;
  const scenarios = ADVANCED_PRACTICE_DATA.listeningScenarios;
  const resources = LISTENING_RESOURCES[S.level] || LISTENING_RESOURCES.N5;

  if (subMode === 'resources') {
    area.innerHTML = `
      <div class="listening-hub-wrap">
        <div class="section-label" style="text-align:center;margin-bottom:20px">${S.level} Curated External Listening Resources</div>
        <div class="listening-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px">
          ${resources.map(r => `
            <a href="${r.url}" target="_blank" class="listen-card" style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:20px;text-decoration:none;display:block">
              <div style="font-size:32px;margin-bottom:10px">${r.icon}</div>
              <div style="font-size:16px;font-weight:700;color:var(--ink);margin-bottom:4px">${r.title}</div>
              <div style="font-size:11px;padding:2px 8px;border-radius:999px;background:var(--teal-soft);color:var(--teal);display:inline-block;margin-bottom:10px">${r.tag}</div>
              <p style="font-size:13px;color:var(--muted);line-height:1.5;margin-bottom:12px">${r.desc}</p>
              <div style="font-size:12px;color:var(--teal);font-weight:600">Open External Resource →</div>
            </a>`).join('')}
        </div>
      </div>`;
    return;
  }

  area.innerHTML = `
    <div class="listening-hub-wrap">
      <!-- Speed Selector -->
      <div class="speed-selector-bar">
        <div style="font-weight:600;font-size:14px;color:var(--ink)">🎧 Audio Speed:</div>
        <div style="display:flex;gap:6px">
          <button class="speed-btn${speed === 0.75 ? ' active' : ''}" onclick="setListeningSpeed(0.75)">0.75x (Slow)</button>
          <button class="speed-btn${speed === 1.0 ? ' active' : ''}" onclick="setListeningSpeed(1.0)">1.0x (Normal)</button>
          <button class="speed-btn${speed === 1.25 ? ' active' : ''}" onclick="setListeningSpeed(1.25)">1.25x (Fast)</button>
        </div>
      </div>

      <!-- Scenarios List -->
      ${scenarios.map(sc => `
        <div class="scenario-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:24px">${sc.icon}</span>
              <h3 style="font-family:var(--font-display);font-size:18px;color:var(--ink);margin:0">${sc.title}</h3>
            </div>
            <button class="btn-primary" style="padding:6px 14px;font-size:12px" onclick="playScenarioFull('${sc.id}')">▶ Play Dialogue</button>
          </div>

          <!-- Dialogue Lines -->
          <div class="scenario-dialogue-box">
            ${sc.dialogue.map(line => `
              <div class="dialogue-line">
                <span class="speaker-badge">${line.speaker}</span>
                <div class="dialogue-text">
                  <div>${line.jp}</div>
                  <div class="dialogue-sub">${line.en}</div>
                </div>
                <button class="pnd-mini-audio" style="font-size:16px" onclick="speakWithSpeed('${line.jp}', ${speed})" title="Replay line">🔊</button>
              </div>
            `).join('')}
          </div>

          <!-- Scenario Quiz Question -->
          <div style="background:var(--surface);border-radius:var(--radius-sm);padding:14px;margin-top:12px">
            <div style="font-size:12px;font-weight:600;color:var(--indigo);margin-bottom:6px">Comprehension Question:</div>
            <div style="font-size:14px;font-weight:600;color:var(--ink);margin-bottom:10px">${sc.question.q}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px" id="scQuiz_${sc.id}">
              ${sc.question.opts.map((opt, i) => `
                <button class="quiz-opt" onclick="checkScenarioQuestion('${sc.id}', ${i}, ${sc.question.ans})">${opt}</button>
              `).join('')}
            </div>
            <div class="quiz-feedback" id="scFb_${sc.id}"></div>
          </div>
        </div>
      `).join('')}
    </div>`;
}

function setListeningSpeed(speed) {
  practiceState.listeningSpeed = speed;
  renderListeningHub('scenarios');
}

function speakWithSpeed(text, speed = 1.0) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ja-JP';
  u.rate = 0.85 * speed;
  window.speechSynthesis.speak(u);
}

function playScenarioFull(scenarioId) {
  const sc = ADVANCED_PRACTICE_DATA.listeningScenarios.find(s => s.id === scenarioId);
  if (!sc) return;

  const fullText = sc.dialogue.map(d => d.jp).join('。 ');
  speakWithSpeed(fullText, practiceState.listeningSpeed || 1.0);
}

function checkScenarioQuestion(scId, selectedIdx, correctIdx) {
  const sc = ADVANCED_PRACTICE_DATA.listeningScenarios.find(s => s.id === scId);
  const exp = (sc && sc.question) ? sc.question.exp : '';
  const optsContainer = document.getElementById(`scQuiz_${scId}`);
  const fb = document.getElementById(`scFb_${scId}`);
  if (!optsContainer || !fb) return;

  const btns = optsContainer.querySelectorAll('.quiz-opt');
  btns.forEach(b => b.disabled = true);

  const isCorrect = selectedIdx === correctIdx;
  btns[selectedIdx].classList.add(isCorrect ? 'correct' : 'wrong');
  if (!isCorrect) btns[correctIdx].classList.add('correct');

  if (isCorrect) gainXP(10, 'Listening Scenario');

  fb.className = 'quiz-feedback show ' + (isCorrect ? 'ok' : 'bad');
  fb.innerHTML = (isCorrect ? '✓ Correct! ' : '✗ ') + exp;
}

// ── TEST SETS ──
function renderTestSets(){
  const sets=EXAM_SETS.filter(s=>s.level===S.level);
  document.getElementById('testSetGrid').innerHTML=sets.map(s=>`
    <div class="test-set-card" onclick="startPracticeTest('${s.id}')">
      <div class="tsc-year">${s.year}</div>
      <div class="tsc-title">${s.title}</div>
      <div class="tsc-meta">${s.questions.length} Questions · Vocab + Grammar + Reading</div>
      <span class="tsc-badge">${s.level}</span>
    </div>`).join('');
  document.getElementById('test-question-area').style.display='none';
  document.getElementById('test-results-area').style.display='none';
}

let testState={};
function startPracticeTest(setId){
  const set=EXAM_SETS.find(s=>s.id===setId);
  if(!set)return;
  testState={set,idx:0,answers:{},startTime:Date.now()};
  document.getElementById('testSetGrid').style.display='none';
  document.getElementById('test-question-area').style.display='block';
  renderTestQuestion();
}
function renderTestQuestion(){
  const {set,idx,answers}=testState;
  const qs=set.questions;
  if(idx>=qs.length){submitPracticeTest();return;}
  const q=qs[idx];
  const pct=Math.round(idx/qs.length*100);
  document.getElementById('test-question-area').innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <span style="font-size:13px;color:var(--text2)">Q${idx+1}/${qs.length}</span>
      <div style="flex:1;margin:0 16px;height:6px;background:rgba(255,255,255,.08);border-radius:3px;overflow:hidden"><div style="height:100%;width:${pct}%;background:var(--accent);border-radius:3px;transition:width .4s"></div></div>
      <button class="btn-primary" onclick="submitPracticeTest()">Submit</button>
    </div>
    <div class="exam-q-card">
      <div class="exam-q-section">${q.section}</div>
      <div class="exam-q-text">${q.q.replace(/\n/g,'<br>')}</div>
      <div class="exam-opts" id="testOpts">
        ${q.opts.map((o,i)=>`<button class="exam-opt${answers[idx]===i?' selected':''}" onclick="selectTestAnswer(${i})">${String.fromCharCode(65+i)}. ${o}</button>`).join('')}
      </div>
    </div>
    <div class="exam-nav">
      <button class="btn-secondary" onclick="testState.idx--;renderTestQuestion()" ${idx===0?'disabled':''}>← Prev</button>
      <button class="btn-primary" onclick="testState.idx++;renderTestQuestion()">${idx===qs.length-1?'Finish':'Next →'}</button>
    </div>`;
}
function selectTestAnswer(i){
  testState.answers[testState.idx]=i;
  document.querySelectorAll('.exam-opt').forEach((b,bi)=>{
    b.classList.toggle('selected',bi===i);
  });
}
function submitPracticeTest(){
  const {set,answers,startTime}=testState;
  const qs=set.questions;
  let correct=0;const weak={};const details=[];
  qs.forEach((q,i)=>{
    const right=answers[i]===q.ans;
    if(right)correct++;
    else{weak[q.section]=(weak[q.section]||0)+1;}
    details.push({q:q.q,opts:q.opts,userAns:answers[i],correct:q.ans,right,exp:q.exp||''});
  });
  const score=Math.round(correct/qs.length*100);
  const timeTaken=Math.round((Date.now()-startTime)/1000);
  const result={title:set.title,score,correct,total:qs.length,level:set.level||S.level,weakAreas:Object.keys(weak),timestamp:new Date().toISOString()};
  S.testResults.unshift(result);
  if (S.testResults.length > 30) S.testResults = S.testResults.slice(0, 30);
  Object.keys(weak).forEach(k=>{S.weakAreas[k]=(S.weakAreas[k]||0)+weak[k];});
  api('PATCH','/api/state',{testResults:S.testResults,weakAreas:S.weakAreas});
  gainXP(score*2);
  document.getElementById('testSetGrid').style.display='';
  document.getElementById('test-question-area').style.display='none';
  document.getElementById('test-results-area').style.display='block';
  showTestResults(score,correct,qs.length,details,weak,set.title);
}
function showTestResults(score,correct,total,details,weak,title){
  const pass=score>=60;
  const suggestions={Vocabulary:'Review vocabulary cards and use flashcards daily.',Grammar:'Practice grammar patterns with example sentences.',Reading:'Read short Japanese texts and practice comprehension.',Kanji:'Practice kanji stroke order and meanings.'};
  document.getElementById('test-results-area').innerHTML=`
    <div class="results-wrap">
      <div class="results-header">
        <div class="results-score" style="color:${pass?'var(--green)':'var(--accent)'}">${score}%</div>
        <div style="color:var(--text2)">${correct}/${total} Correct</div>
        <span class="results-pass ${pass?'pass':'fail'}">${pass?'✓ Pass':'✗ Need More Practice'}</span>
        <p style="color:var(--text2);font-size:14px;margin-top:12px">${score>=80?'Outstanding! 素晴らしい！':score>=60?'Good work! Keep it up!':'Keep practicing! がんばれ！'}</p>
      </div>
      ${Object.keys(weak).length?`<div class="weak-panel"><h3>⚠️ Areas Needing Improvement</h3>${Object.keys(weak).map(k=>`<div class="suggestion"><span class="sug-icon">📌</span><div><strong>${k}</strong><br>${suggestions[k]||'Review this section more carefully.'}</div></div>`).join('')}</div>`:''}
      <h3 class="section-label">Question Review</h3>
      ${details.map((d,i)=>`<div class="result-item"><span class="ri-status">${d.right?'✅':'❌'}</span><div class="ri-q"><div class="ri-q-text">${d.q.replace(/\n/g,'<br>')}</div><div class="ri-answers">Your: <span class="${d.right?'ri-correct':'ri-wrong'}">${d.opts[d.userAns]??'—'}</span> | Correct: <span class="ri-correct">${d.opts[d.correct]}</span>${d.exp?` · ${d.exp}`:''}</div></div></div>`).join('')}
      <div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap">
        <button class="btn-primary" onclick="renderTestSets()">← Back to Tests</button>
        <button class="btn-secondary" onclick="goto('practice')">Practice Weak Areas</button>
      </div>
    </div>`;
}

// ── LIVE EXAM SYSTEM ──
function renderExamLobby() {
  const level = S.level || 'N5';
  const labelEl = document.getElementById('examLevelLabel');
  if (labelEl) labelEl.textContent = level;
  
  const select = document.getElementById('examSetSelect');
  if (select) {
    const availableSets = EXAM_SETS.filter(s => s.level === level);
    if (!availableSets.length) {
      select.innerHTML = `<option value="">No exam sets found for ${level}</option>`;
    } else {
      select.innerHTML = availableSets.map(s => `
        <option value="${s.id}">${s.title} (${s.questions.length} Questions)</option>
      `).join('');
    }
  }

  updateExamLobbySpecs();

  document.getElementById('exam-lobby').style.display = '';
  document.getElementById('exam-active').style.display = 'none';
  document.getElementById('exam-results').style.display = 'none';
}

function updateExamLobbySpecs() {
  const level = S.level || 'N5';
  const select = document.getElementById('examSetSelect');
  const setId = select ? select.value : null;
  const set = EXAM_SETS.find(s => s.id === setId) || EXAM_SETS.find(s => s.level === level) || EXAM_SETS[0];

  if (set) {
    const vCount = set.questions.filter(q => q.section === 'Vocabulary' || q.section === 'Vocab').length;
    const gCount = set.questions.filter(q => q.section === 'Grammar').length;
    const rCount = set.questions.filter(q => q.section === 'Reading').length;
    const lCount = set.questions.filter(q => q.section === 'Listening').length;
    
    document.getElementById('examVocabCount').textContent = `${vCount} Qs`;
    document.getElementById('examGrammarCount').textContent = `${gCount} Qs`;
    document.getElementById('examReadingCount').textContent = `${rCount} Qs`;
    const lisEl = document.getElementById('examListeningCount');
    if (lisEl) lisEl.textContent = `${lCount} Qs`;
    document.getElementById('examTimeLabel').textContent = `${level === 'N4' ? 120 : 105} min`;
  }
}

function startLiveExam() {
  const select = document.getElementById('examSetSelect');
  const setId = select ? select.value : null;
  const set = EXAM_SETS.find(s => s.id === setId) || EXAM_SETS.find(s => s.level === S.level) || EXAM_SETS[0];

  if (!set) {
    toast('No exam set available for ' + S.level);
    return;
  }

  const allQs = set.questions.map((q, i) => ({ ...q, id: i }));
  S.currentExam = {
    setId: set.id,
    setTitle: set.title,
    questions: allQs,
    answers: {},
    flags: {},
    current: 0,
    total: allQs.length,
    startTime: Date.now()
  };
  S.examAudioSpeed = 1.0;

  const mins = S.level === 'N4' ? 120 : 105;
  S.currentExam.totalSeconds = mins * 60;
  S.currentExam.secondsLeft = mins * 60;

  document.getElementById('exam-lobby').style.display = 'none';
  document.getElementById('exam-active').style.display = '';
  renderExamQuestion();
  startExamTimer();
}

function renderExamQuestion() {
  const ex = S.currentExam;
  if (!ex || !ex.questions || !ex.questions.length) return;

  const q = ex.questions[ex.current];
  const pct = Math.round(((ex.current + 1) / ex.total) * 100);

  document.getElementById('examQNum').textContent = `Q ${ex.current + 1}/${ex.total}`;
  document.getElementById('examProgFill').style.width = pct + '%';

  const flagBtn = document.getElementById('examFlagBtn');
  if (flagBtn) {
    const isFlagged = ex.flags[ex.current];
    flagBtn.textContent = isFlagged ? '🚩 Flagged' : '🚩 Flag';
    flagBtn.style.background = isFlagged ? 'var(--gold-soft)' : '';
    flagBtn.style.color = isFlagged ? 'var(--gold)' : '';
  }

  // Render Navigator Palette Grid
  const navPalette = document.getElementById('examNavPalette');
  if (navPalette) {
    navPalette.innerHTML = ex.questions.map((item, idx) => {
      const isAns = ex.answers[idx] !== undefined;
      const isFlag = ex.flags[idx];
      const isCur = idx === ex.current;
      const isLis = item.section === 'Listening';

      let bg = 'var(--surface)';
      let color = 'var(--muted)';
      let border = '1px solid var(--border)';

      if (isAns) { bg = 'var(--indigo-soft)'; color = 'var(--indigo)'; border = '1px solid var(--indigo)'; }
      if (isFlag) { bg = 'var(--gold-soft)'; color = 'var(--gold)'; border = '1px solid var(--gold)'; }
      if (isCur) { border = '2px solid var(--teal)'; }

      return `
        <button style="width:34px;height:34px;border-radius:6px;font-size:11px;font-weight:600;background:${bg};color:${color};border:${border};cursor:pointer;display:flex;align-items:center;justify-content:center" onclick="jumpToExamQuestion(${idx})" title="${item.section}">
          ${idx + 1}${isFlag ? '🚩' : isLis ? '🎧' : ''}
        </button>`;
    }).join('');
  }

  const isListening = q.section === 'Listening';

  document.getElementById('examBody').innerHTML = `
    <div class="exam-q-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <div class="exam-q-num">Question ${ex.current + 1} of ${ex.total}</div>
        <div class="exam-q-section" style="margin-bottom:0;background:${isListening ? 'var(--teal-soft)' : 'var(--indigo-soft)'};color:${isListening ? 'var(--teal)' : 'var(--indigo)'}">
          ${isListening ? '🎧 聴解 Listening' : (q.section || 'General')}
        </div>
      </div>

      ${isListening ? `
        <div class="exam-audio-card" style="background:var(--surface);border:1.5px solid var(--teal);border-radius:var(--radius-sm);padding:16px;margin-bottom:20px;">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <button class="btn-primary" id="examAudioPlayBtn" onclick="playExamAudioQuestion()" style="padding:10px 18px;font-size:13px;display:flex;align-items:center;gap:8px;background:var(--teal);border:none;">
                🔊 Play Audio Prompt
              </button>
              <span style="font-size:12px;color:var(--muted);font-weight:600">Speed:</span>
              <div style="display:inline-flex;gap:4px">
                <button class="speed-btn${(S.examAudioSpeed || 1) === 0.75 ? ' active' : ''}" onclick="setExamAudioSpeed(0.75)">0.75x</button>
                <button class="speed-btn${(S.examAudioSpeed || 1) === 1.0 ? ' active' : ''}" onclick="setExamAudioSpeed(1.0)">1.0x</button>
                <button class="speed-btn${(S.examAudioSpeed || 1) === 1.25 ? ' active' : ''}" onclick="setExamAudioSpeed(1.25)">1.25x</button>
              </div>
            </div>
            <button class="btn-secondary" style="font-size:12px;padding:6px 12px" onclick="toggleExamAudioScript()">📜 Toggle Transcript</button>
          </div>
          <div id="examAudioScriptBox" style="display:none;margin-top:14px;padding-top:12px;border-top:1px dashed var(--border);font-size:13px;color:var(--ink);line-height:1.6">
            <strong>Audio Dialogue Script:</strong><br>${(q.audioScript || q.q).replace(/\n/g, '<br>')}
          </div>
        </div>
      ` : ''}

      <div class="exam-q-text">${q.q.replace(/\n/g, '<br>')}</div>
      <div class="exam-opts">
        ${q.opts.map((o, i) => `
          <button class="exam-opt${ex.answers[ex.current] === i ? ' selected' : ''}" onclick="selectExamAnswer(${i})">
            ${String.fromCharCode(65 + i)}. ${o}
          </button>
        `).join('')}
      </div>
    </div>
    <div class="exam-nav">
      <button class="btn-secondary" onclick="jumpToExamQuestion(${ex.current - 1})" ${ex.current === 0 ? 'disabled' : ''}>← Prev</button>
      <button class="btn-primary" onclick="${ex.current === ex.total - 1 ? 'confirmSubmitExam()' : `jumpToExamQuestion(${ex.current + 1})`}">
        ${ex.current === ex.total - 1 ? 'Submit Exam ✓' : 'Next →'}
      </button>
    </div>`;
}

function playExamAudioQuestion() {
  const ex = S.currentExam;
  if (!ex || !ex.questions || !ex.questions[ex.current]) return;
  const q = ex.questions[ex.current];
  const text = q.audioScript || q.q;

  if (!('speechSynthesis' in window)) {
    toast('Audio playback not supported in this browser');
    return;
  }

  window.speechSynthesis.cancel();
  const btn = document.getElementById('examAudioPlayBtn');
  if (btn) btn.textContent = '⏸ Playing...';

  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ja-JP';
  u.rate = S.examAudioSpeed || 1.0;

  u.onend = () => {
    if (btn) btn.textContent = '🔊 Play Audio Prompt';
  };
  u.onerror = () => {
    if (btn) btn.textContent = '🔊 Play Audio Prompt';
  };

  window.speechSynthesis.speak(u);
}

function setExamAudioSpeed(spd) {
  S.examAudioSpeed = spd;
  document.querySelectorAll('.speed-btn').forEach(b => {
    b.classList.toggle('active', parseFloat(b.textContent) === spd);
  });
  toast('Audio speed set to ' + spd + 'x');
}

function toggleExamAudioScript() {
  const box = document.getElementById('examAudioScriptBox');
  if (box) {
    box.style.display = box.style.display === 'none' ? 'block' : 'none';
  }
}

function jumpToExamQuestion(idx) {
  if (!S.currentExam || idx < 0 || idx >= S.currentExam.total) return;
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  S.currentExam.current = idx;
  renderExamQuestion();
}

function selectExamAnswer(i) {
  S.currentExam.answers[S.currentExam.current] = i;
  renderExamQuestion();
}

function toggleFlagCurrentQuestion() {
  const ex = S.currentExam;
  if (!ex) return;
  ex.flags[ex.current] = !ex.flags[ex.current];
  renderExamQuestion();
}

function confirmSubmitExam() {
  const ex = S.currentExam;
  if (!ex) return;

  const answeredCount = Object.keys(ex.answers).length;
  const unAnsCount = ex.total - answeredCount;
  const flagCount = Object.keys(ex.flags).filter(k => ex.flags[k]).length;

  if (unAnsCount > 0) {
    if (!confirm(`You have ${unAnsCount} unanswered questions (${flagCount} flagged). Are you sure you want to submit?`)) {
      return;
    }
  }
  submitExam(true);
}

function startExamTimer() {
  if (S.examTimer) clearInterval(S.examTimer);
  S.examTimer = setInterval(() => {
    S.currentExam.secondsLeft--;
    const { secondsLeft } = S.currentExam;
    const h = Math.floor(secondsLeft / 3600);
    const m = Math.floor((secondsLeft % 3600) / 60);
    const s = secondsLeft % 60;
    const display = `${h ? h + ':' : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    const timerEl = document.getElementById('examTimerDisplay');
    if (timerEl) {
      timerEl.textContent = display;
      if (secondsLeft <= 300) timerEl.style.color = 'var(--red)';
    }
    if (secondsLeft <= 0) submitExam(false);
  }, 1000);
}

function submitExam(manual) {
  if (S.examTimer) { clearInterval(S.examTimer); S.examTimer = null; }
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();

  const ex = S.currentExam;
  const qs = ex.questions;
  let correct = 0; const weak = {}; const details = [];

  qs.forEach((q, i) => {
    const right = ex.answers[i] === q.ans;
    if (right) correct++;
    else { weak[q.section || 'General'] = (weak[q.section || 'General'] || 0) + 1; }
    details.push({ q: q.q, opts: q.opts, userAns: ex.answers[i], correct: q.ans, right, exp: q.exp || '' });
  });

  const score = Math.round(correct / qs.length * 100);
  const timeTaken = Math.round((Date.now() - ex.startTime) / 1000);
  const result = {
    title: ex.setTitle || `${S.level} Live Exam`,
    score,
    correct,
    total: qs.length,
    level: S.level,
    weakAreas: Object.keys(weak),
    timeTaken,
    timestamp: new Date().toISOString()
  };

  S.testResults.unshift(result);
  if (S.testResults.length > 30) S.testResults = S.testResults.slice(0, 30);
  Object.keys(weak).forEach(k => { S.weakAreas[k] = (S.weakAreas[k] || 0) + weak[k]; });
  api('PATCH', '/api/state', { testResults: S.testResults, weakAreas: S.weakAreas });
  gainXP(score * 3, 'Live Exam Score');

  document.getElementById('exam-active').style.display = 'none';
  document.getElementById('exam-results').style.display = '';
  const pass = score >= 60;
  const suggestions = {
    Vocabulary: 'Review vocabulary with flashcards daily.',
    Grammar: 'Practice grammar patterns with テ-form exercises.',
    Reading: 'Read NHK Easy Japanese and practice comprehension.',
    Listening: 'Listen to Japanese podcasts and NHK Easy audio scenarios daily.',
    Kanji: 'Use spaced repetition for kanji memorization.'
  };

  document.getElementById('exam-results').innerHTML = `
    <div class="results-wrap">
      <div class="results-header">
        <div class="results-score" style="color:${pass ? 'var(--teal)' : 'var(--red)'}">${score}%</div>
        <div style="color:var(--muted);font-size:14px">${correct}/${qs.length} Correct · ${Math.round(timeTaken / 60)} min taken</div>
        <span class="results-pass ${pass ? 'pass' : 'fail'}">${pass ? '✓ PASS — おめでとうございます！' : '✗ Not Passing Yet — がんばれ！'}</span>
        <p style="color:var(--muted);font-size:14px;margin-top:12px">${score >= 80 ? '🎉 Excellent! You are fully prepared for the real JLPT exam!' : score >= 60 ? '👍 Passing score! Keep up the practice to boost your speed.' : 'More practice recommended. Focus on weak areas listed below.'}</p>
      </div>
      <div class="results-breakdown" style="grid-template-columns:repeat(auto-fit,minmax(120px,1fr));">
        ${['Vocabulary', 'Grammar', 'Reading', 'Listening'].map(sec => {
          const qsSec = qs.filter(q => q.section === sec || (sec === 'Vocabulary' && q.section === 'Vocab'));
          const corSec = qsSec.filter(q => ex.answers[qs.indexOf(q)] === q.ans).length;
          const pct = qsSec.length ? Math.round(corSec / qsSec.length * 100) : 0;
          return `<div class="rb-card"><div class="rb-num" style="color:${pct >= 60 ? 'var(--teal)' : 'var(--red)'}">${pct}%</div><div class="rb-label">${sec}</div></div>`;
        }).join('')}
      </div>
      ${Object.keys(weak).length ? `<div class="weak-panel"><h3>🎯 AI Recommendations</h3>${Object.keys(weak).map(k => `<div class="suggestion"><span class="sug-icon">💡</span><div><strong>${k}</strong><br>${suggestions[k] || 'Review this section.'}</div></div>`).join('')}</div>` : ''}
      <h3 class="section-label" style="margin-top:28px">Question Review</h3>
      ${details.map((d, i) => `
        <div class="result-item">
          <span class="ri-status">${d.right ? '✅' : '❌'}</span>
          <div class="ri-q">
            <div class="ri-q-text">${d.q.replace(/\n/g, '<br>')}</div>
            <div class="ri-answers">Your: <span class="${d.right ? 'ri-correct' : 'ri-wrong'}">${d.opts[d.userAns] ?? 'Unanswered'}</span> | Correct: <span class="ri-correct">${d.opts[d.correct]}</span>${d.exp ? ` · ${d.exp}` : ''}</div>
          </div>
        </div>
      `).join('')}
      <div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap">
        <button class="btn-primary" onclick="renderExamLobby()">Try Another Exam</button>
        <button class="btn-secondary" onclick="goto('tracker')">View Overall Progress</button>
      </div>
    </div>`;
}

// ── STUDY TIMER ──
function renderStudyTimer(){
  const h=Math.floor(S.timerSeconds/3600);
  const m=Math.floor((S.timerSeconds%3600)/60);
  const s=S.timerSeconds%60;
  const timeStr = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  const timeEl = document.getElementById('ftTime');
  if (timeEl) timeEl.textContent = timeStr;
  
  const btnEl = document.getElementById('ftBtn');
  if (btnEl) btnEl.textContent = S.timerRunning ? '⏸' : '▶';
}

function flushStudyTime(){
  const delta = S.timerSeconds - (S.lastSyncedSeconds || 0);
  if (delta > 0) {
    S.lastSyncedSeconds = S.timerSeconds;
    S.studyTimeSeconds = (S.studyTimeSeconds || 0) + delta;
    api('POST', '/api/study-time', { seconds: delta });
    saveLocalState();
  }
}

function timerToggle(){
  if(S.timerRunning){
    // PAUSE
    clearInterval(S.timerInterval);
    S.timerInterval = null;
    S.timerRunning = false;
    flushStudyTime();
  } else {
    // RESUME / START
    if (S.timerInterval) clearInterval(S.timerInterval);
    S.timerRunning = true;
    S.timerInterval = setInterval(() => {
        S.timerSeconds++;
        // Auto-sync every 60 seconds
        if (S.timerSeconds % 60 === 0) {
          flushStudyTime();
        }
        renderStudyTimer();
    }, 1000);
  }
  renderStudyTimer();
}

async function timerReset(){
  // Stop if running
  if (S.timerInterval) clearInterval(S.timerInterval);
  S.timerInterval = null;
  S.timerRunning = false;

  // Sync remaining time before reset
  flushStudyTime();
  
  // Fully reset
  S.timerSeconds = 0;
  S.lastSyncedSeconds = 0;
  renderStudyTimer();
  toast('Timer reset');
}

// Lifecycle listeners to prevent timer loss on tab switch or close
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && S.timerRunning) {
    flushStudyTime();
  }
});
window.addEventListener('beforeunload', () => {
  if (S.timerRunning) {
    flushStudyTime();
  }
});

// ── XP & ACTIVITY ──
function gainXP(amount, reason="Practice"){
  if (!S.xpHistory) S.xpHistory = [];
  S.xp = Math.max(0, S.xp + amount);
  if (amount !== 0) {
    S.xpHistory.unshift({ date: new Date().toISOString(), amount, reason: amount > 0 ? reason : "Reverted " + reason });
    if (S.xpHistory.length > 50) S.xpHistory = S.xpHistory.slice(0, 50);
    if (amount > 0) {
      toast(`+${amount} XP Earned! 🌟`);
    }
  }
  const xpEl=document.getElementById('sideXP'); if(xpEl)xpEl.textContent=S.xp;
  const xpFill=document.getElementById('xpFill'); if(xpFill)xpFill.style.width=Math.min(100,(S.xp%500)/5)+'%';
  const sfFlash=document.getElementById('statFlash'); if(sfFlash)sfFlash.textContent=S.xp;
  api('PATCH','/api/state',{xp:S.xp, xpHistory:S.xpHistory});
}
function showXPHistory() {
  const modal = document.getElementById('xpModal');
  if (modal) modal.style.display = 'flex';
  const list = document.getElementById('xpHistoryList');
  if (!list) return;
  if (!S.xpHistory || S.xpHistory.length === 0) {
    list.innerHTML = '<p style="color:var(--text2)">No XP earned yet. Start studying!</p>';
    return;
  }
  list.innerHTML = S.xpHistory.map(entry => {
    const d = new Date(entry.date);
    const time = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
    const dateStr = d.toLocaleDateString();
    const sign = entry.amount > 0 ? '+' : '';
    const color = entry.amount > 0 ? 'var(--teal)' : 'var(--red)';
    return `<div style="display:flex; justify-content:space-between; padding: 12px 0; border-bottom: 1px solid var(--border);">
      <div>
        <div style="font-weight:600">${entry.reason}</div>
        <div style="font-size:12px; color:var(--text2)">${dateStr} at ${time}</div>
      </div>
      <div style="font-weight:700; color:${color}">${sign}${entry.amount} XP</div>
    </div>`;
  }).join('');
}
function closeXPHistory() {
  const modal = document.getElementById('xpModal');
  if (modal) modal.style.display = 'none';
}
function markActivity(){
  const key = todayKey();
  const yKey = yesterdayKey();
  
  if (S.lastStudied === key) return; // Already marked today — no duplicate
  
  if (!S.lastStudied) {
    S.streak = 1;
  } else if (S.lastStudied === yKey) {
    S.streak++; // Consecutive day — extend streak
  } else {
    S.streak = 1; // Missed a day — reset streak
  }
  
  S.lastStudied = key;
  S.activityLog[key] = true;
  
  // Update streak display everywhere
  const streakEls = document.querySelectorAll('#streakNum, #sideStreak');
  streakEls.forEach(el => { if(el) el.textContent = S.streak; });
  
  // Persist to server or localStorage
  api('PATCH', '/api/state', { streak: S.streak, lastStudied: S.lastStudied, activityLog: S.activityLog });
  
  // Rebuild calendar to show today as active
  if(document.getElementById('miniCal')) buildCal();
  
  console.log(`📅 Activity marked: ${key} | Streak: ${S.streak}`);
}

function checkStreak(){
  if (!S.lastStudied) return;
  const key = todayKey();
  const yKey = yesterdayKey();
  
  // If last studied was before yesterday, streak is lost
  if (S.lastStudied !== key && S.lastStudied !== yKey) {
    S.streak = 0;
    api('PATCH', '/api/state', { streak: 0 });
  }
  
  const streakEls = document.querySelectorAll('#streakNum, #sideStreak');
  streakEls.forEach(el => { if(el) el.textContent = S.streak; });
}

// ── TOAST ──
function toast(msg){
  const t=document.getElementById('toast');
  document.getElementById('toastMsg').textContent=msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2800);
}

// ── MOBILE NAV ──
function initMobileNav(){
  if(document.querySelector('.mob-nav'))return;
  document.body.insertAdjacentHTML('beforeend',`
    <nav class="mob-nav">
      <button class="mob-nav-btn active" onclick="goto('dashboard',null)"><span>⊞</span><span>Home</span></button>
      <button class="mob-nav-btn" onclick="goto('learn',null)"><span>📖</span><span>Learn</span></button>
      <button class="mob-nav-btn" onclick="goto('practice',null)"><span>✏️</span><span>Practice</span></button>
      <button class="mob-nav-btn" onclick="goto('exam',null)"><span>📝</span><span>Exam</span></button>
      <button class="mob-nav-btn" onclick="goto('aivoice',null)"><span>🌸</span><span>Voice</span></button>
      <button class="mob-nav-btn" onclick="goto('tracker',null)"><span>📊</span><span>Tracker</span></button>
    </nav>`);
}
function setMobActive(el){
  document.querySelectorAll('.mob-nav-btn').forEach(b=>b.classList.remove('active'));
  if (el) el.classList.add('active');
}

// ── MODAL ──
function closeModal(){
  const el = document.getElementById('modalOverlay');
  if(el){
    el.style.display = 'none';
    el.classList.remove('open');
  }
}

// ── TRACKER PAGE ──
function renderTracker() {
  const level = S.level || 'N5';
  const vocab = VOCAB[level] || VOCAB.N5;
  const grammar = GRAMMAR[level] || GRAMMAR.N5;
  const kanji = KANJI[level] || KANJI.N5;
  const tests = EXAM_SETS.filter(s => s.level === level);

  const vDone = Object.keys(S.progress).filter(k => (k.startsWith('voc-') || k.startsWith('v-')) && S.progress[k]).length;
  const gDone = Object.keys(S.progress).filter(k => (k.startsWith('gram-') || k.startsWith('g-')) && S.progress[k]).length;
  const kDone = Object.keys(S.learnedKanji).filter(k => S.learnedKanji[k]).length;
  const tDone = (S.testResults || []).filter(r => r.level === level || (r.title && r.title.includes(level))).length;

  const vPct = vocab.length ? Math.min(100, Math.round((vDone / vocab.length) * 100)) : 0;
  const gPct = grammar.length ? Math.min(100, Math.round((gDone / grammar.length) * 100)) : 0;
  const kPct = kanji.length ? Math.min(100, Math.round((kDone / kanji.length) * 100)) : 0;
  const tPct = tests.length ? Math.min(100, Math.round((tDone / tests.length) * 100)) : 0;

  const overallMastery = Math.round((vPct + gPct + kPct + tPct) / 4);

  // Overview Header Cards
  const trLevelLabel = document.getElementById('trLevelLabel');
  if (trLevelLabel) trLevelLabel.textContent = `JLPT ${level}`;

  const trOverallMastery = document.getElementById('trOverallMastery');
  if (trOverallMastery) trOverallMastery.textContent = `${overallMastery}%`;

  const trTotalXP = document.getElementById('trTotalXP');
  if (trTotalXP) trTotalXP.textContent = `${S.xp || 0} XP`;

  const trStudyTime = document.getElementById('trStudyTime');
  if (trStudyTime) {
    const mins = Math.floor((S.studyTimeSeconds || 0) / 60);
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    trStudyTime.textContent = hrs > 0 ? `${hrs}h ${remMins}m` : `${mins}m`;
  }

  // Category Progress Bars
  const elVocNum = document.getElementById('tpVocNum');
  if (elVocNum) elVocNum.textContent = `${vDone}/${vocab.length}`;
  const elVocBar = document.getElementById('tpVocBar');
  if (elVocBar) elVocBar.style.width = vPct + '%';
  const elVocPct = document.getElementById('tpVocPct');
  if (elVocPct) elVocPct.textContent = vPct + '%';

  const elGramNum = document.getElementById('tpGramNum');
  if (elGramNum) elGramNum.textContent = `${gDone}/${grammar.length}`;
  const elGramBar = document.getElementById('tpGramBar');
  if (elGramBar) elGramBar.style.width = gPct + '%';
  const elGramPct = document.getElementById('tpGramPct');
  if (elGramPct) elGramPct.textContent = gPct + '%';

  const elKanjiNum = document.getElementById('tpKanjiNum');
  if (elKanjiNum) elKanjiNum.textContent = `${kDone}/${kanji.length}`;
  const elKanjiBar = document.getElementById('tpKanjiBar');
  if (elKanjiBar) elKanjiBar.style.width = kPct + '%';
  const elKanjiPct = document.getElementById('tpKanjiPct');
  if (elKanjiPct) elKanjiPct.textContent = kPct + '%';

  const elTestNum = document.getElementById('tpTestNum');
  if (elTestNum) elTestNum.textContent = `${tDone}/${tests.length}`;
  const elTestBar = document.getElementById('tpTestBar');
  if (elTestBar) elTestBar.style.width = tPct + '%';
  const elTestPct = document.getElementById('tpTestPct');
  if (elTestPct) elTestPct.textContent = tPct + '%';

  renderChecklist();
  renderExamHistory();
}

function renderExamHistory() {
  const container = document.getElementById('examHistoryContainer');
  if (!container) return;

  const results = S.testResults || [];
  if (!results.length) {
    container.innerHTML = `<div style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:24px;text-align:center;color:var(--muted);font-size:14px">No exam attempts recorded yet. Take a Live Exam or Mock Test to log your results!</div>`;
    return;
  }

  container.innerHTML = `
    <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden">
      <table style="width:100%;border-collapse:collapse;font-size:13px;text-align:left">
        <thead>
          <tr style="background:var(--surface);border-bottom:1px solid var(--border);color:var(--muted)">
            <th style="padding:12px 16px">Date</th>
            <th style="padding:12px 16px">Exam Set</th>
            <th style="padding:12px 16px">Score</th>
            <th style="padding:12px 16px">Status</th>
            <th style="padding:12px 16px">Time</th>
          </tr>
        </thead>
        <tbody>
          ${results.slice(0, 10).map(r => {
            const dateStr = r.timestamp ? new Date(r.timestamp).toLocaleDateString() : 'Recent';
            const pass = (r.score >= 60);
            const timeMin = r.timeTaken ? Math.round(r.timeTaken / 60) + ' min' : '—';
            return `
              <tr style="border-bottom:1px solid var(--border2)">
                <td style="padding:12px 16px;color:var(--muted)">${dateStr}</td>
                <td style="padding:12px 16px;font-weight:600;color:var(--ink)">${r.title || 'Live Exam'}</td>
                <td style="padding:12px 16px;font-weight:700;color:${pass ? 'var(--teal)' : 'var(--red)'}">${r.score}% (${r.correct}/${r.total})</td>
                <td style="padding:12px 16px">
                  <span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:999px;background:${pass ? 'var(--teal-soft)' : 'var(--red-soft)'};color:${pass ? 'var(--teal)' : 'var(--red)'}">
                    ${pass ? '✓ PASS' : '✗ FAIL'}
                  </span>
                </td>
                <td style="padding:12px 16px;color:var(--muted)">${timeMin}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function navigateToModule(page, subTab) {
  if (typeof goto === 'function') {
    goto(page);
  }
  if (page === 'learn' && subTab) {
    setTimeout(() => {
      document.querySelectorAll('.learn-section').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('#learnTabs .tab-btn').forEach(b => b.classList.remove('active'));
      const targetSection = document.getElementById('ls-' + subTab);
      if (targetSection) targetSection.classList.add('active');
      const b = document.querySelector(`#learnTabs .tab-btn[onclick*="'${subTab}'"]`);
      if (b) b.classList.add('active');
    }, 20);
  } else if (page === 'practice' && subTab) {
    setTimeout(() => {
      if (typeof practiceTab === 'function') {
        const b = document.querySelector(`#practiceTabs .tab-btn[onclick*="'${subTab}'"]`);
        practiceTab(subTab, b);
      }
    }, 20);
  }
}

function renderChecklist(){
  // preserve open state
  const openIds = Array.from(document.querySelectorAll('.cl-section.open')).map(el => el.id);

  const vocab = VOCAB[S.level] || [];
  const grammar = GRAMMAR[S.level] || [];
  const kanji = KANJI[S.level] || [];
  const vDone = Object.keys(S.progress||{}).filter(k=>k.startsWith('voc-')&&S.progress[k]&&k.endsWith('_'+S.level)).length;
  const gDone = Object.keys(S.progress||{}).filter(k=>k.startsWith('gram-')&&S.progress[k]&&k.endsWith('_'+S.level)).length;
  const kDone = Object.keys(S.learnedKanji||{}).filter(k=>k.endsWith('_'+S.level)&&S.learnedKanji[k]).length;
  const tDone = (S.testResults || []).length;
  const examPassed = (S.testResults || []).some(r => r.score >= 60);

  const n5Phases=[
    {id:'p0',name:'Writing Systems (文字・表記)',badge:'Phase 0',items:[
      {id:'w1',text:'Memorize Hiragana chart (46 characters)',pts:20,action:"navigateToModule('learn','kana')",actionLabel:'Hiragana ➜'},
      {id:'w2',text:'Practice Hiragana combination sounds (拗音) & drills',pts:20,action:"navigateToModule('practice','kana')",actionLabel:'Kana Quiz ➜'},
      {id:'w3',text:'Memorize Katakana chart (46 characters)',pts:20,action:"navigateToModule('learn','kana')",actionLabel:'Katakana ➜'},
      {id:'w4',text:'Write Katakana loanwords & foreign names',pts:20,action:"navigateToModule('practice','kana')",actionLabel:'Practice ➜'}
    ]},
    {id:'p1',name:'Vocabulary Milestones (語彙)',badge:'Phase 1',items:[
      {id:'v1',text:'Numbers 1-10,000, calendar dates & core counters',pts:15,action:"navigateToModule('learn','vocab')",actionLabel:'Vocab ➜'},
      {id:'v2',text:'Greetings, daily polite phrases & conversational expressions',pts:15,action:"navigateToModule('practice','vocab')",actionLabel:'Vocab Quiz ➜'},
      {id:'v3',text:'Family, food, places & time vocabulary',pts:15,action:"navigateToModule('practice','flashcard')",actionLabel:'Flashcards ➜'},
      {id:'v4',text:'Master all 85 N5 Verbs (Godan, Ichidan, Irregular)',pts:20,action:"navigateToModule('learn','grammar')",actionLabel:'Conjugation ➜',liveStat:`${vDone}/${vocab.length} learned`},
      {id:'v5',text:'Master all 66 N5 Adjectives (い vs な-adjectives)',pts:20,action:"navigateToModule('learn','grammar')",actionLabel:'Adjectives ➜'}
    ]},
    {id:'p2',name:'Grammar Patterns (文法・助詞)',badge:'Phase 2',items:[
      {id:'g1',text:'Essential particles: は, が, を, に, で, へ, と, も, から, まで',pts:25,action:"navigateToModule('practice','particle')",actionLabel:'Particle Drill ➜'},
      {id:'g2',text:'Verb conjugations: Polite 〜ます, Plain, and 〜て-form rules',pts:25,action:"navigateToModule('learn','grammar')",actionLabel:'Te-Form Rules ➜'},
      {id:'g3',text:'Desire (〜たい), Negative (〜ない), and Requests (〜てください)',pts:25,action:"navigateToModule('practice','grammar')",actionLabel:'Grammar Quiz ➜'},
      {id:'g4',text:'Giving permission (〜てもいい) and Obligation (〜なければなりません)',pts:25,action:"navigateToModule('learn','grammar')",actionLabel:'Grammar Patterns ➜',liveStat:`${gDone}/${grammar.length} learned`}
    ]},
    {id:'p3',name:'Kanji Mastery (漢字)',badge:'Phase 3',items:[
      {id:'k1',text:'Identify all 100+ N5 Kanji with stroke animations',pts:35,action:"navigateToModule('learn','kanji')",actionLabel:'Kanji Grid ➜',liveStat:`${kDone}/${kanji.length} learned`},
      {id:'k2',text:'Master Onyomi & Kunyomi readings of common compounds',pts:35,action:"navigateToModule('practice','kanji')",actionLabel:'Kanji Quiz ➜'},
      {id:'k3',text:'Practice writing and stroke order guide',pts:30,action:"navigateToModule('learn','kanji')",actionLabel:'Stroke Guide ➜'}
    ]},
    {id:'p4',name:'Listening & Exam Readiness (聴解・模擬試験)',badge:'Phase 4',items:[
      {id:'e1',text:'Listen and practice situational dialogues in Listening Hub',pts:25,action:"navigateToModule('practice','listening')",actionLabel:'Listening Hub ➜'},
      {id:'e2',text:'Complete Free Conversation roleplay with Sakura-sensei',pts:25,action:"goto('aivoice')",actionLabel:'AI Voice Chat ➜'},
      {id:'e3',text:'Take a Section Practice Test (Language Knowledge & Reading)',pts:30,action:"goto('test')",actionLabel:'Mock Tests ➜',liveStat:`${tDone} tests taken`},
      {id:'e4',text:'Pass a full timed Live Exam simulation (Score ≥ 60%)',pts:50,action:"goto('exam')",actionLabel:'Live Exam ➜',liveStat:examPassed ? 'Passed ✓' : 'Pending'}
    ]}
  ];

  const n4Phases=[
    {id:'p1',name:'Advanced Vocabulary (N4 語彙)',badge:'Phase 1',items:[
      {id:'v1',text:'Master 300+ N4 core words & compound nouns',pts:25,action:"navigateToModule('learn','vocab')",actionLabel:'Vocab ➜',liveStat:`${vDone}/${vocab.length} learned`},
      {id:'v2',text:'Transitive vs Intransitive verb pairs (自動詞・他動詞)',pts:25,action:"navigateToModule('practice','flashcard')",actionLabel:'Flashcards ➜'},
      {id:'v3',text:'Common Katakana loanwords & social expressions',pts:20,action:"navigateToModule('practice','vocab')",actionLabel:'Vocab Quiz ➜'}
    ]},
    {id:'p2',name:'N4 Grammar & Intermediate Structures (文法)',badge:'Phase 2',items:[
      {id:'g1',text:'Conditionals & Hypotheses: 〜たら, 〜ば, 〜なら, 〜と',pts:30,action:"navigateToModule('learn','grammar')",actionLabel:'Grammar ➜'},
      {id:'g2',text:'Passive (受身 〜られる) & Causative (使役 〜させる) forms',pts:35,action:"navigateToModule('practice','grammar')",actionLabel:'Grammar Quiz ➜'},
      {id:'g3',text:'Hearsay & Conjecture: 〜そうだ, 〜らしい, 〜ようだ',pts:30,action:"navigateToModule('learn','grammar')",actionLabel:'Grammar Guide ➜'},
      {id:'g4',text:'Honorifics & Humble Japanese (敬語・謙譲語・丁寧語)',pts:35,action:"navigateToModule('practice','grammar')",actionLabel:'Keigo Drill ➜'},
      {id:'g5',text:'Giving & Receiving actions: 〜てあげる, 〜てもらう, 〜てくれる',pts:30,action:"navigateToModule('practice','particle')",actionLabel:'Particle Drill ➜',liveStat:`${gDone}/${grammar.length} learned`}
    ]},
    {id:'p3',name:'N4 Kanji Mastery (漢字 300字)',badge:'Phase 3',items:[
      {id:'k1',text:'Recognize 150+ new N4 Kanji (300 total characters)',pts:35,action:"navigateToModule('learn','kanji')",actionLabel:'Kanji Grid ➜',liveStat:`${kDone}/${kanji.length} learned`},
      {id:'k2',text:'Master on/kun readings in sentence reading context',pts:35,action:"navigateToModule('practice','kanji')",actionLabel:'Kanji Quiz ➜'},
      {id:'k3',text:'Kanji compound vocabulary & multi-character words',pts:30,action:"navigateToModule('practice','flashcard')",actionLabel:'Flashcards ➜'}
    ]},
    {id:'p4',name:'N4 Listening & Mock Simulation (実践・本番対策)',badge:'Phase 4',items:[
      {id:'e1',text:'Listen to multi-speaker dialogues and answer comprehension questions',pts:30,action:"navigateToModule('practice','listening')",actionLabel:'Listening Hub ➜'},
      {id:'e2',text:'Read short and medium Japanese essays & instructions',pts:35,action:"goto('test')",actionLabel:'N4 Tests ➜'},
      {id:'e3',text:'Pass N4 Timed Live Exam with official scoring threshold (≥ 60%)',pts:50,action:"goto('exam')",actionLabel:'Live Exam ➜',liveStat:examPassed ? 'Passed ✓' : 'Pending'}
    ]}
  ];

  const phases = S.level === 'N5' ? n5Phases : n4Phases;

  // Auto-expand first incomplete phase if user hasn't explicitly toggled sections
  let autoOpenId = null;
  if (openIds.length === 0) {
    for (const p of phases) {
      const allDone = p.items.every(item => S.progress[`cl-${S.level}-${item.id}`]);
      if (!allDone) {
        autoOpenId = 'cl-' + p.id;
        break;
      }
    }
    if (!autoOpenId && phases.length > 0) autoOpenId = 'cl-' + phases[0].id;
  }

  const cont = document.getElementById('checklistContainer');
  if (!cont) return;

  cont.innerHTML = phases.map(p => {
    const sectionId = 'cl-' + p.id;
    const isExplicitOpen = openIds.includes(sectionId);
    const isOpen = openIds.length > 0 ? isExplicitOpen : (sectionId === autoOpenId);

    const totalItems = p.items.length;
    const doneItems = p.items.filter(item => S.progress[`cl-${S.level}-${item.id}`]).length;
    const pct = totalItems ? Math.round((doneItems / totalItems) * 100) : 0;
    const isPhaseComplete = (totalItems > 0 && doneItems === totalItems);

    return `
      <div class="cl-section ${isOpen ? 'open' : ''}" id="${sectionId}">
        <div class="cl-section-header" onclick="this.parentElement.classList.toggle('open')">
          <span class="cl-phase-badge">${p.badge}</span>
          <span class="cl-section-title">${p.name}</span>

          <div class="cl-progress-wrap">
            <div class="cl-progress-bar">
              <div class="cl-progress-fill" style="width:${pct}%"></div>
            </div>
            <span class="cl-progress-text">${doneItems}/${totalItems} (${pct}%)</span>
            ${isPhaseComplete ? '<span class="cl-complete-badge">✓ Complete</span>' : ''}
          </div>

          <span style="margin-left:4px;font-size:12px;color:var(--muted)">▽</span>
        </div>
        <div class="cl-body">
          ${p.items.map(item => {
            const key = `cl-${S.level}-${item.id}`;
            const done = S.progress[key];
            return `
              <div class="cl-item ${done ? 'done' : ''}" onclick="toggleCheckItem('${key}',${item.pts},'${item.text}')">
                <div class="cl-box">${done ? '✓' : ''}</div>
                <div class="cl-text">
                  ${item.text}
                  ${item.liveStat ? `<span class="cl-live-stat">📊 ${item.liveStat}</span>` : ''}
                </div>
                ${item.action ? `
                  <button class="cl-item-action-btn" onclick="event.stopPropagation(); ${item.action}">
                    ${item.actionLabel || 'Study ➜'}
                  </button>
                ` : ''}
                <div class="cl-pts">+${item.pts}pt</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
}

async function toggleCheckItem(key,pts,label="Task Completed"){
  const wasDone = S.progress[key];
  S.progress[key]=!S.progress[key];
  if(!wasDone) {
    gainXP(pts, label);
  } else {
    gainXP(-pts, label);
  }
  
  // UPDATE UI IMMEDIATELY (Smooth experience)
  renderTracker();
  if(document.getElementById('page-dashboard').classList.contains('active')) renderDashboard();

  // Check for phase bonus
  const n5Phases = [
    {num:0, keys:['cl-N5-w1','cl-N5-w2','cl-N5-w3','cl-N5-w4']},
    {num:1, keys:['cl-N5-v1','cl-N5-v2','cl-N5-v3','cl-N5-v4','cl-N5-v5']},
    {num:2, keys:['cl-N5-g1','cl-N5-g2','cl-N5-g3','cl-N5-g4']},
    {num:3, keys:['cl-N5-k1','cl-N5-k2','cl-N5-k3']},
    {num:4, keys:['cl-N5-e1','cl-N5-e2','cl-N5-e3','cl-N5-e4']}
  ];
  const n4Phases = [
    {num:1, keys:['cl-N4-v1','cl-N4-v2','cl-N4-v3']},
    {num:2, keys:['cl-N4-g1','cl-N4-g2','cl-N4-g3','cl-N4-g4','cl-N4-g5']},
    {num:3, keys:['cl-N4-k1','cl-N4-k2','cl-N4-k3']},
    {num:4, keys:['cl-N4-e1','cl-N4-e2','cl-N4-e3']}
  ];
  const phases = S.level === 'N5' ? n5Phases : n4Phases;
  const currentPhase = phases.find(ph => ph.keys.includes(key));
  
  if (currentPhase) {
    const isNowComplete = currentPhase.keys.every(k => S.progress[k]);
    if (isNowComplete && !wasDone) {
      gainXP(10);
      toast(`🌟 +10 for completing the phase!`, 'success');
    } else if (wasDone) {
      const wasPhaseComplete = currentPhase.keys.filter(k => k !== key).every(k => S.progress[k]);
      if (wasPhaseComplete) {
        gainXP(-10);
      }
    }
  }

  markActivity();
  // SYNC IN BACKGROUND (Don't await it for the UI)
  api('PATCH','/api/state',{progress:S.progress,xp:S.xp,lastStudied:S.lastStudied,activityLog:S.activityLog});
}

function showResetConfirm(){
  document.getElementById('confirm-layer').style.display = 'flex';
}
function closeConfirmModal(){
  document.getElementById('confirm-layer').style.display = 'none';
}
async function executeReset(){
  closeConfirmModal();
  S.xp=0;S.streak=0;S.progress={};S.learnedKanji={};S.testResults=[];S.studyTimeSeconds=0;
  S.weakAreas={};S.xpHistory=[];S.activityLog={};
  try {
    localStorage.removeItem(LS_APP_KEY);
    localStorage.removeItem(LS_GUEST_KEY);
  } catch(e) {}
  toast('Resetting study data...');
  const res = await api('POST','/api/state/reset');
  if(res.success){
    setTimeout(()=>location.reload(), 1000);
  } else {
    toast('Error resetting data');
  }
}

// ── STUDY REMINDERS & NOTIFICATION ENGINE ──
let reminderCheckInterval = null;
let triggeredMinutes = {};

function initReminderEngine() {
  if (reminderCheckInterval) clearInterval(reminderCheckInterval);
  reminderCheckInterval = setInterval(checkStudyReminders, 10000); // Check every 10 seconds
  checkStudyReminders();
  updateNotifStatusBadge();
}

function updateNotifStatusBadge() {
  const badge = document.getElementById('notifStatusBadge');
  if (!badge) return;
  if (!('Notification' in window)) {
    badge.textContent = 'Not Supported';
    badge.style.background = 'var(--red-soft)';
    badge.style.color = 'var(--red)';
  } else if (Notification.permission === 'granted') {
    badge.textContent = 'Active 🟢';
    badge.style.background = 'var(--teal-soft)';
    badge.style.color = 'var(--teal)';
  } else if (Notification.permission === 'denied') {
    badge.textContent = 'Blocked 🔴';
    badge.style.background = 'var(--red-soft)';
    badge.style.color = 'var(--red)';
  } else {
    badge.textContent = 'Permission Needed 🟡';
    badge.style.background = 'var(--gold-soft)';
    badge.style.color = 'var(--gold)';
  }
}

function checkStudyReminders() {
  if (!reminders || !reminders.length) return;

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${hours}:${minutes}`;
  const dateStr = now.toISOString().split('T')[0];

  reminders.forEach(r => {
    if (!r.enabled) return;

    if (r.time === currentTimeStr) {
      const triggerKey = `${dateStr}_${currentTimeStr}_${r.id}`;
      if (!triggeredMinutes[triggerKey]) {
        triggeredMinutes[triggerKey] = true;
        triggerReminderNotification(r);
      }
    }
  });
}

function triggerReminderNotification(r) {
  // 1. Web Audio Chime Sound
  playNotificationSound();

  // 2. In-App Toast & Modal
  toast(`⏰ Study Reminder: ${r.label} (${r.time})!`);
  showReminderModal(r);

  // 3. Browser Native Notification
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification('日本語 JLPT Study Hub 🔔', {
            body: `⏰ Time for: ${r.label} (${r.time})\nLet's get back to practice!`,
            icon: '/img/icon-192.jpg',
            badge: '/img/icon-192.jpg',
            vibrate: [200, 100, 200],
            tag: `reminder-${r.id}`
          });
        });
      } else {
        new Notification('日本語 JLPT Study Hub 🔔', {
          body: `⏰ Time for: ${r.label} (${r.time})\nLet's get back to practice!`,
          icon: '/img/icon-192.jpg'
        });
      }
    } catch (e) {
      console.warn('Native notification trigger:', e);
    }
  }
}

function playNotificationSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    const playNote = (freq, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playNote(659.25, now, 0.4);        // E5
    playNote(880.00, now + 0.18, 0.6);  // A5
  } catch (e) {
    console.warn('Web audio chime blocked:', e);
  }
}

function showReminderModal(r) {
  const modalBox = document.getElementById('modalBox');
  const modalOverlay = document.getElementById('modalOverlay');
  if (!modalBox || !modalOverlay) return;

  modalBox.innerHTML = `
    <div style="text-align:center;padding:10px">
      <div style="font-size:52px;margin-bottom:12px">⏰</div>
      <h2 style="font-family:var(--font-display);font-size:22px;margin-bottom:8px;color:var(--ink)">Study Reminder!</h2>
      <div style="font-size:16px;font-weight:600;color:var(--teal);margin-bottom:12px">${r.label} (${r.time})</div>
      <p style="color:var(--muted);font-size:13px;margin-bottom:24px;line-height:1.5">Consistent daily practice is key to mastering JLPT!</p>
      <div style="display:flex;gap:10px">
        <button class="btn-secondary" style="flex:1" onclick="closeModal()">Dismiss</button>
        <button class="btn-primary" style="flex:1" onclick="closeModal(); goto('practice', null);">Start Practice 🚀</button>
      </div>
    </div>
  `;
  modalOverlay.style.display = 'flex';
}

function testNotificationNow() {
  if (!('Notification' in window)) {
    toast('Browser does not support notifications.');
    return;
  }

  if (Notification.permission === 'granted') {
    triggerReminderNotification({ id: 999, time: 'Now', label: 'Test Notification' });
    toast('🔔 Test notification & sound chime triggered!');
  } else {
    Notification.requestPermission().then(p => {
      updateNotifStatusBadge();
      if (p === 'granted') {
        triggerReminderNotification({ id: 999, time: 'Now', label: 'Test Notification' });
        toast('🔔 Notifications enabled & test triggered!');
      } else {
        toast('⚠️ Notification permission blocked by browser.');
      }
    });
  }
}

function renderReminders() {
  const list = document.getElementById('remSlotsList');
  if (!list) return;

  if (!reminders.length) {
    reminders = [
      { id: 1, time: '08:00', label: 'Morning vocabulary practice!', enabled: true },
      { id: 2, time: '21:00', label: 'Evening grammar review!', enabled: true }
    ];
  }

  list.innerHTML = reminders.map(r => `
    <div class="rem-slot" style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border2)">
      <div class="rem-slot-time" style="font-family:var(--font-mono);font-size:18px;font-weight:700;color:var(--teal);min-width:64px">${r.time}</div>
      <div class="rem-slot-label" style="flex:1;font-size:14px;font-weight:500;color:var(--ink)">${r.label}</div>
      <div style="display:flex;align-items:center;gap:8px">
        <label class="toggle">
          <input type="checkbox" ${r.enabled ? 'checked' : ''} onchange="toggleReminder(${r.id})">
          <span class="toggle-track"></span>
        </label>
        <button class="btn-secondary" style="padding:4px 8px;font-size:12px;color:var(--red);border-color:rgba(192,57,43,0.3)" onclick="deleteReminder(${r.id})" title="Delete">🗑️</button>
      </div>
    </div>
  `).join('');

  updateNotifStatusBadge();
}

async function addReminder() {
  const t = document.getElementById('remTimeInp').value;
  const l = document.getElementById('remLabelInp').value || 'Study Session';
  if (!t) {
    toast('Please select a valid time first!');
    return;
  }

  const r = { id: Date.now(), time: t, label: l, enabled: true };
  reminders.push(r);
  document.getElementById('remLabelInp').value = '';
  await api('PATCH', '/api/state', { reminders });
  renderReminders();
  renderDashboard();
  toast(`Reminder added for ${t}! ⏰`);
}

async function deleteReminder(id) {
  reminders = reminders.filter(x => x.id !== id);
  await api('PATCH', '/api/state', { reminders });
  renderReminders();
  renderDashboard();
  toast('Reminder deleted!');
}

async function toggleReminder(id) {
  const r = reminders.find(x => x.id === id);
  if (r) {
    r.enabled = !r.enabled;
    await api('PATCH', '/api/state', { reminders });
    renderReminders();
    renderDashboard();
    toast(r.enabled ? 'Reminder enabled ⏰' : 'Reminder disabled ⏸️');
  }
}

function enableNotifs() {
  if (!('Notification' in window)) {
    alert('This browser does not support notifications.');
    return;
  }
  
  if (Notification.permission === 'granted') {
    toast('Notifications are already active! 🔔');
    updateNotifStatusBadge();
  } else {
    Notification.requestPermission().then(p => {
      updateNotifStatusBadge();
      if (p === 'granted') toast('Notifications enabled! 🔔');
      else toast('Notifications were denied or dismissed.');
    });
  }
}

// ── RESOURCE PAGE ──
function renderResource(){
  const container = document.getElementById('resourceContainer');
  if(!container) return;
  
  const lv = S.level || 'N5';
  const resources = RESOURCE_DATA.getResources(lv);

  container.innerHTML = resources.map(r => `
    <a href="${r.link}" target="_blank" style="text-decoration:none;transition:transform 0.2s" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'" class="resource-card-link">
      <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:24px;height:100%;display:flex;flex-direction:column;box-shadow:var(--shadow-sm);position:relative;overflow:hidden">
        <div style="font-size:32px;margin-bottom:16px">${r.icon}</div>
        <h3 style="font-family:var(--font-display);font-size:18px;margin-bottom:8px;color:var(--ink)">${r.title}</h3>
        <p style="color:var(--muted);font-size:13px;line-height:1.5;margin-bottom:16px;flex:1">${r.desc}</p>
        <div style="color:var(--accent);font-size:13px;font-weight:600;display:flex;align-items:center;gap:4px">Browse Files <span>→</span></div>
        <div style="position:absolute;top:-10px;right:-10px;font-size:60px;opacity:0.03;pointer-events:none">${r.icon}</div>
      </div>
    </a>
  `).join('');
}

// ── START ──
init();


// ── Master Conjugation Explorer & Drill ──
window.conjExplorerState = {
  filter: 'verbs_all',
  selectedJp: '食べる',
  drillMode: false
};

function initConjugationExplorer() {
  const filterSelect = document.getElementById('conjFilterSelect');
  if (!filterSelect) return;

  onConjFilterChange(window.conjExplorerState.filter);
}

function onConjFilterChange(filterVal) {
  window.conjExplorerState.filter = filterVal;
  const wordSelect = document.getElementById('conjWordSelect');
  if (!wordSelect) return;

  const n5List = VOCAB.N5 || [];
  let words = [];

  if (filterVal === 'all') {
    words = n5List.filter(w => w.conj);
  } else if (filterVal === 'verbs_all') {
    words = n5List.filter(w => w.cat === 'verbs');
  } else if (filterVal === 'verbs_core') {
    words = n5List.filter(w => w.cat === 'verbs' && w.core);
  } else if (filterVal === 'verbs_g1') {
    words = n5List.filter(w => w.cat === 'verbs' && w.group === 1);
  } else if (filterVal === 'verbs_g2') {
    words = n5List.filter(w => w.cat === 'verbs' && w.group === 2);
  } else if (filterVal === 'verbs_g3') {
    words = n5List.filter(w => w.cat === 'verbs' && w.group === 3);
  } else if (filterVal === 'adj_all') {
    words = n5List.filter(w => w.cat === 'adjectives');
  } else if (filterVal === 'adj_i') {
    words = n5List.filter(w => w.cat === 'adjectives' && w.type === 'i');
  } else if (filterVal === 'adj_na') {
    words = n5List.filter(w => w.cat === 'adjectives' && w.type === 'na');
  }

  wordSelect.innerHTML = words.map(w =>
    `<option value="${w.jp}">${w.jp} (${w.r}) — ${w.en}</option>`
  ).join('');

  if (words.length > 0) {
    const exists = words.find(w => w.jp === window.conjExplorerState.selectedJp);
    const targetWord = exists ? exists.jp : words[0].jp;
    wordSelect.value = targetWord;
    window.conjExplorerState.selectedJp = targetWord;
    renderConjWordDetail(targetWord);
  } else {
    document.getElementById('conjWordDetailArea').innerHTML = '<div style="color:var(--muted)">No words match this filter.</div>';
  }
}

function onConjWordSelect(wordJp) {
  window.conjExplorerState.selectedJp = wordJp;
  renderConjWordDetail(wordJp);
}

function toggleConjDrillMode() {
  window.conjExplorerState.drillMode = !window.conjExplorerState.drillMode;
  const btn = document.getElementById('conjDrillBtnText');
  const tb = document.getElementById('conjDrillToolbar');
  if (btn) btn.textContent = window.conjExplorerState.drillMode ? 'Active Recall Drill: ON (Answers Hidden)' : 'Active Recall Drill: OFF';
  if (tb) tb.style.display = window.conjExplorerState.drillMode ? 'inline-flex' : 'none';
  renderConjWordDetail(window.conjExplorerState.selectedJp);
}

function revealSingleDrillCell(el, val) {
  if (el && el.classList.contains('hidden')) {
    el.classList.remove('hidden');
    if (val) playJapaneseAudio(cleanRubyAudio(val));
    updateDrillProgress();
  }
}

function resetConjDrill() {
  const cells = document.querySelectorAll('.conj-drill-cell');
  cells.forEach(c => c.classList.add('hidden'));
  updateDrillProgress();
  toast('Drill reset: all answers hidden 🎯');
}

function revealAllConjDrill() {
  const cells = document.querySelectorAll('.conj-drill-cell');
  cells.forEach(c => c.classList.remove('hidden'));
  updateDrillProgress();
  toast('All conjugations revealed 👁');
}

function updateDrillProgress() {
  const total = document.querySelectorAll('.conj-drill-cell').length;
  const hidden = document.querySelectorAll('.conj-drill-cell.hidden').length;
  const revealed = total - hidden;
  const badge = document.getElementById('drillProgressBadge');
  if (badge) {
    if (total > 0 && revealed === total) {
      badge.classList.add('completed');
      badge.innerHTML = `🎉 All ${total} Mastered! (+5 XP)`;
      gainXP(5, 'Conjugation Active Recall Completed');
    } else {
      badge.classList.remove('completed');
      badge.innerHTML = `🎯 Recalled: ${revealed} / ${total}`;
    }
  }
}

function renderConjWordDetail(wordJp) {
  const area = document.getElementById('conjWordDetailArea');
  if (!area) return;

  const n5List = VOCAB.N5 || [];
  const word = n5List.find(w => w.jp === wordJp);
  if (!word || !word.conj) {
    area.innerHTML = '<div style="color:var(--muted)">Select a word above to see its complete conjugation matrix.</div>';
    return;
  }

  const isDrill = window.conjExplorerState.drillMode;

  function makeDrillCell(val) {
    if (!isDrill) {
      return `<strong>${val}</strong> <button class="pnd-mini-audio" onclick="playJapaneseAudio('${cleanRubyAudio(val)}')">🔊</button>`;
    }
    return `
      <div class="conj-drill-cell hidden" onclick="revealSingleDrillCell(this, '${val}')" title="Click to reveal">
        <span class="conj-val-text">${val}</span>
        <button class="pnd-mini-audio" onclick="event.stopPropagation(); playJapaneseAudio('${cleanRubyAudio(val)}')" style="margin-left:6px">🔊</button>
      </div>`;
  }

  let tableHtml = '';
  if (word.cat === 'verbs') {
    tableHtml = `
      <div style="overflow-x:auto">
        <table class="conj-matrix-table">
          <thead>
            <tr>
              <th>Form / Mood</th>
              <th>Polite Form (丁寧形)</th>
              <th>Plain Form (普通形)</th>
              <th>Example Sentence</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Present / Future (+)</strong><br><small style="color:var(--muted)">Affirmative habit / future</small></td>
              <td>${makeDrillCell(word.conj.politePres)}</td>
              <td>${makeDrillCell(word.jp)}</td>
              <td rowspan="2" style="vertical-align:middle;background:var(--surface, rgba(0,0,0,0.01))">
                <strong style="font-family:'Noto Sans JP',sans-serif">${formatFuriganaRuby(word.ex)}</strong>
                <button class="pnd-mini-audio" onclick="playJapaneseAudio('${cleanRubyAudio(word.ex)}')">🔊</button>
                <div style="font-size:12px;color:var(--teal);margin-top:4px">${word.exEn}</div>
              </td>
            </tr>
            <tr>
              <td><strong>Present / Future (-)</strong><br><small style="color:var(--muted)">Negative habit / future</small></td>
              <td>${makeDrillCell(word.conj.politeNeg)}</td>
              <td>${makeDrillCell(word.conj.plainNeg)}</td>
            </tr>
            <tr>
              <td><strong>Past Affirmative (+)</strong><br><small style="color:var(--muted)">Completed action</small></td>
              <td>${makeDrillCell(word.conj.politePast)}</td>
              <td>${makeDrillCell(word.conj.plainPast)}</td>
              <td rowspan="3" style="vertical-align:middle;background:var(--surface, rgba(0,0,0,0.01))">
                <div style="font-size:12px;color:var(--muted);line-height:1.6">
                  <strong>Classification:</strong> ${word.sub}<br>
                  ${word.core ? '⭐ <span style="color:var(--accent);font-weight:600">Core N5 Priority Verb</span><br>' : ''}
                  <strong>Dictionary Form:</strong> ${word.jp} (${word.r})<br>
                  <strong>English:</strong> ${word.en}
                </div>
              </td>
            </tr>
            <tr>
              <td><strong>Past Negative (-)</strong><br><small style="color:var(--muted)">Did not do</small></td>
              <td>${makeDrillCell(word.conj.politePastNeg)}</td>
              <td>${makeDrillCell(word.conj.plainNeg + 'かった')}</td>
            </tr>
            <tr>
              <td><strong>て-Form (Connecting / Request)</strong><br><small style="color:var(--muted)">〜てください / 〜ている</small></td>
              <td colspan="2">${makeDrillCell(word.conj.te)} <small style="color:var(--muted)">(e.g. ${word.conj.te}ください)</small></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  } else if (word.cat === 'adjectives') {
    tableHtml = `
      <div style="overflow-x:auto">
        <table class="conj-matrix-table">
          <thead>
            <tr>
              <th>Tense / Form</th>
              <th>Affirmative (+)</th>
              <th>Negative (-)</th>
              <th>Example Usage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Present / Habitual</strong></td>
              <td>${makeDrillCell(word.conj.presAff)}</td>
              <td>${makeDrillCell(word.conj.presNeg)}</td>
              <td rowspan="2" style="vertical-align:middle;background:var(--surface, rgba(0,0,0,0.01))">
                <strong style="font-family:'Noto Sans JP',sans-serif">${formatFuriganaRuby(word.ex)}</strong>
                <button class="pnd-mini-audio" onclick="playJapaneseAudio('${cleanRubyAudio(word.ex)}')">🔊</button>
                <div style="font-size:12px;color:var(--teal);margin-top:4px">${word.exEn}</div>
              </td>
            </tr>
            <tr>
              <td><strong>Past Tense</strong></td>
              <td>${makeDrillCell(word.conj.pastAff)}</td>
              <td>${makeDrillCell(word.conj.pastNeg)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  area.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
      <div style="display:flex;align-items:center;gap:12px;">
        <span style="font-size:28px;font-family:'Noto Sans JP',sans-serif;font-weight:700;color:var(--ink)">${word.jp}</span>
        <span style="font-size:16px;color:var(--muted)">(${word.r})</span>
        <button class="pnd-audio-btn" onclick="playJapaneseAudio('${cleanRubyAudio(word.jp)}')" title="Listen">🔊</button>
        <span style="font-size:16px;font-weight:600;color:var(--teal);margin-left:8px">${word.en}</span>
      </div>
      <div style="display:flex;gap:6px;align-items:center">
        ${word.core ? '<span class="vocab-badge-core">⭐ Top 20 Must-Know First</span>' : ''}
        <span class="vocab-badge-sub">${word.sub || word.cat}</span>
      </div>
    </div>
    ${word.note ? `<div class="vc-note-box" style="margin-bottom:12px;">💡 ${word.note}</div>` : ''}
    ${tableHtml}
  `;

  if (isDrill) {
    setTimeout(updateDrillProgress, 20);
  }
}
