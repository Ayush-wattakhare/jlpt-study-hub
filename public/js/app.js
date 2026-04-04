// ── STATE ──
let S = {
  level:'N5', xp:0, streak:0, lastStudied:null, studyTimeSeconds:0,
  completedLessons:[], testResults:[], progress:{}, achievements:[],
  weakAreas:{}, activityLog:{}, settings:{theme:'light'},
  timerRunning:false, timerSeconds:0, timerInterval:null,
  currentQuiz:null, currentExam:null, examTimer:null,
  learnedKanji:{},
};
let reminders=[];

let currentUser = localStorage.getItem('jlptEmail');
let isGuest = localStorage.getItem('jlptGuest') === 'true';

// ── API ──
const api = async (method,path,body)=>{
  try{
    const r=await fetch(path,{
      method,
      headers:{
        'Content-Type':'application/json',
        'x-user-email': currentUser || (isGuest ? 'guest' : '')
      },
      body:body?JSON.stringify(body):undefined
    });
    return await r.json();
  }catch(e){return{success:false,error:e.message};}
};

// ── AUTHENTICATION ──
async function handleAuth(type) {
  const email = document.getElementById('authEmail').value.trim();
  const pwd = document.getElementById('authPwd').value.trim();
  const errEl = document.getElementById('authError');
  errEl.style.display = 'none';

  if (!email || !pwd) {
    errEl.textContent = 'Please enter both email and password.';
    errEl.style.display = 'block';
    return;
  }

  const res = await api('POST', `/api/auth/${type}`, { email, password: pwd });
  if (res.success) {
    localStorage.setItem('jlptEmail', email);
    localStorage.removeItem('jlptGuest');
    location.reload();
  } else {
    errEl.textContent = res.error || 'Authentication failed.';
    errEl.style.display = 'block';
  }
}

function handleLogout() {
  localStorage.removeItem('jlptEmail');
  localStorage.removeItem('jlptGuest');
  location.reload();
}

function continueAsGuest() {
  localStorage.setItem('jlptGuest', 'true');
  location.reload();
}

// ── INIT ──
async function init(){
  if (!currentUser && !isGuest) {
    document.getElementById('auth-layer').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    return;
  }
  document.getElementById('auth-layer').style.display = 'none';
  document.body.style.overflow = 'auto';

  const navAuthBtn = document.getElementById('navAuthBtn');
  if (navAuthBtn) {
    if (isGuest) {
      navAuthBtn.textContent = 'Sign In';
      navAuthBtn.onclick = () => {
        localStorage.removeItem('jlptGuest');
        location.reload();
      };
    } else {
      navAuthBtn.textContent = 'Logout';
      navAuthBtn.onclick = handleLogout;
    }
  }

  const r=await api('GET','/api/state');
  if(r.success&&r.data){
    const d=r.data;
    S.level=d.level||'N5'; S.xp=d.xp||0; S.streak=d.streak||0;
    S.lastStudied=d.lastStudied||null; S.studyTimeSeconds=d.studyTimeSeconds||0;
    S.completedLessons=d.completedLessons||[]; S.testResults=d.testResults||[];
    S.progress=d.progress||{}; S.achievements=d.achievements||[];
    S.weakAreas=d.weakAreas||{}; S.activityLog=d.activityLog||[];
    if(d.settings)S.settings=d.settings;
    reminders=d.reminders||[];
    if(S.progress.learnedKanji)S.learnedKanji=S.progress.learnedKanji;
  }
  applyTheme();
  updateLevelUI();
  renderDashboard();
  renderStudyTimer();
  if(!document.querySelector('.mob-nav'))initMobileNav();
}

// ── THEME ──
function applyTheme(){/* light is default, dark adds class */if(S.settings.theme==='dark')document.body.classList.add('dark-mode');else document.body.classList.remove('dark-mode');}
function toggleTheme(){
  S.settings.theme=S.settings.theme==='dark'?'light':'dark';
  applyTheme();
  document.querySelector('.theme-btn').textContent=S.settings.theme==='dark'?'🌙':'☀️';
  api('PATCH','/api/state',{settings:S.settings});
}

// ── NAVIGATION ──
function goto(page,btn){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(n=>n.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  if(btn)btn.classList.add('active');
  if(page==='dashboard')renderDashboard();
  else if(page==='learn')renderLearn();
  else if(page==='practice'){renderPractice('kana');document.querySelectorAll('#practiceTabs .tab-btn')[0].classList.add('active');}
  else if(page==='test')renderTestSets();
  else if(page==='exam')renderExamLobby();
  else if(page==='tracker')renderTracker();
  else if(page==='reminders')renderReminders();
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
  const displayName = currentUser ? currentUser.split('@')[0] : 'Guest';
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
    {num:4, days:[27,35],name:'Exam Simulation',tasks:['Reading drills','Grammar fill-in','Vocab context','Mock test 1','Mock test 2','Final live exam prep'], keys:[]}
  ] : [
    {num:1, days:[1,7],name:'Advanced Vocabulary',tasks:['Complex objects','Abstract nouns','Advanced verbs','Formal expressions','Vocab drills','Contextual review'], keys:['cl-N4-v1','cl-N4-v2']},
    {num:2, days:[8,18],name:'N4 Grammar',tasks:['Complete ~te patterns','Conditionals ~tara','Hearsay ~rashii','Passive & causative','Expectation ~hazu','Grammar review'], keys:['cl-N4-g1','cl-N4-g2','cl-N4-g3']},
    {num:3, days:[19,25],name:'Kanji Mastery',tasks:['Identify 300 total kanji','Kanji compounds (N4)','Complex readings','Advanced stroke order'], keys:['cl-N4-k1','cl-N4-k2']},
    {num:4, days:[26,35],name:'Exam Simulation',tasks:['Full reading passage','Listening simulation','Vocab/Grammar mock','Live exam set 1','Live exam set 2'], keys:[]}
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

  const proverbs = [
    '"Fall seven times, stand up eight."<br>— Japanese Proverb',
    '"Perseverance is power."<br>— Japanese Proverb',
    '"Even monkeys fall from trees."<br>— Japanese Proverb',
    '"Continuance is power."<br>— Japanese Proverb',
    '"Time is money."<br>— Japanese Proverb'
  ];

  const todayCard = document.querySelector('.today-card');
  if(todayCard){
    if(cpDone){
      todayCard.style.background = 'var(--teal)';
      todayCard.innerHTML = `<div class="today-label">PHASE ${cp.num} COMPLETE 🌟</div>
        <div class="today-phase" style="font-size:24px;margin-bottom:8px">Congratulations!</div>
        <div class="today-task" style="font-size:13px;color:rgba(255,255,255,0.9);font-style:italic">${proverbs[cp.num % proverbs.length]}</div>`;
    } else {
      todayCard.style.background = '';
      todayCard.innerHTML = `<div class="today-label">STUDY TASK</div>
        <div class="today-day">P${cp.num}</div>
        <div class="today-phase">${cp.name}</div>
        <div class="today-task">${currentTaskText}</div>`;
    }
  }

  // Stats
  const vDone = kDone ? kDone * 2 : 0;
  const gramDone = Object.keys(S.progress||{}).filter(k=>k.startsWith('gram-')&&S.progress[k]).length;
  
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
    const active=(window.reminders||[]).filter(r=>r.enabled);
    dr.innerHTML=active.length?active.map(r=>`<div class="reminder-row"><div class="rem-dot"></div>${r.label}<div class="rem-time">${r.time}</div></div>`).join(''):'<div style="font-size:13px;color:var(--muted)">No active reminders.</div>';
  }

  // Weak Areas
  const wa=document.getElementById('weakAreasPanel');
  const waKeys=Object.keys(S.weakAreas).sort((a,b)=>S.weakAreas[b]-S.weakAreas[a]);
  if(wa)wa.innerHTML=waKeys.length?waKeys.slice(0,5).map(k=>`<div class="weak-item"><span>${k}</span><span style="color:var(--red);font-weight:600">${S.weakAreas[k]} errors</span></div>`).join(''):'<div style="font-size:13px;color:var(--muted)">Take tests to identify weak areas!</div>';

  // Test History
  const th=document.getElementById('testHistoryPanel');
  if(th)th.innerHTML=S.testResults.slice(0,4).map(t=>`<div class="test-hist-item"><div style="display:flex;justify-content:space-between"><strong>${t.title||'Test'}</strong><span class="test-hist-score" style="color:${t.score>=60?'var(--teal)':'var(--red)'}">${Math.round(t.score)}%</span></div><div style="color:var(--muted);font-size:11px">${new Date(t.timestamp).toLocaleDateString()} · ${t.correct||0}/${t.total||0} correct</div></div>`).join('')||'<div style="font-size:13px;color:var(--muted)">No tests taken yet.</div>';
}

function buildCal(){
  const cal=document.getElementById('miniCal');
  const today=new Date();
  const start=new Date(today.getFullYear(),today.getMonth(),1);
  const dow=(start.getDay()+6)%7;
  const days=new Date(today.getFullYear(),today.getMonth()+1,0).getDate();
  let html='';
  for(let i=0;i<dow;i++)html+='<div class="cal-cell"></div>';
  for(let d=1;d<=days;d++){
    const key=`${today.getFullYear()}-${today.getMonth()+1}-${d}`;
    const cls=d===today.getDate()?'today':S.activityLog[key]?'done':'';
    html+=`<div class="cal-cell ${cls}">${d}</div>`;
  }
  cal.innerHTML=html;
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
function renderKanaGrid(type){
  const data=type==='hiragana'?HIRAGANA:KATAKANA;
  const grid=document.getElementById(type+'-grid');
  grid.innerHTML=data.map(g=>`
    <div class="kana-group">${g.group}</div>
    ${g.chars.map(c=>`<div class="kana-card"><div class="kana-jp">${c.jp}</div><div class="kana-rom">${c.r}</div></div>`).join('')}
  `).join('');
}
function renderVocab(cat='all'){
  const data=(VOCAB[S.level]||[]).filter(v=>cat==='all'||v.cat===cat);
  const cats=[...new Set((VOCAB[S.level]||[]).map(v=>v.cat))];
  document.getElementById('vocabFilterBar').innerHTML=
    ['all',...cats].map(c=>`<button class="filter-chip${c===cat?' on':''}" onclick="renderVocab('${c}')">${c.charAt(0).toUpperCase()+c.slice(1)}</button>`).join('');
  document.getElementById('vocabGrid').innerHTML=data.map(v=>`
    <div class="vocab-card" onclick="this.classList.toggle('expanded')">
      <div class="vc-jp">${v.jp}</div>
      <div class="vc-read">${v.r}</div>
      <div class="vc-en">${v.en}</div>
      <span class="vc-cat">${v.cat}</span>
      <div class="vc-example"><div style="font-family:'Noto Sans JP',sans-serif">${v.ex}</div><div style="color:var(--teal);margin-top:3px">${v.exEn}</div></div>
    </div>`).join('');
}
function renderGrammar(){
  const data=GRAMMAR[S.level]||[];
  document.getElementById('grammarList').innerHTML=data.map(g=>`
    <div class="gram-card" onclick="this.classList.toggle('open')">
      <div style="display:flex;justify-content:space-between;align-items:start">
        <div><div class="gram-pattern">${g.pattern}</div><div class="gram-meaning">${g.meaning}</div></div>
        <span class="gram-tag">${g.tag}</span>
      </div>
      <div class="gram-body">
        <div class="gram-explanation">${g.explanation}</div>
        ${g.examples.map(e=>`<div class="gram-example"><div class="gram-ex-jp">${e.jp}</div><div class="gram-ex-read">${e.r}</div><div class="gram-ex-en">${e.en}</div></div>`).join('')}
        ${g.notes?`<div class="gram-notes">💡 ${g.notes}</div>`:''}
      </div>
    </div>`).join('');
}
function renderKanji(cat='all'){
  const data=(KANJI[S.level]||[]).filter(k=>cat==='all'||k.cat===cat);
  const cats=[...new Set((KANJI[S.level]||[]).map(k=>k.cat))];
  document.getElementById('kanjiFilterBar').innerHTML=
    ['all',...cats].map(c=>`<button class="filter-chip${c===cat?' on':''}" onclick="renderKanji('${c}')">${c.charAt(0).toUpperCase()+c.slice(1)}</button>`).join('');
  document.getElementById('kanjiGrid').innerHTML=data.map(k=>{
    const key=k.k+'_'+S.level;const learned=S.learnedKanji[key];
    return`<div class="kanji-card${learned?' learned':''}" onclick="toggleKanji('${key}',this,'${k.en}')"><div class="kanji-ch">${k.k}</div><div class="kanji-on">${k.on}</div><div class="kanji-en">${k.en}</div></div>`;
  }).join('');
}
async function toggleKanji(key,el,name){
  S.learnedKanji[key]=!S.learnedKanji[key];
  el.classList.toggle('learned');
  S.progress.learnedKanji=S.learnedKanji;
  markActivity();
  await api('PATCH','/api/state',{progress:S.progress,streak:S.streak,lastStudied:S.lastStudied,activityLog:S.activityLog});
  if(S.learnedKanji[key])toast('Kanji learned! ✓ '+name);
  else toast('Unmarked');
}

// ── PRACTICE ──
let practiceState={};
function practiceTab(type,btn){
  document.querySelectorAll('.learn-tabs .tab-btn').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
  renderPractice(type);
}
function renderPractice(type){
  practiceState.type=type;
  if(type==='flashcard'){renderFlashcard();return;}
  if(type==='kana'){renderKanaQuiz();return;}
  if(type==='listening'){renderListening();return;}
  let pool=[];
  if(type==='vocab')pool=QUICK_PRACTICE.vocab;
  else if(type==='grammar')pool=QUICK_PRACTICE.grammar;
  else if(type==='kanji'){
    const kj=KANJI[S.level]||[];
    pool=kj.map(k=>({q:`この　かんじの　いみは？「${k.k}」`,opts:shuffleWith(k.en,['person','school','water','time','go','eat','big','new']),ans:0,cat:'Kanji',_ans:k.en}));
    pool=pool.slice(0,10).map(q=>{
      const correct=q._ans;const wrong=q.opts.filter(o=>o!==correct).slice(0,3);
      const opts=[correct,...wrong].sort(()=>Math.random()-.5);
      return{...q,opts,ans:opts.indexOf(correct)};
    });
  }
  practiceState.pool=shuffle(pool).slice(0,10);
  practiceState.idx=0;practiceState.correct=0;practiceState.answered=false;
  renderQuizCard();
}
function shuffleWith(target,others){return shuffle([target,...others.filter(o=>o!==target).slice(0,3)]);}
function shuffle(arr){return[...arr].sort(()=>Math.random()-.5);}

function renderQuizCard(){
  const {pool,idx}=practiceState;
  if(idx>=pool.length){renderQuizResult();return;}
  const q=pool[idx];
  const pct=Math.round(idx/pool.length*100);
  document.getElementById('practice-area').innerHTML=`
    <div class="quiz-wrap">
      <div class="quiz-progress">Question ${idx+1} of ${pool.length} · ✓ ${practiceState.correct}</div>
      <div class="quiz-prog-bar"><div class="quiz-prog-fill" style="width:${pct}%"></div></div>
      <div class="quiz-card">
        <div class="quiz-question">${q.q.includes('（　）')||q.q.length<20?`<div class="quiz-q-text">${q.q}</div>`:q.q.split('\n').map((l,i)=>i===0?`<div style="font-size:15px;margin-bottom:16px">${l}</div>`:`<div class="quiz-q-text">${l}</div>`).join('')}</div>
        <div class="quiz-options" id="quizOpts">
          ${q.opts.map((o,i)=>`<button class="quiz-opt" onclick="checkAnswer(${i})">${o}</button>`).join('')}
        </div>
        <div class="quiz-feedback" id="quizFeedback"></div>
        <button class="quiz-next-btn" id="quizNext" style="display:none" onclick="nextQuestion()">Next →</button>
      </div>
    </div>`;
}
function checkAnswer(idx){
  if(practiceState.answered)return;
  practiceState.answered=true;
  const q=practiceState.pool[practiceState.idx];
  const btns=document.querySelectorAll('.quiz-opt');
  btns.forEach(b=>b.disabled=true);
  const correct=idx===q.ans;
  btns[idx].classList.add(correct?'correct':'wrong');
  if(!correct)btns[q.ans].classList.add('correct');
  if(correct){practiceState.correct++;gainXP(10);}
  else{S.weakAreas[q.cat]=(S.weakAreas[q.cat]||0)+1;}
  const fb=document.getElementById('quizFeedback');
  fb.className='quiz-feedback show '+(correct?'ok':'bad');
  fb.innerHTML=correct?'✓ Correct! '+( q.exp||''):'✗ '+(q.exp||`Correct: ${q.opts[q.ans]}`);
  document.getElementById('quizNext').style.display='inline-block';
  markActivity();
}
function nextQuestion(){
  practiceState.idx++;practiceState.answered=false;renderQuizCard();
}
function renderQuizResult(){
  const {correct,pool}=practiceState;
  const pct=Math.round(correct/pool.length*100);
  document.getElementById('practice-area').innerHTML=`
    <div class="quiz-wrap"><div class="quiz-result-card">
      <div class="quiz-result-score" style="color:${pct>=70?'var(--green)':'var(--accent)'}">${pct}%</div>
      <div class="quiz-result-pct">${correct}/${pool.length} correct</div>
      <p style="color:var(--text2);margin-bottom:20px">${pct>=80?'Excellent! 素晴らしい！':pct>=60?'Good work! もう少し！':'Keep practicing! がんばれ！'}</p>
      <button class="btn-primary" onclick="renderPractice('${practiceState.type}')">Try Again</button>
    </div></div>`;
}

function speak(text){
  if(!window.speechSynthesis)return;
  speechSynthesis.cancel();
  const ut=new SpeechSynthesisUtterance(text);
  ut.lang='ja-JP';ut.rate=0.85;
  speechSynthesis.speak(ut);
}

function renderListening(){
  const resources = S.level === 'N5' ? [
    {title:"NHK News Web Easy",desc:"Simplified news with native audio. Best for N5 beginners.",icon:"📻",tag:"N5 Friendly",url:"https://www3.nhk.or.jp/news/easy/"},
    {title:"Japanese with Teppei",desc:"A clear, slow-paced podcast about daily life in Japan.",icon:"🎙️",tag:"Level: Easy",url:"https://nihongoconteppei.com/"},
    {title:"Let's Talk in Japanese",desc:"N5 specific episodes for absolute beginners.",icon:"🎧",tag:"N5 Podcast",url:"https://letstalkinjapanese.jp/topic/n5/"},
    {title:"JapanesePod101 (N5)",desc:"Basic conversation lessons for JLPT N5.",icon:"📺",tag:"N5 Lessons",url:"https://www.youtube.com/playlist?list=PLB56E5A0B1A0A01E2"}
  ] : [
    {title:"NHK News Web Easy",desc:"Continue with simplified news but focus on reading and listening without furigana.",icon:"📻",tag:"N4 Practice",url:"https://www3.nhk.or.jp/news/easy/"},
    {title:"Listen with Teppei (N4)",desc:"Slightly faster natural conversations for pre-intermediate learners.",icon:"🎙️",tag:"N4 Natural",url:"https://nihongoconteppei.com/category/n4/"},
    {title:"Miku Real Japanese",desc:"Excellent N4 level natural listening practice with grammar focus.",icon:"🎧",tag:"N4 Focused",url:"https://www.youtube.com/c/MikuRealJapanese"},
    {title:"JapanesePod101 (N4)",desc:"N4 Grammar and Vocabulary through context.",icon:"📺",tag:"N4 Mastery",url:"https://www.youtube.com/playlist?list=PLB56E5A0B1A0A01E2"}
  ];

  const samples = S.level === 'N5' ? [
    {q:"こんにちは、お元気ですか？",en:"Hello, how are you?"},
    {q:"明日は　どこへ　行きますか？",en:"Where are you going tomorrow?"},
    {q:"日本語は　とても　面白いです。",en:"Japanese is very interesting."},
    {q:"すみません、トイレはどこですか？",en:"Excuse me, where is the toilet?"}
  ] : [
    {q:"日本に行ったことがありますか？",en:"Have you ever been to Japan?"},
    {q:"今日は雨が降るかもしれません。",en:"It might rain today."},
    {q:"私は　日本料理を　作ることができます。",en:"I can cook Japanese food."},
    {q:"もっと　ゆっくり　話していただけませんか？",en:"Could you please speak more slowly?"}
  ];

  document.getElementById('practice-area').innerHTML=`
    <div class="results-wrap">
      <div class="section-label" style="text-align:center;margin-bottom:20px">${S.level} Interactive Audio Samples (TTS)</div>
      ${samples.map(s=>`
        <div class="audio-player-card">
          <button class="audio-btn" onclick="speak('${s.q}')">▶</button>
          <div class="audio-info"><div class="audio-q">${s.q}</div><div class="audio-sub">${s.en}</div></div>
        </div>`).join('')}
      <div class="section-label" style="text-align:center;margin:32px 0 20px">${S.level} Curated Listening Resources</div>
      <div class="listening-grid">
        ${resources.map(r=>`
          <a href="${r.url}" target="_blank" class="listen-card">
            <div class="listen-icon">${r.icon}</div>
            <div class="listen-title">${r.title}</div>
            <div class="listen-tag">${r.tag}</div>
            <p class="listen-desc">${r.desc}</p>
            <div style="font-size:11px;color:var(--teal);font-weight:600">Open Resource →</div>
          </a>`).join('')}
      </div>
    </div>`;
}

function renderKanaQuiz(){
  const allKana=[...HIRAGANA,...KATAKANA].flatMap(g=>g.chars.map(c=>({...c,group:g.group})));
  const pool=shuffle(allKana).slice(0,10).map(c=>{
    const wrong=shuffle(allKana.filter(k=>k.r!==c.r)).slice(0,3).map(k=>k.r);
    const opts=shuffle([c.r,...wrong]);
    return{q:c.jp,opts,ans:opts.indexOf(c.r),cat:'Writing',exp:`${c.jp} = ${c.r}`};
  });
  practiceState.pool=pool;practiceState.idx=0;practiceState.correct=0;practiceState.answered=false;
  document.getElementById('practice-area').innerHTML=`<div class="quiz-wrap" id="kanaQuizWrap"></div>`;
  renderKanaQ();
}
function renderKanaQ(){
  const {pool,idx}=practiceState;
  if(idx>=pool.length){
    const pct=Math.round(practiceState.correct/pool.length*100);
    document.querySelector('#kanaQuizWrap').innerHTML=`<div class="quiz-result-card"><div class="quiz-result-score" style="color:var(--teal)">${pct}%</div><div class="quiz-result-pct">${practiceState.correct}/${pool.length}</div><button class="btn-primary" style="margin-top:16px" onclick="renderKanaQuiz()">Again</button></div>`;
    return;
  }
  const q=pool[idx];
  document.querySelector('#kanaQuizWrap').innerHTML=`
    <div class="quiz-progress">Question ${idx+1}/${pool.length}</div>
    <div class="quiz-prog-bar"><div class="quiz-prog-fill" style="width:${idx/pool.length*100}%"></div></div>
    <div class="quiz-card">
      <div class="quiz-question" style="font-size:72px;font-family:'Noto Sans JP',sans-serif">${q.q}</div>
      <div class="quiz-hint">What is the reading of this character?</div>
      <div class="quiz-options">${q.opts.map((o,i)=>`<button class="quiz-opt" onclick="checkKana(${i})">${o}</button>`).join('')}</div>
      <div class="quiz-feedback" id="kanaFb"></div>
      <button class="quiz-next-btn" id="kanaNext" style="display:none" onclick="nextKana()">Next →</button>
    </div>`;
}
function checkKana(i){
  if(practiceState.answered)return;practiceState.answered=true;
  const q=practiceState.pool[practiceState.idx];
  document.querySelectorAll('.quiz-opt').forEach(b=>b.disabled=true);
  document.querySelectorAll('.quiz-opt')[i].classList.add(i===q.ans?'correct':'wrong');
  if(i!==q.ans)document.querySelectorAll('.quiz-opt')[q.ans].classList.add('correct');
  if(i===q.ans){practiceState.correct++;gainXP(5);}
  const fb=document.getElementById('kanaFb');
  fb.className='quiz-feedback show '+(i===q.ans?'ok':'bad');
  fb.textContent=i===q.ans?'✓ Correct!':'✗ '+q.exp;
  document.getElementById('kanaNext').style.display='inline-block';
}
function nextKana(){practiceState.idx++;practiceState.answered=false;renderKanaQ();}

function renderFlashcard(){
  const data=VOCAB[S.level]||[];
  const pool=shuffle(data);
  let idx=0;let known=0;
  const render=()=>{
    if(idx>=pool.length){
      document.getElementById('practice-area').innerHTML=`<div class="quiz-wrap"><div class="quiz-result-card"><div class="quiz-result-score" style="color:var(--teal)">${Math.round(known/pool.length*100)}%</div><div class="quiz-result-pct">${known}/${pool.length} known</div><button class="btn-primary" style="margin-top:16px" onclick="renderPractice('flashcard')">Again</button></div></div>`;
      return;
    }
    const c=pool[idx];
    document.getElementById('practice-area').innerHTML=`
      <div class="flashcard-wrap">
        <div style="text-align:center;font-size:13px;color:var(--text2);margin-bottom:12px">Card ${idx+1}/${pool.length} · Known: ${known}</div>
        <div class="flashcard" id="fc" onclick="document.getElementById('fc').classList.toggle('flipped')">
          <div class="fc-inner">
            <div class="fc-front"><div style="font-size:52px;font-family:'Noto Sans JP',sans-serif">${c.jp}</div><div style="font-size:13px;color:rgba(255,255,255,.5);margin-top:8px">tap to reveal</div></div>
            <div class="fc-back"><div class="fc-back-content"><div class="fc-answer">${c.r}</div><div class="fc-reading">${c.en}</div></div></div>
          </div>
        </div>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:4px">
          <button class="btn-secondary" onclick="idx++;render()">Skip</button>
          <button style="padding:11px 24px;border-radius:999px;background:rgba(233,69,96,.15);color:var(--accent);border:1px solid rgba(233,69,96,.3);cursor:pointer" onclick="idx++; render()">Again</button>
          <button class="btn-primary" onclick="known++;gainXP(5);idx++;render()">Know it ✓</button>
        </div>
      </div>`;
  };
  // need to expose render to outer scope
  window._fcRender=render;render();
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
  const result={title:set.title,score,correct,total:qs.length,weakAreas:Object.keys(weak),timestamp:new Date().toISOString()};
  S.testResults.unshift(result);
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

// ── LIVE EXAM ──
function renderExamLobby(){
  const times={N5:'105',N4:'120'};
  document.getElementById('examTimeLabel').textContent=times[S.level]+' min';
  document.getElementById('exam-lobby').style.display='';
  document.getElementById('exam-active').style.display='none';
  document.getElementById('exam-results').style.display='none';
}
function startLiveExam(){
  const set=EXAM_SETS.find(s=>s.level===S.level)||EXAM_SETS[0];
  if(!set){toast('No exam available for '+S.level);return;}
  const allQs=shuffle(set.questions).map((q,i)=>({...q,id:i}));
  S.currentExam={questions:allQs,answers:{},current:0,total:allQs.length,startTime:Date.now()};
  const mins=S.level==='N4'?120:105;
  S.currentExam.totalSeconds=mins*60;
  S.currentExam.secondsLeft=mins*60;
  document.getElementById('exam-lobby').style.display='none';
  document.getElementById('exam-active').style.display='';
  renderExamQuestion();
  startExamTimer();
}
function renderExamQuestion(){
  const ex=S.currentExam;
  const q=ex.questions[ex.current];
  const pct=Math.round(ex.current/ex.total*100);
  document.getElementById('examQNum').textContent=`Q ${ex.current+1}/${ex.total}`;
  document.getElementById('examProgFill').style.width=pct+'%';
  document.getElementById('examBody').innerHTML=`
    <div class="exam-q-card">
      <div class="exam-q-num">Question ${ex.current+1}</div>
      <div class="exam-q-section">${q.section}</div>
      <div class="exam-q-text">${q.q.replace(/\n/g,'<br>')}</div>
      <div class="exam-opts">
        ${q.opts.map((o,i)=>`<button class="exam-opt${ex.answers[ex.current]===i?' selected':''}" onclick="selectExamAnswer(${i})">${String.fromCharCode(65+i)}. ${o}</button>`).join('')}
      </div>
    </div>
    <div class="exam-nav">
      <button class="btn-secondary" onclick="S.currentExam.current--;renderExamQuestion()" ${ex.current===0?'disabled':''}>← Prev</button>
      <button class="btn-primary" onclick="${ex.current===ex.total-1?'submitExam(true)':'S.currentExam.current++;renderExamQuestion()'}">${ex.current===ex.total-1?'Submit Exam':'Next →'}</button>
    </div>`;
}
function selectExamAnswer(i){
  S.currentExam.answers[S.currentExam.current]=i;
  document.querySelectorAll('.exam-opt').forEach((b,bi)=>b.classList.toggle('selected',bi===i));
}
function startExamTimer(){
  if(S.examTimer)clearInterval(S.examTimer);
  S.examTimer=setInterval(()=>{
    S.currentExam.secondsLeft--;
    const {secondsLeft}=S.currentExam;
    const h=Math.floor(secondsLeft/3600);
    const m=Math.floor((secondsLeft%3600)/60);
    const s=secondsLeft%60;
    const display=`${h?h+':':''}${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    document.getElementById('examTimerDisplay').textContent=display;
    if(secondsLeft<=300)document.getElementById('examTimerDisplay').style.color='var(--accent)';
    if(secondsLeft<=0)submitExam(false);
  },1000);
}
function submitExam(manual){
  if(S.examTimer){clearInterval(S.examTimer);S.examTimer=null;}
  const ex=S.currentExam;
  const qs=ex.questions;
  let correct=0;const weak={};const details=[];
  qs.forEach((q,i)=>{
    const right=ex.answers[i]===q.ans;
    if(right)correct++;else{weak[q.section]=(weak[q.section]||0)+1;}
    details.push({q:q.q,opts:q.opts,userAns:ex.answers[i],correct:q.ans,right,exp:q.exp||''});
  });
  const score=Math.round(correct/qs.length*100);
  const timeTaken=Math.round((Date.now()-ex.startTime)/1000);
  const result={title:`${S.level} Live Exam`,score,correct,total:qs.length,weakAreas:Object.keys(weak),timeTaken,timestamp:new Date().toISOString()};
  S.testResults.unshift(result);
  Object.keys(weak).forEach(k=>{S.weakAreas[k]=(S.weakAreas[k]||0)+weak[k];});
  api('PATCH','/api/state',{testResults:S.testResults,weakAreas:S.weakAreas});
  gainXP(score*3);
  document.getElementById('exam-active').style.display='none';
  document.getElementById('exam-results').style.display='';
  const pass=score>=60;
  const suggestions={Vocabulary:'Review vocabulary with flashcards daily.',Grammar:'Practice grammar patterns with テ-form exercises.',Reading:'Read NHK Easy Japanese and practice comprehension.',Kanji:'Use spaced repetition for kanji memorization.'};
  document.getElementById('exam-results').innerHTML=`
    <div class="results-wrap">
      <div class="results-header">
        <div class="results-score" style="color:${pass?'var(--green)':'var(--accent)'}">${score}%</div>
        <div style="color:var(--text2)">${correct}/${qs.length} Correct · ${Math.round(timeTaken/60)} min taken</div>
        <span class="results-pass ${pass?'pass':'fail'}">${pass?'✓ PASS — おめでとうございます！':'✗ Not Passing Yet — がんばれ！'}</span>
        <p style="color:var(--text2);font-size:14px;margin-top:12px">${score>=80?'Excellent! You are ready for the real JLPT!':score>=60?'Passing score. Keep up the good work!':'More practice needed. Focus on your weak areas.'}</p>
      </div>
      <div class="results-breakdown">
        ${['Vocabulary','Grammar','Reading'].map(sec=>{
          const qsSec=qs.filter(q=>q.section===sec);
          const corSec=qsSec.filter((q,i)=>ex.answers[qs.indexOf(q)]===q.ans).length;
          const pct=qsSec.length?Math.round(corSec/qsSec.length*100):0;
          return`<div class="rb-card"><div class="rb-num" style="color:${pct>=60?'var(--green)':'var(--accent)'}">${pct}%</div><div class="rb-label">${sec}</div></div>`;
        }).join('')}
      </div>
      ${Object.keys(weak).length?`<div class="weak-panel"><h3>🎯 AI Recommendations</h3>${Object.keys(weak).map(k=>`<div class="suggestion"><span class="sug-icon">💡</span><div><strong>${k}</strong><br>${suggestions[k]||'Review this section.'}</div></div>`).join('')}</div>`:''}
      <h3 class="section-label">Question Review</h3>
      ${details.map((d,i)=>`<div class="result-item"><span class="ri-status">${d.right?'✅':'❌'}</span><div class="ri-q"><div class="ri-q-text">${d.q.replace(/\n/g,'<br>')}</div><div class="ri-answers">Your: <span class="${d.right?'ri-correct':'ri-wrong'}">${d.opts[d.userAns]??'—'}</span> | Correct: <span class="ri-correct">${d.opts[d.correct]}</span>${d.exp?` · ${d.exp}`:''}</div></div></div>`).join('')}
      <div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap">
        <button class="btn-primary" onclick="renderExamLobby()">Try Again</button>
        <button class="btn-secondary" onclick="goto('dashboard')">Dashboard</button>
      </div>
    </div>`;
}

// ── STUDY TIMER ──
function renderStudyTimer(){
  const h=Math.floor(S.timerSeconds/3600);
  const m=Math.floor((S.timerSeconds%3600)/60);
  const s=S.timerSeconds%60;
  document.getElementById('ftTime').textContent=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  document.getElementById('ftBtn').textContent=S.timerRunning?'⏸':'▶';
}
function timerToggle(){
  if(S.timerRunning){
    clearInterval(S.timerInterval);S.timerInterval=null;S.timerRunning=false;
    api('POST','/api/study-time',{seconds:S.timerSeconds});
    S.studyTimeSeconds+=S.timerSeconds;S.timerSeconds=0;
  }else{
    S.timerRunning=true;
    S.timerInterval=setInterval(()=>{S.timerSeconds++;renderStudyTimer();},1000);
  }
  renderStudyTimer();
}
function timerReset(){
  clearInterval(S.timerInterval);S.timerInterval=null;S.timerRunning=false;
  S.timerSeconds=0;renderStudyTimer();
}

// ── XP & ACTIVITY ──
function gainXP(amount){
  S.xp+=amount;
  const xpEl=document.getElementById('sideXP'); if(xpEl)xpEl.textContent=S.xp;
  const xpFill=document.getElementById('xpFill'); if(xpFill)xpFill.style.width=Math.min(100,(S.xp%500)/5)+'%';
  const sfFlash=document.getElementById('statFlash'); if(sfFlash)sfFlash.textContent=S.xp;
  api('PATCH','/api/state',{xp:S.xp});
}
function markActivity(){
  const now=new Date();
  const key=`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
  S.activityLog[key]=true;
  const yDate=new Date(now);yDate.setDate(yDate.getDate()-1);
  const yKey=`${yDate.getFullYear()}-${yDate.getMonth()+1}-${yDate.getDate()}`;
  if(!S.lastStudied)S.streak=1;
  else if(S.lastStudied===yKey)S.streak++;
  else if(S.lastStudied!==key)S.streak=1;
  S.lastStudied=key;
  
  const streakEl=document.getElementById('sideStreak'); if(streakEl)streakEl.textContent=S.streak;
  const snEl=document.getElementById('streakNum'); if(snEl)snEl.textContent=S.streak;
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
      <button class="mob-nav-btn active" onclick="goto('dashboard',null);setMobActive(this)"><span>⊞</span><span>Home</span></button>
      <button class="mob-nav-btn" onclick="goto('learn',null);setMobActive(this)"><span>📖</span><span>Learn</span></button>
      <button class="mob-nav-btn" onclick="goto('practice',null);setMobActive(this)"><span>✏️</span><span>Practice</span></button>
      <button class="mob-nav-btn" onclick="goto('test',null);setMobActive(this)"><span>📝</span><span>Tests</span></button>
      <button class="mob-nav-btn" onclick="goto('exam',null);setMobActive(this)"><span>⏱</span><span>Exam</span></button>
    </nav>`);
}
function setMobActive(el){
  document.querySelectorAll('.mob-nav-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
}

// ── MODAL ──
function closeModal(){document.getElementById('modalOverlay').classList.remove('open');}

// ── TRACKER PAGE ──
function renderTracker(){
  const vocab=VOCAB[S.level]||[];
  const grammar=GRAMMAR[S.level]||[];
  const kanji=KANJI[S.level]||[];
  const tests=EXAM_SETS.filter(s=>s.level===S.level);
  
  const vDone=Object.keys(S.progress).filter(k=>k.startsWith('voc-')&&S.progress[k]&&k.endsWith('_'+S.level)).length;
  const gDone=Object.keys(S.progress).filter(k=>k.startsWith('gram-')&&S.progress[k]&&k.endsWith('_'+S.level)).length;
  const kDone=Object.keys(S.learnedKanji).filter(k=>k.endsWith('_'+S.level)&&S.learnedKanji[k]).length;
  const tDone=S.testResults.filter(r=>r.level===S.level||r.title.includes(S.level)).length;

  document.getElementById('tpVocNum').textContent=`${vDone}/${vocab.length}`;
  document.getElementById('tpVocBar').style.width=vocab.length?Math.min(100,(vDone/vocab.length)*100)+'%':'0%';
  document.getElementById('tpVocPct').textContent=vocab.length?Math.round((vDone/vocab.length)*100)+'%':'0%';

  document.getElementById('tpGramNum').textContent=`${gDone}/${grammar.length}`;
  document.getElementById('tpGramBar').style.width=grammar.length?Math.min(100,(gDone/grammar.length)*100)+'%':'0%';
  document.getElementById('tpGramPct').textContent=grammar.length?Math.round((gDone/grammar.length)*100)+'%':'0%';

  document.getElementById('tpKanjiNum').textContent=`${kDone}/${kanji.length}`;
  document.getElementById('tpKanjiBar').style.width=kanji.length?Math.min(100,(kDone/kanji.length)*100)+'%':'0%';
  document.getElementById('tpKanjiPct').textContent=kanji.length?Math.round((kDone/kanji.length)*100)+'%':'0%';

  document.getElementById('tpTestNum').textContent=`${tDone}/${tests.length}`;
  document.getElementById('tpTestBar').style.width=tests.length?Math.min(100,(tDone/tests.length)*100)+'%':'0%';
  document.getElementById('tpTestPct').textContent=tests.length?Math.round((tDone/tests.length)*100)+'%':'0%';

  renderChecklist();
}

function renderChecklist(){
  // preserve open state
  const openIds = Array.from(document.querySelectorAll('.cl-section.open')).map(el => el.id);

  const n5Phases=[
    {id:'p0',name:'Writing Systems',badge:'Phase 0',items:[
      {id:'w1',text:'Memorize Hiragana chart (46)',pts:20},
      {id:'w2',text:'Practice writing Hiragana daily',pts:20},
      {id:'w3',text:'Memorize Katakana chart (46)',pts:20},
      {id:'w4',text:'Write Katakana names & words',pts:20},
    ]},
    {id:'p1',name:'Vocabulary milestones',badge:'Phase 1',items:[
      {id:'v1',text:'Numbers 1-10,000 & counters',pts:10},
      {id:'v2',text:'Greetings & daily phrases (20)',pts:10},
      {id:'v3',text:'Family, body, food, places',pts:15},
      {id:'v4',text:'Core verbs (top 20 words)',pts:15},
      {id:'v5',text:'Adjectives (top 20 words)',pts:15},
    ]},
    {id:'p2',name:'Grammar patterns',badge:'Phase 2',items:[
      {id:'g1',text:'Particles: は, が, を, に, へ',pts:20},
      {id:'g2',text:'Verb conjugation basics',pts:20},
      {id:'g3',text:'Negative and question forms',pts:20},
      {id:'g4',text:'Adjective conjugation',pts:20},
    ]},
    {id:'p3',name:'Kanji Mastery',badge:'Phase 3',items:[
      {id:'k1',text:'Identify 100 N5 Kanji',pts:40},
      {id:'k2',text:'Read Kanji compounds',pts:40},
      {id:'k3',text:'Write basic Kanji meanings',pts:40},
    ]}
  ];

  const n4Phases=[
    {id:'p1',name:'Advanced Vocab',badge:'Phase 1',items:[
      {id:'v1',text:'Memorize 500 N4 words',pts:30},
      {id:'v2',text:'Complex nouns & attributes',pts:30},
    ]},
    {id:'p2',name:'N4 Grammar',badge:'Phase 2',items:[
      {id:'g1',text:'Hearsay & conditionals (~rashii, ~tara)',pts:40},
      {id:'g2',text:'Expectations & results (~hazu, ~shimau)',pts:40},
      {id:'g3',text:'Formal Japanese (Honorifics)',pts:40},
    ]},
    {id:'p3',name:'N4 Kanji (300 total)',badge:'Phase 3',items:[
      {id:'k1',text:'Master 150+ new N4 Kanji',pts:50},
      {id:'k2',text:'Reading long passages',pts:50},
    ]}
  ];

  const phases = S.level === 'N5' ? n5Phases : n4Phases;

  const cont=document.getElementById('checklistContainer');
  cont.innerHTML=phases.map(p=>`
    <div class="cl-section ${openIds.includes('cl-'+p.id)?'open':''}" id="cl-${p.id}">
      <div class="cl-section-header" onclick="this.parentElement.classList.toggle('open')">
        <span class="cl-phase-badge">${p.badge}</span>
        <span class="cl-section-title">${p.name}</span>
        <span style="margin-left:auto">▽</span>
      </div>
      <div class="cl-body">
        ${p.items.map(item=>{
          const key=`cl-${S.level}-${item.id}`;
          const done=S.progress[key];
          return`<div class="cl-item ${done?'done':''}" onclick="toggleCheckItem('${key}',${item.pts})">
            <div class="cl-box">${done?'✓':''}</div>
            <div class="cl-text">${item.text}</div>
            <div class="cl-pts">+${item.pts}pt</div>
          </div>`;
        }).join('')}
      </div>
    </div>
  `).join('');
}

async function toggleCheckItem(key,pts){
  const wasDone = S.progress[key];
  S.progress[key]=!S.progress[key];
  if(!wasDone) gainXP(pts);
  
  // Check for phase bonus
  const n5Phases = [
    {num:0, keys:['cl-N5-w1','cl-N5-w2','cl-N5-w3','cl-N5-w4']},
    {num:1, keys:['cl-N5-v1','cl-N5-v2','cl-N5-v3','cl-N5-v4','cl-N5-v5']},
    {num:2, keys:['cl-N5-g1','cl-N5-g2','cl-N5-g3','cl-N5-g4']},
    {num:3, keys:['cl-N5-k1','cl-N5-k2','cl-N5-k3']}
  ];
  const n4Phases = [
    {num:1, keys:['cl-N4-v1','cl-N4-v2']},
    {num:2, keys:['cl-N4-g1','cl-N4-g2','cl-N4-g3']},
    {num:3, keys:['cl-N4-k1','cl-N4-k2']}
  ];
  const phases = S.level === 'N5' ? n5Phases : n4Phases;
  const currentPhase = phases.find(ph => ph.keys.includes(key));
  
  if (currentPhase && currentPhase.keys.every(k => S.progress[k]) && !wasDone) {
    gainXP(10);
    toast(`🌟 +10 for complete the phase!`, 'success');
  }

  markActivity();
  await api('PATCH','/api/state',{progress:S.progress,xp:S.xp,lastStudied:S.lastStudied,activityLog:S.activityLog});
  renderTracker();
  if(document.getElementById('page-dashboard').classList.contains('active')) renderDashboard();
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
  S.weakAreas={};
  toast('Resetting study data...');
  const res = await api('POST','/api/state/reset');
  if(res.success){
    setTimeout(()=>location.reload(), 1000);
  } else {
    toast('Error resetting data');
  }
}

// ── REMINDERS PAGE ──
function renderReminders(){
  const list=document.getElementById('remSlotsList');
  if(!reminders.length){
    // default set
    reminders=[
      {id:1,time:'07:00',label:'Morning flashcards',enabled:true},
      {id:2,time:'07:10',label:'New vocab / grammar',enabled:true},
      {id:3,time:'13:00',label:'Afternoon writing drill',enabled:false},
      {id:4,time:'21:00',label:'Evening review + quiz',enabled:true}
    ];
  }
  list.innerHTML=reminders.map(r=>`
    <div class="rem-slot">
      <div class="rem-slot-time">${r.time}</div>
      <div class="rem-slot-label">${r.label}</div>
      <label class="toggle">
        <input type="checkbox" ${r.enabled?'checked':''} onchange="toggleReminder(${r.id})">
        <span class="toggle-track"></span>
      </label>
    </div>
  `).join('');
}

async function addReminder(){
  const t=document.getElementById('remTimeInp').value;
  const l=document.getElementById('remLabelInp').value || 'Study Session';
  if(!t)return;
  const r={id:Date.now(),time:t,label:l,enabled:true};
  reminders.push(r);
  document.getElementById('remLabelInp').value='';
  await api('PATCH','/api/state',{reminders});
  renderReminders();
}

async function toggleReminder(id){
  const r=reminders.find(x=>x.id===id);
  if(r){
    r.enabled=!r.enabled;
    await api('PATCH','/api/state',{reminders});
    renderReminders();
  }
}

function enableNotifs(){
  if(!('Notification' in window))alert('This browser does not support notifications.');
  else if(Notification.permission==='granted')toast('Notifications already active!');
  else Notification.requestPermission().then(p=>{if(p==='granted')toast('Notifications enabled! 🔔');});
}

// ── START ──
init();
