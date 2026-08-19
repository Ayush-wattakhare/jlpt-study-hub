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

// Preload voices for SpeechSynthesis
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    getJapaneseVoice();
  };
}

// ── INIT AI VOICE CHAT ──
function initAiVoiceChat() {
  initSpeechRecognition();
  selectScenario(aiVoiceState.scenario || 'self_intro');
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
  const msgObj = { sender: 'user', text };
  aiVoiceState.messages.push(msgObj);
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
  const msgIdx = aiVoiceState.messages.length;
  aiVoiceState.messages.push({ sender: 'ai', data });
  const thread = document.getElementById('aiChatThread');
  if (!thread) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-bubble ai-bubble';

  const showTrans = aiVoiceState.showTranslation;

  let repliesHtml = '';
  if (data.suggestedReplies && data.suggestedReplies.length) {
    repliesHtml = `
      <div class="chat-replies-wrap">
        <span class="replies-label">💬 Quick Reply Options:</span>
        <div class="replies-grid">
          ${data.suggestedReplies.map((r, rIdx) => `
            <button class="reply-chip" onclick="sendQuickReplyByIndex(${msgIdx}, ${rIdx})">${escapeHtml(r)}</button>
          `).join('')}
        </div>
      </div>
    `;
  }

  msgDiv.innerHTML = `
    <div class="chat-sender-row">
      <div class="chat-sender-name">🌸 さくら先生 (Sakura-sensei)</div>
      <button class="chat-audio-btn" onclick="playAiMessageAudio(${msgIdx})">🔊 Play Voice</button>
    </div>
    <div class="chat-text-jp">${data.japanese ? data.japanese.replace(/\n/g, '<br>') : ''}</div>
    
    ${showTrans && data.romaji ? `<div class="chat-text-romaji"><code>${escapeHtml(data.romaji)}</code></div>` : ''}
    ${showTrans && data.english ? `<div class="chat-text-en">${escapeHtml(data.english)}</div>` : ''}
    
    ${data.correction ? `
      <div class="chat-correction-box">
        <span class="cor-badge">💡 Sensei Correction Tip:</span>
        <div class="cor-text">${escapeHtml(data.correction)}</div>
      </div>
    ` : ''}

    ${repliesHtml}
  `;

  thread.appendChild(msgDiv);
  scrollToBottom();

  if (aiVoiceState.autoSpeak && data.japanese) {
    speakText(data.japanese);
  }
}

function playAiMessageAudio(idx) {
  const msg = aiVoiceState.messages[idx];
  if (msg && msg.data && msg.data.japanese) {
    speakText(msg.data.japanese);
  }
}

function sendQuickReplyByIndex(msgIdx, replyIdx) {
  const msg = aiVoiceState.messages[msgIdx];
  if (msg && msg.data && msg.data.suggestedReplies && msg.data.suggestedReplies[replyIdx]) {
    const replyText = msg.data.suggestedReplies[replyIdx];
    const inputEl = document.getElementById('aiInputText');
    if (inputEl) inputEl.value = replyText;
    sendUserMessage();
  }
}

function scrollToBottom() {
  const thread = document.getElementById('aiChatThread');
  if (thread) {
    setTimeout(() => { thread.scrollTop = thread.scrollHeight; }, 50);
  }
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
      level: (typeof S !== 'undefined' && S.level) ? S.level : 'N5',
      scenario: aiVoiceState.scenario,
      history: aiVoiceState.messages.slice(-6)
    });

    if (res && res.success && res.data) {
      appendAiMessage(res.data);
    } else {
      appendAiMessage({
        japanese: '素晴らしいです！よく話せましたね。ほかにも質問や話したいことはありますか？',
        romaji: 'Subarashii desu! Yoku hanasemasita ne. Hoka ni mo shitsumon ya hanashitai koto wa arimasu ka?',
        english: 'Great job! You spoke very well. Do you have other questions or topics you want to discuss?',
        suggestedReplies: [
          'もっと練習したいです！',
          '日本語の勉強は楽しいです。',
          'ありがとう、さくら先生！'
        ]
      });
    }
  } catch (e) {
    console.error('AI chat communication error:', e);
    appendAiMessage({
      japanese: 'はい、分かりました！一緒に楽しく日本語を続けましょう！',
      romaji: 'Hai, wakarimashita! Issho ni tanoshiku nihongo wo tsuzukemashou!',
      english: 'Yes, understood! Let\'s keep learning Japanese happily together!',
      suggestedReplies: ['はい、がんばります！', 'さくら先生、ありがとうございます。']
    });
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
      micBtn.title = 'Speech Recognition requires Chrome, Edge, Safari, or Android browser.';
    }
    return;
  }

  try {
    const rec = new SpeechRecognition();
    rec.lang = 'ja-JP';
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.continuous = false;

    rec.onstart = () => {
      aiVoiceState.isListening = true;
      updateMicButtonUI(true);
      updateStatus('mic', '🎙️ Listening... Speak Japanese or English');
    };

    rec.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      const inputEl = document.getElementById('aiInputText');
      if (inputEl && transcript) inputEl.value = transcript;
    };

    rec.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      aiVoiceState.isListening = false;
      updateMicButtonUI(false);
      updateStatus('idle', 'Ready to practice!');
      if (event.error === 'not-allowed') {
        toast('Microphone permission blocked. Please allow mic in browser settings.');
      } else if (event.error === 'no-speech') {
        toast('No voice detected. Click the mic and speak!');
      }
    };

    rec.onend = () => {
      aiVoiceState.isListening = false;
      updateMicButtonUI(false);
      updateStatus('idle', 'Ready to practice!');
      
      // Auto send if input has text
      const inputEl = document.getElementById('aiInputText');
      if (inputEl && inputEl.value.trim()) {
        sendUserMessage();
      }
    };

    aiVoiceState.recognition = rec;
  } catch(e) {
    console.warn('Failed to initialize SpeechRecognition:', e);
  }
}

function toggleMicListening() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    toast('Voice recognition supported on Chrome/Edge/Safari/Android. You can also type!');
    return;
  }

  if (!aiVoiceState.recognition) {
    initSpeechRecognition();
  }

  if (!aiVoiceState.recognition) {
    toast('Could not access microphone.');
    return;
  }

  if (aiVoiceState.isListening) {
    try {
      aiVoiceState.recognition.stop();
    } catch(e) {}
  } else {
    // Stop TTS if speaking
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    try {
      aiVoiceState.recognition.start();
    } catch(e) {
      console.warn('Rec start error:', e);
    }
  }
}

function updateMicButtonUI(isListening) {
  const btn = document.getElementById('aiMicBtn');
  if (!btn) return;
  if (isListening) {
    btn.classList.add('listening');
    btn.style.background = 'var(--red-soft, #fee2e2)';
    btn.style.borderColor = 'var(--red, #ef4444)';
    btn.style.color = 'var(--red, #b91c1c)';
    btn.innerHTML = '🎙️ <span>Listening... (Tap to Send)</span>';
  } else {
    btn.classList.remove('listening');
    btn.style.background = 'var(--teal-soft)';
    btn.style.borderColor = 'var(--teal)';
    btn.style.color = 'var(--teal)';
    btn.innerHTML = '🎙️ <span>Tap to Speak Japanese</span>';
  }
}

// ── SPEECH SYNTHESIS (Voice Output) ──
function getJapaneseVoice() {
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || !voices.length) return null;

  // Search for high quality Japanese voices
  return (
    voices.find(v => (v.lang === 'ja-JP' || v.lang === 'ja_JP') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Haruka') || v.name.includes('Ayumi') || v.name.includes('Kyoko') || v.name.includes('Otoya') || v.name.includes('Nanami'))) ||
    voices.find(v => v.lang === 'ja-JP' || v.lang === 'ja_JP' || v.lang.startsWith('ja')) ||
    voices.find(v => v.name.toLowerCase().includes('japan')) ||
    null
  );
}

function speakText(text) {
  if (!('speechSynthesis' in window)) return;
  
  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.cancel();

    // Clean text: strip HTML, furigana annotations in brackets
    const cleanText = String(text || '')
      .replace(/<[^>]*>/g, '')
      .replace(/（[^）]*）/g, '')
      .replace(/\([^)]*\)/g, '')
      .trim();

    if (!cleanText) return;

    const u = new SpeechSynthesisUtterance(cleanText);
    u.lang = 'ja-JP';
    u.rate = 0.88;
    u.pitch = 1.05;

    const jpVoice = getJapaneseVoice();
    if (jpVoice) u.voice = jpVoice;

    u.onstart = () => {
      aiVoiceState.isSpeaking = true;
      updateStatus('speaker', '🔊 Sakura-sensei is speaking...');
    };
    u.onend = () => {
      aiVoiceState.isSpeaking = false;
      updateStatus('idle', 'Ready to practice!');
    };
    u.onerror = (e) => {
      aiVoiceState.isSpeaking = false;
      updateStatus('idle', 'Ready to practice!');
    };

    setTimeout(() => {
      try {
        window.speechSynthesis.speak(u);
      } catch(e) {}
    }, 50);

  } catch(e) {
    console.warn('Speech synthesis error:', e);
  }
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
    badge.style.background = 'var(--red-soft, #fee2e2)';
    badge.style.color = 'var(--red, #b91c1c)';
  } else if (type === 'speaker') {
    badge.style.background = 'var(--teal-soft, #ccfbf1)';
    badge.style.color = 'var(--teal, #0f766e)';
  } else if (type === 'brain') {
    badge.style.background = 'var(--indigo-soft, #e0e7ff)';
    badge.style.color = 'var(--indigo, #4338ca)';
  } else {
    badge.style.background = 'var(--surface)';
    badge.style.color = 'var(--muted)';
  }
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
