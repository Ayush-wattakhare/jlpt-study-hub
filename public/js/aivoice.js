// ── AI VOICE CHATTING PRACTICE ENGINE ──
let aiVoiceState = {
  scenario: 'self_intro',
  autoSpeak: true,
  showTranslation: true,
  isListening: false,
  isSpeaking: false,
  recognition: null,
  messages: []
};

const SCENARIOS = {
  self_intro: {
    id: 'self_intro',
    title: '🌸 自我紹介 (Self Introduction)',
    desc: 'Practice introducing yourself, your job, hobbies, and origin in Japanese.',
    initial: {
      japanese: 'はじめまして！わたしはさくら先生（せんせい）です。おなまえは　なんですか？',
      romaji: 'Hajimemashite! Watashi wa Sakura-sensei desu. O-namae wa nan desu ka?',
      english: 'Nice to meet you! I am Sakura-sensei. What is your name?',
      suggestedReplies: [
        'はじめまして！わたしの名前はAyushです。',
        'わたしはインドから来ました。',
        '趣味はプログラミングと日本語です。'
      ]
    }
  },
  restaurant: {
    id: 'restaurant',
    title: '🍣 レストラン (Ordering Food)',
    desc: 'Practice ordering food, asking for recommendations, and paying the bill.',
    initial: {
      japanese: 'いらっしゃいませ！何名（なんめい）様（さま）ですか？お好きな席へどうぞ！',
      romaji: 'Irasshaimase! Nan-mei sama desu ka? O-suki na seki e douzo!',
      english: 'Welcome! How many people? Please take any seat you like!',
      suggestedReplies: [
        '一人（ひとり）です。メニューをください。',
        'おすすめの料理は何ですか？',
        'お水を二つお願いします。'
      ]
    }
  },
  directions: {
    id: 'directions',
    title: '✈️ 道案内 (Directions & Travel)',
    desc: 'Practice asking for directions to stations, hotels, and landmarks.',
    initial: {
      japanese: 'すみません、なにか　お探し（さがし）ですか？助け（たすけ）が必要（ひつよう）ですか？',
      romaji: 'Sumimasen, nanika o-sagashi desu ka? Tasuke ga hitsuyou desu ka?',
      english: 'Excuse me, are you looking for something? Do you need help?',
      suggestedReplies: [
        'すみません、駅（えき）はどこですか？',
        '東京タワーへはどう行けばいいですか？',
        '歩いてどのくらいかかりますか？'
      ]
    }
  },
  shopping: {
    id: 'shopping',
    title: '🛍️ 買い物 (Shopping in Tokyo)',
    desc: 'Practice asking prices, sizes, colors, and buying souvenirs.',
    initial: {
      japanese: 'いらっしゃいませ！こちらの服（ふく）や鞄（かばん）はいかがですか？',
      romaji: 'Irasshaimase! Kochira no fuku ya kaban wa ikaga desu ka?',
      english: 'Welcome! How about these clothes and bags?',
      suggestedReplies: [
        'これはいくらですか？',
        'もう少し小さいサイズはありますか？',
        'これを買います！カードで払えますか？'
      ]
    }
  },
  free_chat: {
    id: 'free_chat',
    title: '☕ フリートーク (Free Conversation)',
    desc: 'Chat freely about anything with your AI Japanese sensei.',
    initial: {
      japanese: 'こんにちは！今日はどんな一日（いちにち）でしたか？何でも話してくださいね！',
      romaji: 'Konnichiwa! Kyou wa donna ichinichi deshita ka? Nandemo hanashite kudasai ne!',
      english: 'Hello! How was your day today? Feel free to talk about anything!',
      suggestedReplies: [
        '今日はとても楽しかったです！',
        '日本語の勉強をがんばっています。',
        '日本へ旅行に行きたいです。'
      ]
    }
  }
};

// ── INIT AI VOICE CHAT ──
function initAiVoiceChat() {
  initSpeechRecognition();
  selectScenario('self_intro');
}

function selectScenario(scenId) {
  const scen = SCENARIOS[scenId] || SCENARIOS.self_intro;
  aiVoiceState.scenario = scenId;
  aiVoiceState.messages = [];

  // Update scenario chip buttons
  const container = document.getElementById('aiScenariosContainer');
  if (container) {
    container.innerHTML = Object.values(SCENARIOS).map(s => `
      <button class="scen-chip${s.id === scenId ? ' active' : ''}" onclick="selectScenario('${s.id}')">
        ${s.title}
      </button>
    `).join('');
  }

  // Clear thread and append initial Sensei greeting
  const thread = document.getElementById('aiChatThread');
  if (thread) thread.innerHTML = '';

  appendAiMessage(scen.initial);
}

function appendUserMessage(text) {
  aiVoiceState.messages.push({ sender: 'user', text });
  const thread = document.getElementById('aiChatThread');
  if (!thread) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-bubble user-bubble';
  msgDiv.innerHTML = `
    <div class="chat-sender">You (あなた)</div>
    <div class="chat-text">${escapeHtml(text)}</div>
  `;
  thread.appendChild(msgDiv);
  scrollToBottom();
}

function appendAiMessage(data) {
  aiVoiceState.messages.push({ sender: 'ai', data });
  const thread = document.getElementById('aiChatThread');
  if (!thread) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-bubble ai-bubble';

  const showTrans = aiVoiceState.showTranslation;

  msgDiv.innerHTML = `
    <div class="chat-sender-row">
      <div class="chat-sender-name">🌸 さくら先生 (Sakura-sensei)</div>
      <button class="chat-audio-btn" onclick="speakText('${escapeHtml(data.japanese)}')">🔊 Play Voice</button>
    </div>
    <div class="chat-text-jp">${data.japanese.replace(/\n/g, '<br>')}</div>
    
    ${showTrans && data.romaji ? `<div class="chat-text-romaji"><code>${escapeHtml(data.romaji)}</code></div>` : ''}
    ${showTrans && data.english ? `<div class="chat-text-en">${escapeHtml(data.english)}</div>` : ''}
    
    ${data.correction ? `
      <div class="chat-correction-box">
        <span class="cor-badge">💡 Sensei Correction Tip:</span>
        <div class="cor-text">${escapeHtml(data.correction)}</div>
      </div>
    ` : ''}

    ${data.suggestedReplies && data.suggestedReplies.length ? `
      <div class="chat-replies-wrap">
        <span class="replies-label">💬 Quick Reply Options:</span>
        <div class="replies-grid">
          ${data.suggestedReplies.map(r => `
            <button class="reply-chip" onclick="sendQuickReply('${escapeHtml(r)}')">${escapeHtml(r)}</button>
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;

  thread.appendChild(msgDiv);
  scrollToBottom();

  if (aiVoiceState.autoSpeak) {
    speakText(data.japanese);
  }
}

function scrollToBottom() {
  const thread = document.getElementById('aiChatThread');
  if (thread) thread.scrollTop = thread.scrollHeight;
}

// ── USER MESSAGE SUBMISSION ──
async function sendUserMessage() {
  const inputEl = document.getElementById('aiInputText');
  if (!inputEl) return;
  const text = inputEl.value.trim();
  if (!text) return;

  inputEl.value = '';
  appendUserMessage(text);
  updateStatus('brain', 'Thinking & Generating AI response...');

  try {
    const res = await api('POST', '/api/ai-chat', {
      message: text,
      level: S.level || 'N5',
      scenario: aiVoiceState.scenario,
      history: aiVoiceState.messages.slice(-6)
    });

    if (res.success && res.data) {
      appendAiMessage(res.data);
    } else {
      appendAiMessage({
        japanese: 'すみません、もう一度言ってください。',
        romaji: 'Sumimasen, mou ichido itte kudasai.',
        english: 'Sorry, please say that again.',
        suggestedReplies: ['はい、分かりました。', 'もう一度言います。']
      });
    }
  } catch (e) {
    console.error('AI chat error:', e);
    toast('Error communicating with AI sensei');
  } finally {
    updateStatus('idle', 'Ready to practice!');
  }
}

function sendQuickReply(text) {
  const inputEl = document.getElementById('aiInputText');
  if (inputEl) inputEl.value = text;
  sendUserMessage();
}

// ── SPEECH RECOGNITION (Voice Input) ──
function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn('Speech Recognition not supported in this browser.');
    const micBtn = document.getElementById('aiMicBtn');
    if (micBtn) {
      micBtn.title = 'Speech Recognition requires Chrome/Edge/Safari';
    }
    return;
  }

  const rec = new SpeechRecognition();
  rec.lang = 'ja-JP'; // Primary Japanese, handles voice input
  rec.interimResults = true;
  rec.maxAlternatives = 1;

  rec.onstart = () => {
    aiVoiceState.isListening = true;
    updateMicButtonUI(true);
    updateStatus('mic', '🎙️ Listening to your Japanese voice...');
  };

  rec.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    const inputEl = document.getElementById('aiInputText');
    if (inputEl) inputEl.value = transcript;
  };

  rec.onerror = (event) => {
    console.warn('Speech recognition error:', event.error);
    aiVoiceState.isListening = false;
    updateMicButtonUI(false);
    updateStatus('idle', 'Mic idle. Click mic to speak!');
    if (event.error === 'no-speech') {
      toast('No voice detected. Please try again.');
    }
  };

  rec.onend = () => {
    aiVoiceState.isListening = false;
    updateMicButtonUI(false);
    updateStatus('idle', 'Voice captured! Sending message...');
    
    // Auto send if input has text
    const inputEl = document.getElementById('aiInputText');
    if (inputEl && inputEl.value.trim()) {
      sendUserMessage();
    }
  };

  aiVoiceState.recognition = rec;
}

function toggleMicListening() {
  if (!aiVoiceState.recognition) {
    toast('Voice recognition is supported in Chrome, Edge, Safari & Android.');
    return;
  }

  if (aiVoiceState.isListening) {
    aiVoiceState.recognition.stop();
  } else {
    // Stop TTS if speaking
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    try {
      aiVoiceState.recognition.start();
    } catch(e) {
      console.warn('Rec start err:', e);
    }
  }
}

function updateMicButtonUI(isListening) {
  const btn = document.getElementById('aiMicBtn');
  if (!btn) return;
  if (isListening) {
    btn.classList.add('listening');
    btn.innerHTML = '🎙️ <span>Listening... (Tap to Stop)</span>';
  } else {
    btn.classList.remove('listening');
    btn.innerHTML = '🎙️ <span>Tap to Speak Japanese</span>';
  }
}

// ── SPEECH SYNTHESIS (Voice Output) ──
function speakText(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  // Strip HTML or markdown tags if present
  const cleanText = text.replace(/<[^>]*>/g, '').replace(/（[^）]*）/g, '');

  const u = new SpeechSynthesisUtterance(cleanText);
  u.lang = 'ja-JP';
  u.rate = 0.85; // Slightly slower clear pace for N5/N4 learners

  u.onstart = () => updateStatus('speaker', '🔊 Sakura-sensei is speaking...');
  u.onend = () => updateStatus('idle', 'Ready to practice!');
  u.onerror = () => updateStatus('idle', 'Ready to practice!');

  window.speechSynthesis.speak(u);
}

function toggleAutoSpeak() {
  aiVoiceState.autoSpeak = !aiVoiceState.autoSpeak;
  const btn = document.getElementById('autoSpeakToggle');
  if (btn) {
    btn.classList.toggle('on', aiVoiceState.autoSpeak);
    btn.textContent = aiVoiceState.autoSpeak ? '🔊 Voice On' : '🔇 Voice Off';
  }
  toast(aiVoiceState.autoSpeak ? 'Auto voice responses enabled' : 'Voice muted');
}

function toggleTranslationView() {
  aiVoiceState.showTranslation = !aiVoiceState.showTranslation;
  const btn = document.getElementById('transToggle');
  if (btn) {
    btn.classList.toggle('on', aiVoiceState.showTranslation);
    btn.textContent = aiVoiceState.showTranslation ? '🌐 English & Romaji On' : '🎌 Japanese Only';
  }
  // Re-render current chat thread
  const thread = document.getElementById('aiChatThread');
  if (thread) {
    const curMsgs = [...aiVoiceState.messages];
    thread.innerHTML = '';
    aiVoiceState.messages = [];
    curMsgs.forEach(m => {
      if (m.sender === 'user') appendUserMessage(m.text);
      else appendAiMessage(m.data);
    });
  }
}

function updateStatus(type, msg) {
  const badge = document.getElementById('aiStatusBadge');
  if (!badge) return;
  badge.textContent = msg;

  if (type === 'mic') {
    badge.style.background = 'var(--red-soft)';
    badge.style.color = 'var(--red)';
  } else if (type === 'speaker') {
    badge.style.background = 'var(--teal-soft)';
    badge.style.color = 'var(--teal)';
  } else if (type === 'brain') {
    badge.style.background = 'var(--indigo-soft)';
    badge.style.color = 'var(--indigo)';
  } else {
    badge.style.background = 'var(--surface)';
    badge.style.color = 'var(--muted)';
  }
}

function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
