// Clean AI Voice API handler module
const fs = require('fs');

function setupAiChatRoutes(app) {
  // Status check for Gemini API
  app.get('/api/ai-chat/status', (req, res) => {
    const hasServerKey = !!(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('placeholder'));
    res.json({
      success: true,
      hasServerKey,
      defaultModel: 'gemini-1.5-flash'
    });
  });

  // Save key to .env
  app.post('/api/ai-chat/save-key', async (req, res) => {
    try {
      const { apiKey } = req.body;
      if (!apiKey || !apiKey.trim()) return res.json({ success: false, error: 'API key is required' });

      process.env.GEMINI_API_KEY = apiKey.trim();
      const envPath = 'd:/project/N5 web/jlpt-n5-app/.env';
      let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
      if (envContent.includes('GEMINI_API_KEY=')) {
        envContent = envContent.replace(/GEMINI_API_KEY=.*(\r?\n|$)/, 'GEMINI_API_KEY=' + apiKey.trim() + '$1');
      } else {
        envContent += '\nGEMINI_API_KEY=' + apiKey.trim() + '\n';
      }
      fs.writeFileSync(envPath, envContent, 'utf8');
      res.json({ success: true, message: 'Gemini API key saved to server .env!' });
    } catch (err) {
      res.json({ success: false, error: err.message });
    }
  });

  // Main AI chat handler
  app.post('/api/ai-chat', async (req, res) => {
    try {
      const { message, level = 'N5', scenario = 'free_talk', history = [], apiKey: clientKey } = req.body;
      if (!message || !String(message).trim()) return res.json({ success: false, error: 'No message provided' });

      const trimmedMsg = String(message).trim();
      const headerKey = req.headers['x-gemini-api-key'];
      const apiKey = (clientKey || headerKey || process.env.GEMINI_API_KEY || '').trim();

      // ── 1. LIVE GEMINI AI MODE (Understands Any Topic) ──
      if (apiKey && !apiKey.includes('placeholder')) {
        try {
          const isFreeTalk = scenario === 'free_talk' || scenario === 'free_chat';

          const systemPrompt = [
            `You are Sakura-sensei (さくら先生), a warm, encouraging, friendly Japanese tutor chatting with a ${level} level student.`,
            isFreeTalk
              ? 'Current Mode: FREE CONVERSATION (フリートーク). The student can talk about ANYTHING: their day (good or bad), work, life, emotions, feelings, hobbies, food, anime, questions, etc. Deeply listen to what they say and respond with genuine care, empathy, and conversational engagement.'
              : `Roleplay Scenario: "${scenario}".`,
            `Language Rules for ${level}:`,
            `1. Speak in natural Japanese suited for ${level} learners (polite です/ます form).`,
            '2. ALWAYS provide Furigana in parentheses immediately after EVERY Kanji, for example: 今日（きょう）は 大変（たいへん）でしたね。',
            '3. Keep sentences clear, friendly, and accessible.',
            'Active Correction & Learning Rules:',
            '- If the student typed in English (e.g. "my day was bad", "I am tired", "what anime do you like?"):',
            '  - Understand their meaning and answer their topic warmly.',
            `  - In "correction", gently teach them how a native speaker would express what they said in natural ${level} Japanese with Furigana and Romaji.`,
            '    Example for "my day was bad": "To say \'my day was bad\' in Japanese, you can say: 『今日（きょう）は 大変（たいへん）な 一日（いちにち）でした』(Kyou wa taihen na ichinichi deshita)."',
            '- If the student typed Japanese with grammar, particle, or vocabulary errors:',
            '  - In "correction", gently explain what was incorrect (e.g. particle or verb tense) and show the correct form.',
            '- If the student\'s Japanese was already accurate and natural:',
            '  - Set "correction": null.',
            'JSON Output Schema (Respond ONLY with valid JSON, no markdown code fences):',
            '{',
            '  "japanese": "Your response in natural Japanese with furigana in parentheses",',
            '  "romaji": "Romaji reading of your response",',
            '  "english": "Natural English translation of your response",',
            '  "correction": "Friendly correction or English-to-Japanese tip (or null if input was good)",',
            '  "suggestedReplies": ["3 natural short Japanese replies the student can click next"]',
            '}'
          ].join('\n');

          const contents = [];
          if (Array.isArray(history) && history.length > 0) {
            history.slice(-8).forEach(h => {
              if (h.sender === 'user' && h.text) {
                contents.push({ role: 'user', parts: [{ text: h.text }] });
              } else if (h.sender === 'ai' && h.data && h.data.japanese) {
                contents.push({
                  role: 'model',
                  parts: [{
                    text: JSON.stringify({
                      japanese: h.data.japanese,
                      romaji: h.data.romaji || '',
                      english: h.data.english || '',
                      correction: h.data.correction || null,
                      suggestedReplies: h.data.suggestedReplies || []
                    })
                  }]
                });
              }
            });
          }

          contents.push({
            role: 'user',
            parts: [{ text: systemPrompt + '\n\nStudent says: "' + trimmedMsg + '"' }]
          });

          const modelsToTry = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash'];
          for (const model of modelsToTry) {
            try {
              const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents,
                  generationConfig: { responseMimeType: 'application/json', temperature: 0.7 }
                })
              });

              if (geminiRes.ok) {
                const data = await geminiRes.json();
                let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (rawText) {
                  rawText = rawText.replace(/^\s*```json/i, '').replace(/^\s*```/, '').replace(/```\s*$/, '').trim();
                  const parsed = JSON.parse(rawText);
                  if (parsed && parsed.japanese) {
                    return res.json({ success: true, data: parsed, source: 'ai', model });
                  }
                }
              } else {
                const errBody = await geminiRes.text();
                console.warn(`Gemini ${model} returned ${geminiRes.status}:`, errBody.slice(0, 180));
              }
            } catch (modelErr) {
              console.warn(`Gemini ${model} call error:`, modelErr.message);
            }
          }
        } catch (gemErr) {
          console.warn('Gemini API call warning (falling back):', gemErr.message);
        }
      }

      // ── 2. INTELLIGENT CONVERSATIONAL FALLBACK (Handles Emotions & Topics Contextually) ──
      const lowerMsg = trimmedMsg.toLowerCase();
      let reply = null;

      // Bad Day / Negative Emotions / Tired / Hard
      if (
        lowerMsg.includes('bad') || lowerMsg.includes('terrible') || lowerMsg.includes('awful') ||
        lowerMsg.includes('sad') || lowerMsg.includes('tired') || lowerMsg.includes('exhausted') ||
        lowerMsg.includes('hard') || lowerMsg.includes('difficult') || lowerMsg.includes('stress') ||
        lowerMsg.includes('sick') || lowerMsg.includes('hurt') || lowerMsg.includes('unhappy') ||
        lowerMsg.includes('つかれた') || lowerMsg.includes('疲') || lowerMsg.includes('たいへん') ||
        lowerMsg.includes('大変') || lowerMsg.includes('つらい') || lowerMsg.includes('だめ') ||
        lowerMsg.includes('いや') || lowerMsg.includes('かなしい') || lowerMsg.includes('悲しい')
      ) {
        reply = {
          japanese: '今日（きょう）は 大変（たいへん）でしたね。本当（ほんとう）にお疲（つか）れ様（さま）でした！何（なに）か嫌（いや）なことがありましたか？無理（むり）をしないで、ゆっくり休（やす）んでくださいね。',
          romaji: 'Kyou wa taihen deshita ne. Hontou ni otsukaresama deshita! Nanika iya na koto ga arimashita ka? Muri wo shinaide, yukkuri yasunde kudasai ne.',
          english: "Today was a tough day, wasn't it? Truly, good work getting through it! Did something unpleasant happen? Please don't push yourself too hard and rest well.",
          correction: 'To say "My day was bad" in Japanese, you can say: 『今日（きょう）は 大変（たいへん）な 一日（いちにち）でした』(Kyou wa taihen na ichinichi deshita) or 『今日（きょう）は ついてない日（ひ）でした』(Kyou wa tsuite nai hi deshita).',
          suggestedReplies: [
            '仕事（しごと）が大変でした。',
            'ゆっくり休みます。',
            '話を聞いてくれてありがとうございます。'
          ]
        };
      }
      // Good Day / Happy / Exciting
      else if (
        lowerMsg.includes('good') || lowerMsg.includes('great') || lowerMsg.includes('happy') ||
        lowerMsg.includes('fun') || lowerMsg.includes('awesome') || lowerMsg.includes('wonderful') ||
        lowerMsg.includes('うれしい') || lowerMsg.includes('楽しい') || lowerMsg.includes('たのしい') ||
        lowerMsg.includes('よかった') || lowerMsg.includes('最高') || lowerMsg.includes('さいこう')
      ) {
        reply = {
          japanese: 'それは良（よ）かったですね！話（はな）を聞（き）いて私（わたし）も嬉（うれ）しいです！今日（きょう）はどんな楽（たの）しいことがありましたか？',
          romaji: 'Sore wa yokatta desu ne! Hanashi wo kiite watashi mo ureshii desu! Kyou wa donna tanoshii koto ga arimashita ka?',
          english: "That is great! Hearing that makes me happy too! What kind of fun things happened today?",
          correction: (lowerMsg.includes('good') || lowerMsg.includes('great')) ? 'To express "My day was good", in Japanese you can say: 『今日（きょう）は とても いい日（ひ）でした』(Kyou wa totemo ii hi deshita).' : null,
          suggestedReplies: [
            '友達（ともだち）と遊（あそ）びました！',
            '日本語の勉強が進みました。',
            '美味しいものを食べました。'
          ]
        };
      }
      // Self Introduction / Names
      else if (
        lowerMsg.includes('名前') || lowerMsg.includes('なまえ') || lowerMsg.includes('わたしは') ||
        lowerMsg.includes('僕は') || lowerMsg.includes('my name') || lowerMsg.includes('ayush') ||
        lowerMsg.includes('i am') || lowerMsg.includes('im ') || lowerMsg.includes("i'm")
      ) {
        reply = {
          japanese: 'お名前（なまえ）を教（おし）えてくれてありがとうございます！どうぞよろしくお願いします。趣味（しゅみ）は何（なに）ですか？',
          romaji: 'O-namae wo oshiete kurete arigatou gozaimasu! Douzo yoroshiku onegai shimasu. Shumi wa nan desu ka?',
          english: 'Thank you for introducing yourself! Nice to meet you. What are your hobbies?',
          correction: lowerMsg.includes('my name') ? 'In Japanese, introduce yourself with: 『わたしの名前（なまえ）は [Name] です』(Watashi no namae wa [Name] desu).' : null,
          suggestedReplies: [
            '趣味はプログラミングです。',
            'アニメや音楽が好きです。',
            '先生の趣味は何ですか？'
          ]
        };
      }
      // Hobbies / Anime / Music
      else if (
        lowerMsg.includes('趣味') || lowerMsg.includes('しゅみ') || lowerMsg.includes('hobby') ||
        lowerMsg.includes('anime') || lowerMsg.includes('manga') || lowerMsg.includes('music') ||
        lowerMsg.includes('game') || lowerMsg.includes('programming') || lowerMsg.includes('好き')
      ) {
        reply = {
          japanese: 'とても素敵（すてき）な趣味（しゅみ）ですね！楽（たの）しく続（つづ）けるのが一番（いちばん）大切（たいせつ）ですよ。よく見（み）る作品（さくひん）や好（す）きなものは何（なに）ですか？',
          romaji: 'Totemo suteki na shumi desu ne! Tanoshiku tsuzukeru no ga ichiban taisetsu desu yo. Yoku miru sakuhin ya suki na mono wa nan desu ka?',
          english: 'That is a wonderful hobby! Enjoying what you do is the most important thing. What is your favorite piece or work?',
          correction: null,
          suggestedReplies: [
            'おすすめの作品はありますか？',
            '毎日少しずつ練習しています。',
            '先生の好きなアニメは何ですか？'
          ]
        };
      }
      // Greetings
      else if (lowerMsg.includes('おはよう') || lowerMsg.includes('good morning')) {
        reply = {
          japanese: 'おはようございます！今日（きょう）も一日（いちにち）がんばりましょう！体調（たいちょう）はいかがですか？',
          romaji: 'Ohayou gozaimasu! Kyou mo ichinichi ganbarimashou! Taichou wa ikaga desu ka?',
          english: "Good morning! Let's do our best today as well! How are you feeling?",
          correction: null,
          suggestedReplies: ['元気です！', '今日もよろしくお願いします！', '少し眠いです。']
        };
      } else if (lowerMsg.includes('こんばんは') || lowerMsg.includes('good evening') || lowerMsg.includes('おやすみ') || lowerMsg.includes('good night')) {
        reply = {
          japanese: 'こんばんは！今日（きょう）も一日（いちにち）お疲（つか）れ様（さま）でした。今夜（こんや）はゆっくり休（やす）んでくださいね！',
          romaji: 'Konbanwa! Kyou mo ichinichi otsukaresama deshita. Konya wa yukkuri yasunde kudasai ne!',
          english: 'Good evening! Great work today. Please get plenty of rest tonight!',
          correction: null,
          suggestedReplies: ['先生もお疲れ様でした！', 'おやすみなさい。', 'また明日勉強します。']
        };
      } else if (lowerMsg.includes('ありがとう') || lowerMsg.includes('thank') || lowerMsg.includes('arigatou')) {
        reply = {
          japanese: 'どういたしまして！いつでも気軽（きがる）に話（はな）しかけてくださいね！何（なに）か気（き）になることはありますか？',
          romaji: 'Dou itashimashite! Itsudemo kigaru ni hanashikakete kudasai ne! Nanika ki ni naru koto wa arimasu ka?',
          english: "You're very welcome! Feel free to talk to me anytime. Is there anything on your mind?",
          correction: null,
          suggestedReplies: ['日本語をもっと上手になりたいです。', '質問があります！', 'また話しましょう。']
        };
      } else if (lowerMsg.includes('さようなら') || lowerMsg.includes('bye') || lowerMsg.includes('またね') || lowerMsg.includes('goodbye')) {
        reply = {
          japanese: 'またお話（はな）ししましょう！JLPTの勉強（べんきょう）、心（こころ）から応援（おうえん）していますよ！',
          romaji: 'Mata o-hanashi shimashou! JLPT no benkyou, kokoro kara ouen shite imasu yo!',
          english: "Let's talk again soon! I am cheering for your JLPT studies from the bottom of my heart!",
          correction: null,
          suggestedReplies: ['ありがとうございました！', 'また明日！', 'がんばります！']
        };
      } else if (lowerMsg.includes('元気') || lowerMsg.includes('genki') || lowerMsg.includes('how are you')) {
        reply = {
          japanese: 'はい、元気（げんき）いっぱいです！あなたと日本語（にほんご）を話（はな）せてとても嬉（うれ）しいですよ！あなたはどうですか？',
          romaji: 'Hai, genki ippai desu! Anata to nihongo wo hanasete totemo ureshii desu yo! Anata wa dou desu ka?',
          english: 'Yes, I am full of energy! I am very happy to talk Japanese with you! How about you?',
          correction: null,
          suggestedReplies: ['私も元気です！', '楽しく勉強しています。', '少し疲れました。']
        };
      }
      // Food & Dining
      else if (
        lowerMsg.includes('食べ') || lowerMsg.includes('料理') || lowerMsg.includes('food') ||
        lowerMsg.includes('eat') || lowerMsg.includes('hungry') || lowerMsg.includes('ラーメン') ||
        lowerMsg.includes('寿司') || lowerMsg.includes('お腹') || lowerMsg.includes('レストラン')
      ) {
        reply = {
          japanese: '日本（にほん）の料理（りょうり）はとても美味（おい）しいですよね！ラーメンや寿司（すし）、カレーなど何（なに）が一番（いちばん）好（す）きですか？',
          romaji: 'Nihon no ryouri wa totemo oishii desu yo ne! Raamen ya sushi, karee nado nani ga ichiban suki desu ka?',
          english: "Japanese cuisine is delicious, isn't it! What do you like best among ramen, sushi, curry, and more?",
          correction: null,
          suggestedReplies: [
            'ラーメンが大好きです！',
            'まだ日本食を食べたことがありません。',
            'おすすめの店はありますか？'
          ]
        };
      }
      // General Free Talk Fallback
      else {
        reply = {
          japanese: 'お話（はな）ししてくれてありがとうございます！とても興味深（きょうみぶか）いですね。もっと詳（くわ）しく教（おし）えていただけますか？',
          romaji: 'O-hanashi shite kurete arigatou gozaimasu! Totemo kyoumibukai desu ne. Motto kuwashiku oshiete itadakemasu ka?',
          english: 'Thank you for sharing! That is very interesting. Could you tell me more about it?',
          correction: apiKey ? null : 'Connect your free Gemini API key using the "🔑 Connect AI" button above so Sakura-sensei can understand and answer any complex topic in full detail!',
          suggestedReplies: [
            'はい、もっと話したいです！',
            '日本語で何と言いますか？',
            'さくら先生の意見はどうですか？'
          ]
        };
      }

      res.json({ success: true, data: reply, source: 'offline' });

    } catch (e) {
      console.error('AI chat route error:', e.message);
      res.json({
        success: true,
        data: {
          japanese: '素晴（すば）らしいです！一緒（いっしょ）に日本語（にほんご）を練習（れんしゅう）しましょう！',
          romaji: 'Subarashii desu! Issho ni nihongo wo renshuu shimashou!',
          english: "Wonderful! Let's practice Japanese together!",
          suggestedReplies: ['はい、がんばります！', 'よろしくお願いします！']
        },
        source: 'fallback'
      });
    }
  });
}

module.exports = { setupAiChatRoutes };
