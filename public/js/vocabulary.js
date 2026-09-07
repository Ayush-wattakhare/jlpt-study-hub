// ── VOCABULARY ──
const VOCAB = {
N5: [
  {
    "jp": "一",
    "r": "いち",
    "en": "one",
    "cat": "numbers",
    "ex": "一つください。",
    "exEn": "One please."
  },
  {
    "jp": "二",
    "r": "に",
    "en": "two",
    "cat": "numbers",
    "ex": "二人います。",
    "exEn": "There are two people."
  },
  {
    "jp": "三",
    "r": "さん",
    "en": "three",
    "cat": "numbers",
    "ex": "三時です。",
    "exEn": "It's 3 o'clock."
  },
  {
    "jp": "四",
    "r": "し/よん",
    "en": "four",
    "cat": "numbers",
    "ex": "四月です。",
    "exEn": "It's April."
  },
  {
    "jp": "五",
    "r": "ご",
    "en": "five",
    "cat": "numbers",
    "ex": "五千円です。",
    "exEn": "It's 5000 yen."
  },
  {
    "jp": "六",
    "r": "ろく",
    "en": "six",
    "cat": "numbers",
    "ex": "六時に起きます。",
    "exEn": "I wake up at 6."
  },
  {
    "jp": "七",
    "r": "なな/しち",
    "en": "seven",
    "cat": "numbers",
    "ex": "七日です。",
    "exEn": "It's the 7th."
  },
  {
    "jp": "八",
    "r": "はち",
    "en": "eight",
    "cat": "numbers",
    "ex": "八百円。",
    "exEn": "800 yen."
  },
  {
    "jp": "九",
    "r": "きゅう/く",
    "en": "nine",
    "cat": "numbers",
    "ex": "九時です。",
    "exEn": "It's 9 o'clock."
  },
  {
    "jp": "十",
    "r": "じゅう",
    "en": "ten",
    "cat": "numbers",
    "ex": "十個あります。",
    "exEn": "There are 10."
  },
  {
    "jp": "百",
    "r": "ひゃく",
    "en": "hundred",
    "cat": "numbers",
    "ex": "百円です。",
    "exEn": "It's 100 yen."
  },
  {
    "jp": "千",
    "r": "せん",
    "en": "thousand",
    "cat": "numbers",
    "ex": "千円です。",
    "exEn": "It's 1000 yen."
  },
  {
    "jp": "万",
    "r": "まん",
    "en": "ten thousand",
    "cat": "numbers",
    "ex": "一万円。",
    "exEn": "10,000 yen."
  },
  {
    "jp": "おはようございます",
    "r": "ohayou gozaimasu",
    "en": "good morning",
    "cat": "greetings",
    "ex": "おはようございます！",
    "exEn": "Good morning!"
  },
  {
    "jp": "こんにちは",
    "r": "konnichiwa",
    "en": "hello / good afternoon",
    "cat": "greetings",
    "ex": "こんにちは、田中さん。",
    "exEn": "Hello, Tanaka-san."
  },
  {
    "jp": "こんばんは",
    "r": "konbanwa",
    "en": "good evening",
    "cat": "greetings",
    "ex": "こんばんは。",
    "exEn": "Good evening."
  },
  {
    "jp": "ありがとうございます",
    "r": "arigatou gozaimasu",
    "en": "thank you very much",
    "cat": "greetings",
    "ex": "ありがとうございます。",
    "exEn": "Thank you very much."
  },
  {
    "jp": "すみません",
    "r": "sumimasen",
    "en": "excuse me / sorry",
    "cat": "greetings",
    "ex": "すみません、駅はどこですか？",
    "exEn": "Excuse me, where is the station?"
  },
  {
    "jp": "ごめんなさい",
    "r": "gomen nasai",
    "en": "I'm sorry",
    "cat": "greetings",
    "ex": "ごめんなさい、遅れました。",
    "exEn": "I'm sorry, I'm late."
  },
  {
    "jp": "はい",
    "r": "hai",
    "en": "yes",
    "cat": "greetings",
    "ex": "はい、そうです。",
    "exEn": "Yes, that is right."
  },
  {
    "jp": "いいえ",
    "r": "iie",
    "en": "no",
    "cat": "greetings",
    "ex": "いいえ、違います。",
    "exEn": "No, that's wrong."
  },
  {
    "jp": "さようなら",
    "r": "sayounara",
    "en": "goodbye",
    "cat": "greetings",
    "ex": "さようなら！またね。",
    "exEn": "Goodbye! See you."
  },
  {
    "jp": "よろしくお願いします",
    "r": "yoroshiku onegaishimasu",
    "en": "nice to meet you / please",
    "cat": "greetings",
    "ex": "よろしくお願いします。",
    "exEn": "Nice to meet you."
  },
  {
    "jp": "水",
    "r": "みず",
    "en": "water",
    "cat": "food",
    "ex": "水をください。",
    "exEn": "Please give me water."
  },
  {
    "jp": "ご飯",
    "r": "ごはん",
    "en": "rice / meal",
    "cat": "food",
    "ex": "ご飯を食べます。",
    "exEn": "I eat rice."
  },
  {
    "jp": "パン",
    "r": "ぱん",
    "en": "bread",
    "cat": "food",
    "ex": "パンを買います。",
    "exEn": "I will buy bread."
  },
  {
    "jp": "肉",
    "r": "にく",
    "en": "meat",
    "cat": "food",
    "ex": "肉が好きです。",
    "exEn": "I like meat."
  },
  {
    "jp": "魚",
    "r": "さかな",
    "en": "fish",
    "cat": "food",
    "ex": "魚を食べます。",
    "exEn": "I eat fish."
  },
  {
    "jp": "野菜",
    "r": "やさい",
    "en": "vegetables",
    "cat": "food",
    "ex": "野菜は体にいいです。",
    "exEn": "Vegetables are good for the body."
  },
  {
    "jp": "果物",
    "r": "くだもの",
    "en": "fruit",
    "cat": "food",
    "ex": "果物が好きです。",
    "exEn": "I like fruit."
  },
  {
    "jp": "お茶",
    "r": "おちゃ",
    "en": "tea",
    "cat": "food",
    "ex": "お茶を飲みます。",
    "exEn": "I drink tea."
  },
  {
    "jp": "牛乳",
    "r": "ぎゅうにゅう",
    "en": "milk",
    "cat": "food",
    "ex": "牛乳を飲みます。",
    "exEn": "I drink milk."
  },
  {
    "jp": "卵",
    "r": "たまご",
    "en": "egg",
    "cat": "food",
    "ex": "卵を食べます。",
    "exEn": "I eat eggs."
  },
  {
    "jp": "学校",
    "r": "がっこう",
    "en": "school",
    "cat": "places",
    "ex": "学校へ行きます。",
    "exEn": "I go to school."
  },
  {
    "jp": "駅",
    "r": "えき",
    "en": "station",
    "cat": "places",
    "ex": "駅はどこですか？",
    "exEn": "Where is the station?"
  },
  {
    "jp": "病院",
    "r": "びょういん",
    "en": "hospital",
    "cat": "places",
    "ex": "病院に行きます。",
    "exEn": "I go to the hospital."
  },
  {
    "jp": "銀行",
    "r": "ぎんこう",
    "en": "bank",
    "cat": "places",
    "ex": "銀行はあそこです。",
    "exEn": "The bank is over there."
  },
  {
    "jp": "郵便局",
    "r": "ゆうびんきょく",
    "en": "post office",
    "cat": "places",
    "ex": "郵便局はどこですか？",
    "exEn": "Where is the post office?"
  },
  {
    "jp": "スーパー",
    "r": "すーぱー",
    "en": "supermarket",
    "cat": "places",
    "ex": "スーパーで買います。",
    "exEn": "I buy at the supermarket."
  },
  {
    "jp": "レストラン",
    "r": "れすとらん",
    "en": "restaurant",
    "cat": "places",
    "ex": "レストランで食べます。",
    "exEn": "I eat at the restaurant."
  },
  {
    "jp": "図書館",
    "r": "としょかん",
    "en": "library",
    "cat": "places",
    "ex": "図書館で勉強します。",
    "exEn": "I study at the library."
  },
  {
    "jp": "家",
    "r": "いえ/うち",
    "en": "house / home",
    "cat": "places",
    "ex": "家に帰ります。",
    "exEn": "I go home."
  },
  {
    "jp": "公園",
    "r": "こうえん",
    "en": "park",
    "cat": "places",
    "ex": "公園を散歩します。",
    "exEn": "I walk in the park."
  },
  {
    "jp": "お父さん",
    "r": "おとうさん",
    "en": "father",
    "cat": "family",
    "ex": "お父さんはどこですか？",
    "exEn": "Where is your father?"
  },
  {
    "jp": "お母さん",
    "r": "おかあさん",
    "en": "mother",
    "cat": "family",
    "ex": "お母さんが好きです。",
    "exEn": "I love my mother."
  },
  {
    "jp": "お兄さん",
    "r": "おにいさん",
    "en": "older brother",
    "cat": "family",
    "ex": "お兄さんは学生です。",
    "exEn": "My older brother is a student."
  },
  {
    "jp": "お姉さん",
    "r": "おねえさん",
    "en": "older sister",
    "cat": "family",
    "ex": "お姉さんは先生です。",
    "exEn": "My older sister is a teacher."
  },
  {
    "jp": "弟",
    "r": "おとうと",
    "en": "younger brother",
    "cat": "family",
    "ex": "弟がいます。",
    "exEn": "I have a younger brother."
  },
  {
    "jp": "妹",
    "r": "いもうと",
    "en": "younger sister",
    "cat": "family",
    "ex": "妹は可愛いです。",
    "exEn": "My younger sister is cute."
  },
  {
    "jp": "友達",
    "r": "ともだち",
    "en": "friend",
    "cat": "family",
    "ex": "友達と遊びます。",
    "exEn": "I play with friends."
  },
  {
    "jp": "先生",
    "r": "せんせい",
    "en": "teacher",
    "cat": "family",
    "ex": "先生は優しいです。",
    "exEn": "The teacher is kind."
  },
  {
    "jp": "電車",
    "r": "でんしゃ",
    "en": "train",
    "cat": "transport",
    "ex": "電車で行きます。",
    "exEn": "I go by train."
  },
  {
    "jp": "バス",
    "r": "ばす",
    "en": "bus",
    "cat": "transport",
    "ex": "バスに乗ります。",
    "exEn": "I ride the bus."
  },
  {
    "jp": "車",
    "r": "くるま",
    "en": "car",
    "cat": "transport",
    "ex": "車で来ました。",
    "exEn": "I came by car."
  },
  {
    "jp": "自転車",
    "r": "じてんしゃ",
    "en": "bicycle",
    "cat": "transport",
    "ex": "自転車で通学します。",
    "exEn": "I commute by bicycle."
  },
  {
    "jp": "飛行機",
    "r": "ひこうき",
    "en": "airplane",
    "cat": "transport",
    "ex": "飛行機で行きます。",
    "exEn": "I go by airplane."
  },
  {
    "jp": "今日",
    "r": "きょう",
    "en": "today",
    "cat": "time",
    "ex": "今日は月曜日です。",
    "exEn": "Today is Monday."
  },
  {
    "jp": "明日",
    "r": "あした",
    "en": "tomorrow",
    "cat": "time",
    "ex": "明日、会いましょう。",
    "exEn": "Let's meet tomorrow."
  },
  {
    "jp": "昨日",
    "r": "きのう",
    "en": "yesterday",
    "cat": "time",
    "ex": "昨日、映画を見ました。",
    "exEn": "I watched a movie yesterday."
  },
  {
    "jp": "今",
    "r": "いま",
    "en": "now",
    "cat": "time",
    "ex": "今、何時ですか？",
    "exEn": "What time is it now?"
  },
  {
    "jp": "毎日",
    "r": "まいにち",
    "en": "every day",
    "cat": "time",
    "ex": "毎日勉強します。",
    "exEn": "I study every day."
  },
  {
    "jp": "本",
    "r": "ほん",
    "en": "book",
    "cat": "objects",
    "ex": "本を読みます。",
    "exEn": "I read a book."
  },
  {
    "jp": "鉛筆",
    "r": "えんぴつ",
    "en": "pencil",
    "cat": "objects",
    "ex": "鉛筆で書きます。",
    "exEn": "I write with a pencil."
  },
  {
    "jp": "傘",
    "r": "かさ",
    "en": "umbrella",
    "cat": "objects",
    "ex": "傘を持ってきました。",
    "exEn": "I brought an umbrella."
  },
  {
    "jp": "時計",
    "r": "とけい",
    "en": "clock / watch",
    "cat": "objects",
    "ex": "時計を買いました。",
    "exEn": "I bought a watch."
  },
  {
    "jp": "電話",
    "r": "でんわ",
    "en": "telephone",
    "cat": "objects",
    "ex": "電話をかけます。",
    "exEn": "I make a phone call."
  },
  {
    "jp": "月曜日",
    "r": "げつようび",
    "en": "Monday",
    "cat": "time",
    "ex": "月曜日に学校へ行きます。",
    "exEn": "I go to school on Monday."
  },
  {
    "jp": "火曜日",
    "r": "かようび",
    "en": "Tuesday",
    "cat": "time",
    "ex": "火曜日は忙しいです。",
    "exEn": "Tuesday is busy."
  },
  {
    "jp": "水曜日",
    "r": "すいようび",
    "en": "Wednesday",
    "cat": "time",
    "ex": "水曜日にテストがあります。",
    "exEn": "There is a test on Wednesday."
  },
  {
    "jp": "木曜日",
    "r": "もくようび",
    "en": "Thursday",
    "cat": "time",
    "ex": "木曜日に映画を見ます。",
    "exEn": "I watch a movie on Thursday."
  },
  {
    "jp": "金曜日",
    "r": "きんようび",
    "en": "Friday",
    "cat": "time",
    "ex": "金曜日は楽しいです。",
    "exEn": "Friday is fun."
  },
  {
    "jp": "土曜日",
    "r": "どようび",
    "en": "Saturday",
    "cat": "time",
    "ex": "土曜日に遊びます。",
    "exEn": "I play on Saturday."
  },
  {
    "jp": "日曜日",
    "r": "にちようび",
    "en": "Sunday",
    "cat": "time",
    "ex": "日曜日は休みです。",
    "exEn": "Sunday is a holiday."
  },
  {
    "jp": "頭",
    "r": "あたま",
    "en": "head",
    "cat": "body",
    "sub": "Head / Face",
    "ex": "頭が痛いです。",
    "exEn": "My head hurts."
  },
  {
    "jp": "顔",
    "r": "かお",
    "en": "face",
    "cat": "body",
    "sub": "Head / Face",
    "ex": "顔を洗います。",
    "exEn": "I wash my face."
  },
  {
    "jp": "目",
    "r": "め",
    "en": "eye",
    "cat": "body",
    "sub": "Head / Face",
    "ex": "目がきれいです。",
    "exEn": "Your eyes are beautiful."
  },
  {
    "jp": "耳",
    "r": "みみ",
    "en": "ear",
    "cat": "body",
    "sub": "Head / Face",
    "ex": "耳が痛いです。",
    "exEn": "My ear hurts."
  },
  {
    "jp": "鼻",
    "r": "はな",
    "en": "nose",
    "cat": "body",
    "sub": "Head / Face",
    "ex": "鼻が高いですね。",
    "exEn": "You have a high nose."
  },
  {
    "jp": "口",
    "r": "くち",
    "en": "mouth",
    "cat": "body",
    "sub": "Head / Face",
    "ex": "口を開けてください。",
    "exEn": "Please open your mouth."
  },
  {
    "jp": "歯",
    "r": "は",
    "en": "tooth",
    "cat": "body",
    "sub": "Head / Face",
    "ex": "歯を磨きます。",
    "exEn": "I brush my teeth."
  },
  {
    "jp": "首",
    "r": "くび",
    "en": "neck",
    "cat": "body",
    "sub": "Upper Body",
    "ex": "首が長いです。",
    "exEn": "The neck is long."
  },
  {
    "jp": "肩",
    "r": "かた",
    "en": "shoulder",
    "cat": "body",
    "sub": "Upper Body",
    "ex": "肩が痛いです。",
    "exEn": "My shoulder hurts."
  },
  {
    "jp": "腕",
    "r": "うで",
    "en": "arm",
    "cat": "body",
    "sub": "Upper Body",
    "ex": "腕が太いです。",
    "exEn": "The arm is thick."
  },
  {
    "jp": "手",
    "r": "て",
    "en": "hand",
    "cat": "body",
    "sub": "Upper Body",
    "ex": "手を洗います。",
    "exEn": "I wash my hands."
  },
  {
    "jp": "指",
    "r": "ゆび",
    "en": "finger",
    "cat": "body",
    "sub": "Upper Body",
    "ex": "指を数えます。",
    "exEn": "I count on my fingers."
  },
  {
    "jp": "背中",
    "r": "せなか",
    "en": "back",
    "cat": "body",
    "sub": "Upper Body",
    "ex": "背中がかゆいです。",
    "exEn": "My back is itchy."
  },
  {
    "jp": "腰",
    "r": "こし",
    "en": "waist / lower back",
    "cat": "body",
    "sub": "Lower Body",
    "ex": "腰が痛いです。",
    "exEn": "My lower back hurts."
  },
  {
    "jp": "足",
    "r": "あし",
    "en": "foot / leg",
    "cat": "body",
    "sub": "Lower Body",
    "ex": "足が速いです。",
    "exEn": "I am a fast runner."
  },
  {
    "jp": "膝",
    "r": "ひざ",
    "en": "knee",
    "cat": "body",
    "sub": "Lower Body",
    "ex": "膝を曲げます。",
    "exEn": "I bend my knees."
  },
  {
    "jp": "踵",
    "r": "かかと",
    "en": "heel",
    "cat": "body",
    "sub": "Lower Body",
    "ex": "踵が痛いです。",
    "exEn": "My heel hurts."
  },
  {
    "jp": "爪先",
    "r": "つまさき",
    "en": "toe / toe-tip",
    "cat": "body",
    "sub": "Lower Body",
    "ex": "爪先立ちをします。",
    "exEn": "I stand on my tiptoes."
  },
  {
    "jp": "心",
    "r": "こころ",
    "en": "heart (emotion)",
    "cat": "body",
    "sub": "Internal Organs",
    "ex": "心が温かい人です。",
    "exEn": "They are a warm-hearted person."
  },
  {
    "jp": "心臓",
    "r": "しんぞう",
    "en": "heart (organ)",
    "cat": "body",
    "sub": "Internal Organs",
    "ex": "心臓が動いています。",
    "exEn": "The heart is beating."
  },
  {
    "jp": "胃",
    "r": "い",
    "en": "stomach",
    "cat": "body",
    "sub": "Internal Organs",
    "ex": "胃が弱いです。",
    "exEn": "I have a weak stomach."
  },
  {
    "jp": "骨",
    "r": "ほね",
    "en": "bone",
    "cat": "body",
    "sub": "Internal Organs",
    "ex": "骨が折れました。",
    "exEn": "The bone broke."
  },
  {
    "jp": "筋肉",
    "r": "きんにく",
    "en": "muscle",
    "cat": "body",
    "sub": "Internal Organs",
    "ex": "筋肉がすごいです！",
    "exEn": "Your muscles are amazing!"
  },
  {
    "jp": "皮膚",
    "r": "ひふ",
    "en": "skin",
    "cat": "body",
    "sub": "Internal Organs",
    "ex": "皮膚が赤いです。",
    "exEn": "The skin is red."
  },
  {
    "jp": "右",
    "r": "みぎ",
    "en": "right (direction)",
    "cat": "directions",
    "ex": "右に曲がってください。",
    "exEn": "Please turn right."
  },
  {
    "jp": "左",
    "r": "ひだり",
    "en": "left (direction)",
    "cat": "directions",
    "ex": "左に曲がります。",
    "exEn": "Turn left."
  },
  {
    "jp": "前",
    "r": "まえ",
    "en": "front/before",
    "cat": "directions",
    "ex": "駅の前に あります。",
    "exEn": "It is in front of the station."
  },
  {
    "jp": "後ろ",
    "r": "うしろ",
    "en": "behind/back",
    "cat": "directions",
    "ex": "後ろを見てください。",
    "exEn": "Please look behind you."
  },
  {
    "jp": "上",
    "r": "うえ",
    "en": "above/up/on top",
    "cat": "directions",
    "ex": "机の上に本があります。",
    "exEn": "There is a book on the desk."
  },
  {
    "jp": "下",
    "r": "した",
    "en": "below/under",
    "cat": "directions",
    "ex": "机の下に猫がいます。",
    "exEn": "There is a cat under the desk."
  },
  {
    "jp": "東",
    "r": "ひがし",
    "en": "east",
    "cat": "directions",
    "ex": "東から日が昇ります。",
    "exEn": "The sun rises from the east."
  },
  {
    "jp": "西",
    "r": "にし",
    "en": "west",
    "cat": "directions",
    "ex": "西に沈みます。",
    "exEn": "It sets in the west."
  },
  {
    "jp": "南",
    "r": "みなみ",
    "en": "south",
    "cat": "directions",
    "ex": "南の方が暖かいです。",
    "exEn": "The south is warmer."
  },
  {
    "jp": "北",
    "r": "きた",
    "en": "north",
    "cat": "directions",
    "ex": "北は寒いです。",
    "exEn": "The north is cold."
  },
  {
    "jp": "外",
    "r": "そと",
    "en": "outside",
    "cat": "directions",
    "ex": "外は寒いです。",
    "exEn": "It's cold outside."
  },
  {
    "jp": "中",
    "r": "なか",
    "en": "inside/middle",
    "cat": "directions",
    "ex": "箱の中に何がありますか？",
    "exEn": "What is inside the box?"
  },
  {
    "jp": "近く",
    "r": "ちかく",
    "en": "nearby/close",
    "cat": "directions",
    "ex": "駅の近くに住んでいます。",
    "exEn": "I live near the station."
  },
  {
    "jp": "朝",
    "r": "あさ",
    "en": "morning",
    "cat": "time",
    "ex": "朝ご飯を食べます。",
    "exEn": "I eat breakfast."
  },
  {
    "jp": "昼",
    "r": "ひる",
    "en": "noon/daytime",
    "cat": "time",
    "ex": "昼ご飯を食べます。",
    "exEn": "I eat lunch."
  },
  {
    "jp": "夜",
    "r": "よる",
    "en": "night/evening",
    "cat": "time",
    "ex": "夜に勉強します。",
    "exEn": "I study at night."
  },
  {
    "jp": "午前",
    "r": "ごぜん",
    "en": "AM/morning",
    "cat": "time",
    "ex": "午前十時です。",
    "exEn": "It is 10 AM."
  },
  {
    "jp": "午後",
    "r": "ごご",
    "en": "PM/afternoon",
    "cat": "time",
    "ex": "午後二時に会います。",
    "exEn": "We meet at 2 PM."
  },
  {
    "jp": "来週",
    "r": "らいしゅう",
    "en": "next week",
    "cat": "time",
    "ex": "来週また来ます。",
    "exEn": "I will come again next week."
  },
  {
    "jp": "先週",
    "r": "せんしゅう",
    "en": "last week",
    "cat": "time",
    "ex": "先週映画を観ました。",
    "exEn": "I watched a movie last week."
  },
  {
    "jp": "来年",
    "r": "らいねん",
    "en": "next year",
    "cat": "time",
    "ex": "来年日本に行きます。",
    "exEn": "I will go to Japan next year."
  },
  {
    "jp": "去年",
    "r": "きょねん",
    "en": "last year",
    "cat": "time",
    "ex": "去年大学を卒業しました。",
    "exEn": "I graduated last year."
  },
  {
    "jp": "洋服",
    "r": "ようふく",
    "en": "western clothes",
    "cat": "objects",
    "ex": "洋服を買いました。",
    "exEn": "I bought clothes."
  },
  {
    "jp": "靴",
    "r": "くつ",
    "en": "shoes",
    "cat": "objects",
    "ex": "新しい靴を買いました。",
    "exEn": "I bought new shoes."
  },
  {
    "jp": "財布",
    "r": "さいふ",
    "en": "wallet/purse",
    "cat": "objects",
    "ex": "財布をなくしました。",
    "exEn": "I lost my wallet."
  },
  {
    "jp": "鍵",
    "r": "かぎ",
    "en": "key/lock",
    "cat": "objects",
    "ex": "鍵をかけてください。",
    "exEn": "Please lock it."
  },
  {
    "jp": "荷物",
    "r": "にもつ",
    "en": "luggage/baggage",
    "cat": "objects",
    "ex": "荷物が重いです。",
    "exEn": "The luggage is heavy."
  },
  {
    "jp": "切手",
    "r": "きって",
    "en": "stamp (postage)",
    "cat": "objects",
    "ex": "切手を貼ります。",
    "exEn": "I put on a stamp."
  },
  {
    "jp": "地図",
    "r": "ちず",
    "en": "map",
    "cat": "objects",
    "ex": "地図を見ます。",
    "exEn": "I look at a map."
  },
  {
    "jp": "写真",
    "r": "しゃしん",
    "en": "photo/picture",
    "cat": "objects",
    "ex": "写真を撮ります。",
    "exEn": "I take a photo."
  },
  {
    "jp": "音楽",
    "r": "おんがく",
    "en": "music",
    "cat": "objects",
    "ex": "音楽を聴きます。",
    "exEn": "I listen to music."
  },
  {
    "jp": "映画",
    "r": "えいが",
    "en": "movie/film",
    "cat": "objects",
    "ex": "映画が好きです。",
    "exEn": "I like movies."
  },
  {
    "jp": "会う",
    "r": "あう",
    "en": "to meet",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": true,
    "ex": "駅で友達に会います。",
    "exEn": "I meet a friend at the station.",
    "conj": {
      "politePres": "会います",
      "politeNeg": "会いません",
      "politePast": "会いました",
      "politePastNeg": "会いませんでした",
      "te": "会って",
      "plainNeg": "会わない",
      "plainPast": "会った"
    }
  },
  {
    "jp": "開く",
    "r": "あく",
    "en": "to open (something opens)",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "ドアが静かに開きます。",
    "exEn": "The door opens quietly.",
    "conj": {
      "politePres": "開きます",
      "politeNeg": "開きません",
      "politePast": "開きました",
      "politePastNeg": "開きませんでした",
      "te": "開いて",
      "plainNeg": "開かない",
      "plainPast": "開いた"
    }
  },
  {
    "jp": "遊ぶ",
    "r": "あそぶ",
    "en": "to play",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "子供たちが公園で遊びます。",
    "exEn": "Children play in the park.",
    "conj": {
      "politePres": "遊びます",
      "politeNeg": "遊びません",
      "politePast": "遊びました",
      "politePastNeg": "遊びませんでした",
      "te": "遊んで",
      "plainNeg": "遊ばない",
      "plainPast": "遊んだ"
    }
  },
  {
    "jp": "洗う",
    "r": "あらう",
    "en": "to wash",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "食事の前に手を洗います。",
    "exEn": "I wash my hands before eating.",
    "conj": {
      "politePres": "洗います",
      "politeNeg": "洗いません",
      "politePast": "洗いました",
      "politePastNeg": "洗いませんでした",
      "te": "洗って",
      "plainNeg": "洗わない",
      "plainPast": "洗った"
    }
  },
  {
    "jp": "ある",
    "r": "ある",
    "en": "to exist / have (things)",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "机の上に辞書があります。",
    "exEn": "There is a dictionary on the desk.",
    "conj": {
      "politePres": "あります",
      "politeNeg": "ありません",
      "politePast": "ありました",
      "politePastNeg": "ありませんでした",
      "te": "あって",
      "plainNeg": "ない",
      "plainPast": "あった"
    }
  },
  {
    "jp": "歩く",
    "r": "あるく",
    "en": "to walk",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "毎朝学校まで歩きます。",
    "exEn": "I walk to school every morning.",
    "conj": {
      "politePres": "歩きます",
      "politeNeg": "歩きません",
      "politePast": "歩きました",
      "politePastNeg": "歩きませんでした",
      "te": "歩いて",
      "plainNeg": "歩かない",
      "plainPast": "歩いた"
    }
  },
  {
    "jp": "言う",
    "r": "いう",
    "en": "to say",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "先生に「おはようございます」と言います。",
    "exEn": "I say \"Good morning\" to the teacher.",
    "conj": {
      "politePres": "言います",
      "politeNeg": "言いません",
      "politePast": "言いました",
      "politePastNeg": "言いませんでした",
      "te": "言って",
      "plainNeg": "言わない",
      "plainPast": "言った"
    }
  },
  {
    "jp": "行く",
    "r": "いく",
    "en": "to go",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": true,
    "ex": "明日京都へ行きます。",
    "exEn": "I will go to Kyoto tomorrow.",
    "conj": {
      "politePres": "行きます",
      "politeNeg": "行きません",
      "politePast": "行きました",
      "politePastNeg": "行きませんでした",
      "te": "行って",
      "plainNeg": "行かない",
      "plainPast": "行った"
    }
  },
  {
    "jp": "急ぐ",
    "r": "いそぐ",
    "en": "to hurry",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "電車に遅れそうなので急ぎます。",
    "exEn": "I might be late for the train, so I hurry.",
    "conj": {
      "politePres": "急ぎます",
      "politeNeg": "急ぎません",
      "politePast": "急ぎました",
      "politePastNeg": "急ぎませんでした",
      "te": "急いで",
      "plainNeg": "急がない",
      "plainPast": "急いだ"
    }
  },
  {
    "jp": "歌う",
    "r": "うたう",
    "en": "to sing",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "みんなで日本の歌を歌います。",
    "exEn": "We sing Japanese songs together.",
    "conj": {
      "politePres": "歌います",
      "politeNeg": "歌いません",
      "politePast": "歌いました",
      "politePastNeg": "歌いませんでした",
      "te": "歌って",
      "plainNeg": "歌わない",
      "plainPast": "歌った"
    }
  },
  {
    "jp": "売る",
    "r": "うる",
    "en": "to sell",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "この店で美味しいパンを売ります。",
    "exEn": "They sell delicious bread at this store.",
    "conj": {
      "politePres": "売ります",
      "politeNeg": "売りません",
      "politePast": "売りました",
      "politePastNeg": "売りませんでした",
      "te": "売って",
      "plainNeg": "売らない",
      "plainPast": "売った"
    }
  },
  {
    "jp": "起こす",
    "r": "おこす",
    "en": "to wake someone up",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "朝7時に弟を起こします。",
    "exEn": "I wake my younger brother up at 7 in the morning.",
    "conj": {
      "politePres": "起こします",
      "politeNeg": "起こしません",
      "politePast": "起こしました",
      "politePastNeg": "起こしませんでした",
      "te": "起こして",
      "plainNeg": "起こさない",
      "plainPast": "起こした"
    }
  },
  {
    "jp": "思う",
    "r": "おもう",
    "en": "to think",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "日本語はとても面白いと思います。",
    "exEn": "I think Japanese is very interesting.",
    "conj": {
      "politePres": "思います",
      "politeNeg": "思いません",
      "politePast": "思いました",
      "politePastNeg": "思いませんでした",
      "te": "思って",
      "plainNeg": "思わない",
      "plainPast": "思った"
    }
  },
  {
    "jp": "泳ぐ",
    "r": "およぐ",
    "en": "to swim",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "夏休みに海で泳ぎます。",
    "exEn": "I swim in the ocean during summer vacation.",
    "conj": {
      "politePres": "泳ぎます",
      "politeNeg": "泳ぎません",
      "politePast": "泳ぎました",
      "politePastNeg": "泳ぎませんでした",
      "te": "泳いで",
      "plainNeg": "泳がない",
      "plainPast": "泳いだ"
    }
  },
  {
    "jp": "終わる",
    "r": "おわる",
    "en": "to finish",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "今日の授業は午後4時に終わります。",
    "exEn": "Today's classes finish at 4 PM.",
    "conj": {
      "politePres": "終わります",
      "politeNeg": "終わりません",
      "politePast": "終わりました",
      "politePastNeg": "終わりませんでした",
      "te": "終わって",
      "plainNeg": "終わらない",
      "plainPast": "終わった"
    }
  },
  {
    "jp": "買う",
    "r": "かう",
    "en": "to buy",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": true,
    "ex": "新しいノートを買います。",
    "exEn": "I will buy a new notebook.",
    "conj": {
      "politePres": "買います",
      "politeNeg": "買いません",
      "politePast": "買いました",
      "politePastNeg": "買いませんでした",
      "te": "買って",
      "plainNeg": "買わない",
      "plainPast": "買った"
    }
  },
  {
    "jp": "帰る",
    "r": "かえる",
    "en": "to return / go home",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": true,
    "ex": "いつも6時にうちへ帰ります。",
    "exEn": "I always return home at 6.",
    "conj": {
      "politePres": "帰ります",
      "politeNeg": "帰りません",
      "politePast": "帰りました",
      "politePastNeg": "帰りませんでした",
      "te": "帰って",
      "plainNeg": "帰らない",
      "plainPast": "帰った"
    }
  },
  {
    "jp": "書く",
    "r": "かく",
    "en": "to write",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": true,
    "ex": "友達に手紙を書きます。",
    "exEn": "I write a letter to a friend.",
    "conj": {
      "politePres": "書きます",
      "politeNeg": "書きません",
      "politePast": "書きました",
      "politePastNeg": "書きませんでした",
      "te": "書いて",
      "plainNeg": "書かない",
      "plainPast": "書いた"
    }
  },
  {
    "jp": "貸す",
    "r": "かす",
    "en": "to lend",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "友達に消しゴムを貸します。",
    "exEn": "I lend an eraser to a friend.",
    "conj": {
      "politePres": "貸します",
      "politeNeg": "貸しません",
      "politePast": "貸しました",
      "politePastNeg": "貸しませんでした",
      "te": "貸して",
      "plainNeg": "貸さない",
      "plainPast": "貸した"
    }
  },
  {
    "jp": "借りる",
    "r": "かりる",
    "en": "to borrow",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "図書館で本を3冊借ります。",
    "exEn": "I borrow 3 books from the library.",
    "conj": {
      "politePres": "借ります",
      "politeNeg": "借りません",
      "politePast": "借りました",
      "politePastNeg": "借りませんでした",
      "te": "借りて",
      "plainNeg": "借りない",
      "plainPast": "借りた"
    }
  },
  {
    "jp": "聞く",
    "r": "きく",
    "en": "to listen / ask",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": true,
    "ex": "日本語のラジオを聞きます。",
    "exEn": "I listen to Japanese radio.",
    "conj": {
      "politePres": "聞きます",
      "politeNeg": "聞きません",
      "politePast": "聞きました",
      "politePastNeg": "聞きませんでした",
      "te": "聞いて",
      "plainNeg": "聞かない",
      "plainPast": "聞いた"
    }
  },
  {
    "jp": "切る",
    "r": "きる",
    "en": "to cut",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "ナイフでリンゴを切ります。",
    "exEn": "I cut the apple with a knife.",
    "conj": {
      "politePres": "切ります",
      "politeNeg": "切りません",
      "politePast": "切りました",
      "politePastNeg": "切りませんでした",
      "te": "切って",
      "plainNeg": "切らない",
      "plainPast": "切った"
    }
  },
  {
    "jp": "曇る",
    "r": "くもる",
    "en": "to become cloudy",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "空がだんだん曇ってきました。",
    "exEn": "The sky is gradually becoming cloudy.",
    "conj": {
      "politePres": "曇ります",
      "politeNeg": "曇りません",
      "politePast": "曇りました",
      "politePastNeg": "曇りませんでした",
      "te": "曇って",
      "plainNeg": "曇らない",
      "plainPast": "曇った"
    }
  },
  {
    "jp": "消す",
    "r": "けす",
    "en": "to turn off / erase",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "部屋を出るときテレビを消します。",
    "exEn": "I turn off the TV when leaving the room.",
    "conj": {
      "politePres": "消します",
      "politeNeg": "消しません",
      "politePast": "消しました",
      "politePastNeg": "消しませんでした",
      "te": "消して",
      "plainNeg": "消さない",
      "plainPast": "消した"
    }
  },
  {
    "jp": "困る",
    "r": "こまる",
    "en": "to be troubled",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "財布を忘れて困りました。",
    "exEn": "I forgot my wallet and was troubled.",
    "conj": {
      "politePres": "困ります",
      "politeNeg": "困りません",
      "politePast": "困りました",
      "politePastNeg": "困りませんでした",
      "te": "困って",
      "plainNeg": "困らない",
      "plainPast": "困った"
    }
  },
  {
    "jp": "咲く",
    "r": "さく",
    "en": "to bloom",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "庭に綺麗な花が咲きました。",
    "exEn": "Pretty flowers bloomed in the garden.",
    "conj": {
      "politePres": "咲きます",
      "politeNeg": "咲きません",
      "politePast": "咲きました",
      "politePastNeg": "咲きませんでした",
      "te": "咲いて",
      "plainNeg": "咲かない",
      "plainPast": "咲いた"
    }
  },
  {
    "jp": "知る",
    "r": "しる",
    "en": "to know",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "そのニュースを知っていますか？",
    "exEn": "Do you know that news?",
    "conj": {
      "politePres": "知ります",
      "politeNeg": "知りません",
      "politePast": "知りました",
      "politePastNeg": "知りませんでした",
      "te": "知って",
      "plainNeg": "知らない",
      "plainPast": "知った"
    }
  },
  {
    "jp": "住む",
    "r": "すむ",
    "en": "to live",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "今は大阪に住んでいます。",
    "exEn": "I currently live in Osaka.",
    "conj": {
      "politePres": "住みます",
      "politeNeg": "住みません",
      "politePast": "住みました",
      "politePastNeg": "住みませんでした",
      "te": "住んで",
      "plainNeg": "住まない",
      "plainPast": "住んだ"
    }
  },
  {
    "jp": "立つ",
    "r": "たつ",
    "en": "to stand",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "電車の席を立って譲ります。",
    "exEn": "I stand up and give up my seat on the train.",
    "conj": {
      "politePres": "立ちます",
      "politeNeg": "立ちません",
      "politePast": "立ちました",
      "politePastNeg": "立ちませんでした",
      "te": "立って",
      "plainNeg": "立たない",
      "plainPast": "立った"
    }
  },
  {
    "jp": "使う",
    "r": "つかう",
    "en": "to use",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": true,
    "ex": "毎日辞書を使います。",
    "exEn": "I use a dictionary every day.",
    "conj": {
      "politePres": "使います",
      "politeNeg": "使いません",
      "politePast": "使いました",
      "politePastNeg": "使いませんでした",
      "te": "使って",
      "plainNeg": "使わない",
      "plainPast": "使った"
    }
  },
  {
    "jp": "作る",
    "r": "つくる",
    "en": "to make",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "晩ご飯にカレーを作ります。",
    "exEn": "I will make curry for dinner.",
    "conj": {
      "politePres": "作ります",
      "politeNeg": "作りません",
      "politePast": "作りました",
      "politePastNeg": "作りませんでした",
      "te": "作って",
      "plainNeg": "作らない",
      "plainPast": "作った"
    }
  },
  {
    "jp": "手伝う",
    "r": "てつだう",
    "en": "to help",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "母の料理を手伝います。",
    "exEn": "I help with my mother's cooking.",
    "conj": {
      "politePres": "手伝います",
      "politeNeg": "手伝いません",
      "politePast": "手伝いました",
      "politePastNeg": "手伝いませんでした",
      "te": "手伝って",
      "plainNeg": "手伝わない",
      "plainPast": "手伝った"
    }
  },
  {
    "jp": "飛ぶ",
    "r": "とぶ",
    "en": "to fly",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "鳥が高く空を飛びます。",
    "exEn": "Birds fly high in the sky.",
    "conj": {
      "politePres": "飛びます",
      "politeNeg": "飛びません",
      "politePast": "飛びました",
      "politePastNeg": "飛びませんでした",
      "te": "飛んで",
      "plainNeg": "飛ばない",
      "plainPast": "飛んだ"
    }
  },
  {
    "jp": "撮る",
    "r": "とる",
    "en": "to take (photo)",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "カメラで綺麗な写真を撮ります。",
    "exEn": "I take pretty photos with a camera.",
    "conj": {
      "politePres": "撮ります",
      "politeNeg": "撮りません",
      "politePast": "撮りました",
      "politePastNeg": "撮りませんでした",
      "te": "撮って",
      "plainNeg": "撮らない",
      "plainPast": "撮った"
    }
  },
  {
    "jp": "取る",
    "r": "とる",
    "en": "to take",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "棚から本を取ります。",
    "exEn": "I take a book from the shelf.",
    "conj": {
      "politePres": "取ります",
      "politeNeg": "取りません",
      "politePast": "取りました",
      "politePastNeg": "取りませんでした",
      "te": "取って",
      "plainNeg": "取らない",
      "plainPast": "取った"
    }
  },
  {
    "jp": "習う",
    "r": "ならう",
    "en": "to learn",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "先生から日本語を習います。",
    "exEn": "I learn Japanese from a teacher.",
    "conj": {
      "politePres": "習います",
      "politeNeg": "習いません",
      "politePast": "習いました",
      "politePastNeg": "習いませんでした",
      "te": "習って",
      "plainNeg": "習わない",
      "plainPast": "習った"
    }
  },
  {
    "jp": "並ぶ",
    "r": "ならぶ",
    "en": "to line up",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "チケット売り場の前に並びます。",
    "exEn": "People line up in front of the ticket counter.",
    "conj": {
      "politePres": "並びます",
      "politeNeg": "並びません",
      "politePast": "並びました",
      "politePastNeg": "並びませんでした",
      "te": "並んで",
      "plainNeg": "並ばない",
      "plainPast": "並んだ"
    }
  },
  {
    "jp": "脱ぐ",
    "r": "ぬぐ",
    "en": "to take off clothes",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "家に入ってコートを脱ぎます。",
    "exEn": "I enter the house and take off my coat.",
    "conj": {
      "politePres": "脱ぎます",
      "politeNeg": "脱ぎません",
      "politePast": "脱ぎました",
      "politePastNeg": "脱ぎませんでした",
      "te": "脱いで",
      "plainNeg": "脱がない",
      "plainPast": "脱いだ"
    }
  },
  {
    "jp": "登る",
    "r": "のぼる",
    "en": "to climb",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "夏に山へ登ります。",
    "exEn": "I climb mountains in the summer.",
    "conj": {
      "politePres": "登ります",
      "politeNeg": "登りません",
      "politePast": "登りました",
      "politePastNeg": "登りませんでした",
      "te": "登って",
      "plainNeg": "登らない",
      "plainPast": "登った"
    }
  },
  {
    "jp": "飲む",
    "r": "のむ",
    "en": "to drink",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": true,
    "ex": "温かい緑茶を飲みます。",
    "exEn": "I drink warm green tea.",
    "conj": {
      "politePres": "飲みます",
      "politeNeg": "飲みません",
      "politePast": "飲みました",
      "politePastNeg": "飲みませんでした",
      "te": "飲んで",
      "plainNeg": "飲まない",
      "plainPast": "飲んだ"
    }
  },
  {
    "jp": "入る",
    "r": "はいる",
    "en": "to enter",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "部屋に入ってください。",
    "exEn": "Please enter the room.",
    "conj": {
      "politePres": "入ります",
      "politeNeg": "入りません",
      "politePast": "入りました",
      "politePastNeg": "入りませんでした",
      "te": "入って",
      "plainNeg": "入らない",
      "plainPast": "入った"
    }
  },
  {
    "jp": "始まる",
    "r": "はじまる",
    "en": "to begin",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "朝9時に試験が始まります。",
    "exEn": "The exam begins at 9 AM.",
    "conj": {
      "politePres": "始まります",
      "politeNeg": "始まりません",
      "politePast": "始まました",
      "politePastNeg": "始まりませんでした",
      "te": "始まって",
      "plainNeg": "始まらない",
      "plainPast": "始まった"
    }
  },
  {
    "jp": "働く",
    "r": "はたらく",
    "en": "to work",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": true,
    "ex": "月曜日から金曜日まで働きます。",
    "exEn": "I work from Monday to Friday.",
    "conj": {
      "politePres": "働きます",
      "politeNeg": "働きません",
      "politePast": "働きました",
      "politePastNeg": "働きませんでした",
      "te": "働いて",
      "plainNeg": "働かない",
      "plainPast": "働いた"
    }
  },
  {
    "jp": "話す",
    "r": "はなす",
    "en": "to speak",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": true,
    "ex": "ゆっくり話してください。",
    "exEn": "Please speak slowly.",
    "conj": {
      "politePres": "話します",
      "politeNeg": "話しません",
      "politePast": "話しました",
      "politePastNeg": "話しませんでした",
      "te": "話して",
      "plainNeg": "話さない",
      "plainPast": "話した"
    }
  },
  {
    "jp": "貼る",
    "r": "はる",
    "en": "to stick / paste",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "壁にカレンダーを貼ります。",
    "exEn": "I stick a calendar on the wall.",
    "conj": {
      "politePres": "貼ります",
      "politeNeg": "貼りません",
      "politePast": "貼りました",
      "politePastNeg": "貼りませんでした",
      "te": "貼って",
      "plainNeg": "貼らない",
      "plainPast": "貼った"
    }
  },
  {
    "jp": "引く",
    "r": "ひく",
    "en": "to pull",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "ドアを強く引きます。",
    "exEn": "I pull the door firmly.",
    "conj": {
      "politePres": "引きます",
      "politeNeg": "引きません",
      "politePast": "引きました",
      "politePastNeg": "引きませんでした",
      "te": "引いて",
      "plainNeg": "引かない",
      "plainPast": "引いた"
    }
  },
  {
    "jp": "弾く",
    "r": "ひく",
    "en": "to play (instrument)",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "毎日ピアノを弾きます。",
    "exEn": "I play the piano every day.",
    "conj": {
      "politePres": "弾きます",
      "politeNeg": "弾きません",
      "politePast": "弾きました",
      "politePastNeg": "弾きませんでした",
      "te": "弾いて",
      "plainNeg": "弾かない",
      "plainPast": "弾いた"
    }
  },
  {
    "jp": "吹く",
    "r": "ふく",
    "en": "to blow",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "北風が冷たく吹きます。",
    "exEn": "The north wind blows coldly.",
    "conj": {
      "politePres": "吹きます",
      "politeNeg": "吹きません",
      "politePast": "吹きました",
      "politePastNeg": "吹きませんでした",
      "te": "吹いて",
      "plainNeg": "吹かない",
      "plainPast": "吹いた"
    }
  },
  {
    "jp": "降る",
    "r": "ふる",
    "en": "to fall (rain/snow)",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "今日は白い雪が降ります。",
    "exEn": "White snow falls today.",
    "conj": {
      "politePres": "降ります",
      "politeNeg": "降りません",
      "politePast": "降りました",
      "politePastNeg": "降りませんでした",
      "te": "降って",
      "plainNeg": "降らない",
      "plainPast": "降った"
    }
  },
  {
    "jp": "曲がる",
    "r": "まがる",
    "en": "to turn",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "信号を右へ曲がります。",
    "exEn": "Turn right at the traffic light.",
    "conj": {
      "politePres": "曲がります",
      "politeNeg": "曲がりません",
      "politePast": "曲がりました",
      "politePastNeg": "曲がりませんでした",
      "te": "曲がって",
      "plainNeg": "曲がらない",
      "plainPast": "曲がった"
    }
  },
  {
    "jp": "待つ",
    "r": "まつ",
    "en": "to wait",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": true,
    "ex": "バス停で10分待ちました。",
    "exEn": "I waited 10 minutes at the bus stop.",
    "conj": {
      "politePres": "待ちます",
      "politeNeg": "待ちません",
      "politePast": "待ちました",
      "politePastNeg": "待ちませんでした",
      "te": "待って",
      "plainNeg": "待たない",
      "plainPast": "待った"
    }
  },
  {
    "jp": "持つ",
    "r": "もつ",
    "en": "to hold / have",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "重いかばんを持ちます。",
    "exEn": "I hold the heavy bag.",
    "conj": {
      "politePres": "持ちます",
      "politeNeg": "持ちません",
      "politePast": "持ちました",
      "politePastNeg": "持ちませんでした",
      "te": "持って",
      "plainNeg": "持たない",
      "plainPast": "持った"
    }
  },
  {
    "jp": "休む",
    "r": "やすむ",
    "en": "to rest / take a day off",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": true,
    "ex": "日曜日はゆっくり休みます。",
    "exEn": "I rest leisurely on Sundays.",
    "conj": {
      "politePres": "休みます",
      "politeNeg": "休みません",
      "politePast": "休みました",
      "politePastNeg": "休みませんでした",
      "te": "休んで",
      "plainNeg": "休まない",
      "plainPast": "休んだ"
    }
  },
  {
    "jp": "呼ぶ",
    "r": "よぶ",
    "en": "to call / invite",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "タクシーを呼びましょう。",
    "exEn": "Let's call a taxi.",
    "conj": {
      "politePres": "呼びます",
      "politeNeg": "呼びません",
      "politePast": "呼びました",
      "politePastNeg": "呼びませんでした",
      "te": "呼んで",
      "plainNeg": "呼ばない",
      "plainPast": "呼んだ"
    }
  },
  {
    "jp": "読む",
    "r": "よむ",
    "en": "to read",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": true,
    "ex": "毎晩日本の本を読みます。",
    "exEn": "I read Japanese books every night.",
    "conj": {
      "politePres": "読みます",
      "politeNeg": "読みません",
      "politePast": "読みました",
      "politePastNeg": "読みませんでした",
      "te": "読んで",
      "plainNeg": "読まない",
      "plainPast": "読んだ"
    }
  },
  {
    "jp": "分かる",
    "r": "わかる",
    "en": "to understand",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": true,
    "ex": "先生の質問がよく分かります。",
    "exEn": "I understand the teacher's question well.",
    "conj": {
      "politePres": "分かります",
      "politeNeg": "分かりません",
      "politePast": "分かりました",
      "politePastNeg": "分かりませんでした",
      "te": "分かって",
      "plainNeg": "分からない",
      "plainPast": "分かった"
    }
  },
  {
    "jp": "渡る",
    "r": "わたる",
    "en": "to cross",
    "cat": "verbs",
    "sub": "Group 1 — う-verbs (Godan)",
    "group": 1,
    "core": false,
    "ex": "気をつけて橋を渡ります。",
    "exEn": "I cross the bridge carefully.",
    "conj": {
      "politePres": "渡ります",
      "politeNeg": "渡りません",
      "politePast": "渡りました",
      "politePastNeg": "渡りませんでした",
      "te": "渡って",
      "plainNeg": "渡らない",
      "plainPast": "渡った"
    }
  },
  {
    "jp": "開ける",
    "r": "あける",
    "en": "to open",
    "cat": "verbs",
    "sub": "Group 2 — る-verbs (Ichidan)",
    "group": 2,
    "core": false,
    "ex": "窓を開けてください。",
    "exEn": "Please open the window.",
    "conj": {
      "politePres": "開けます",
      "politeNeg": "開けません",
      "politePast": "開けました",
      "politePastNeg": "開けませんでした",
      "te": "開けて",
      "plainNeg": "開けない",
      "plainPast": "開けた"
    }
  },
  {
    "jp": "あげる",
    "r": "あげる",
    "en": "to give",
    "cat": "verbs",
    "sub": "Group 2 — る-verbs (Ichidan)",
    "group": 2,
    "core": false,
    "ex": "友達に誕生日プレゼントをあげます。",
    "exEn": "I give a birthday present to my friend.",
    "conj": {
      "politePres": "あげます",
      "politeNeg": "あげません",
      "politePast": "あげました",
      "politePastNeg": "あげませんでした",
      "te": "あげて",
      "plainNeg": "あげない",
      "plainPast": "あげた"
    }
  },
  {
    "jp": "集める",
    "r": "あつめる",
    "en": "to collect",
    "cat": "verbs",
    "sub": "Group 2 — る-verbs (Ichidan)",
    "group": 2,
    "core": false,
    "ex": "切手やコインを集めています。",
    "exEn": "I collect stamps and coins.",
    "conj": {
      "politePres": "集めます",
      "politeNeg": "集めません",
      "politePast": "集めました",
      "politePastNeg": "集めませんでした",
      "te": "集めて",
      "plainNeg": "集めない",
      "plainPast": "集めた"
    }
  },
  {
    "jp": "入れる",
    "r": "いれる",
    "en": "to put in",
    "cat": "verbs",
    "sub": "Group 2 — る-verbs (Ichidan)",
    "group": 2,
    "core": false,
    "ex": "お茶に砂糖を入れます。",
    "exEn": "I put sugar into the tea.",
    "conj": {
      "politePres": "入れます",
      "politeNeg": "入れません",
      "politePast": "入れました",
      "politePastNeg": "入れませんでした",
      "te": "入れて",
      "plainNeg": "入れない",
      "plainPast": "入れた"
    }
  },
  {
    "jp": "起きる",
    "r": "おきる",
    "en": "to wake up",
    "cat": "verbs",
    "sub": "Group 2 — る-verbs (Ichidan)",
    "group": 2,
    "core": true,
    "ex": "毎朝6時に起きます。",
    "exEn": "I wake up at 6 every morning.",
    "conj": {
      "politePres": "起きます",
      "politeNeg": "起きません",
      "politePast": "起きました",
      "politePastNeg": "起きませんでした",
      "te": "起きて",
      "plainNeg": "起きない",
      "plainPast": "起きた"
    }
  },
  {
    "jp": "教える",
    "r": "おしえる",
    "en": "to teach / tell",
    "cat": "verbs",
    "sub": "Group 2 — る-verbs (Ichidan)",
    "group": 2,
    "core": false,
    "ex": "先生が文法を教えます。",
    "exEn": "The teacher teaches grammar.",
    "conj": {
      "politePres": "教えます",
      "politeNeg": "教えません",
      "politePast": "教えました",
      "politePastNeg": "教えませんでした",
      "te": "教えて",
      "plainNeg": "教えない",
      "plainPast": "教えた"
    }
  },
  {
    "jp": "覚える",
    "r": "おぼえる",
    "en": "to remember / memorize",
    "cat": "verbs",
    "sub": "Group 2 — る-verbs (Ichidan)",
    "group": 2,
    "core": false,
    "ex": "今週新しい言葉を覚えます。",
    "exEn": "I memorize new vocabulary this week.",
    "conj": {
      "politePres": "覚えます",
      "politeNeg": "覚えません",
      "politePast": "覚えました",
      "politePastNeg": "覚えませんでした",
      "te": "覚えて",
      "plainNeg": "覚えない",
      "plainPast": "覚えた"
    }
  },
  {
    "jp": "降りる",
    "r": "おりる",
    "en": "to get off",
    "cat": "verbs",
    "sub": "Group 2 — る-verbs (Ichidan)",
    "group": 2,
    "core": false,
    "ex": "新宿駅で電車を降ります。",
    "exEn": "I get off the train at Shinjuku Station.",
    "conj": {
      "politePres": "降ります",
      "politeNeg": "降りません",
      "politePast": "降りました",
      "politePastNeg": "降りませんでした",
      "te": "降りて",
      "plainNeg": "降りない",
      "plainPast": "降りた"
    }
  },
  {
    "jp": "借りる",
    "r": "かりる",
    "en": "to borrow",
    "cat": "verbs",
    "sub": "Group 2 — る-verbs (Ichidan)",
    "group": 2,
    "core": false,
    "ex": "友達から消しゴムを借りました。",
    "exEn": "I borrowed an eraser from my friend.",
    "conj": {
      "politePres": "借ります",
      "politeNeg": "借りません",
      "politePast": "借りました",
      "politePastNeg": "借りませんでした",
      "te": "借りて",
      "plainNeg": "借りない",
      "plainPast": "借りた"
    }
  },
  {
    "jp": "着る",
    "r": "きる",
    "en": "to wear",
    "cat": "verbs",
    "sub": "Group 2 — る-verbs (Ichidan)",
    "group": 2,
    "core": false,
    "ex": "新しいジャケットを着ます。",
    "exEn": "I wear a new jacket.",
    "conj": {
      "politePres": "着ます",
      "politeNeg": "着ません",
      "politePast": "着ました",
      "politePastNeg": "着ませんでした",
      "te": "着て",
      "plainNeg": "着ない",
      "plainPast": "着た"
    }
  },
  {
    "jp": "閉める",
    "r": "しめる",
    "en": "to close",
    "cat": "verbs",
    "sub": "Group 2 — る-verbs (Ichidan)",
    "group": 2,
    "core": false,
    "ex": "寒いので窓を閉めます。",
    "exEn": "Because it is cold, I close the window.",
    "conj": {
      "politePres": "閉めます",
      "politeNeg": "閉めません",
      "politePast": "閉めました",
      "politePastNeg": "閉めませんでした",
      "te": "閉めて",
      "plainNeg": "閉めない",
      "plainPast": "閉めた"
    }
  },
  {
    "jp": "食べる",
    "r": "たべる",
    "en": "to eat",
    "cat": "verbs",
    "sub": "Group 2 — る-verbs (Ichidan)",
    "group": 2,
    "core": true,
    "ex": "昼ご飯に寿司を食べます。",
    "exEn": "I eat sushi for lunch.",
    "conj": {
      "politePres": "食べます",
      "politeNeg": "食べません",
      "politePast": "食べました",
      "politePastNeg": "食べませんでした",
      "te": "食べて",
      "plainNeg": "食べない",
      "plainPast": "食べた"
    }
  },
  {
    "jp": "出る",
    "r": "でる",
    "en": "to leave / come out",
    "cat": "verbs",
    "sub": "Group 2 — る-verbs (Ichidan)",
    "group": 2,
    "core": false,
    "ex": "毎朝7時半に家を出ます。",
    "exEn": "I leave home at 7:30 every morning.",
    "conj": {
      "politePres": "出ます",
      "politeNeg": "出ません",
      "politePast": "出ました",
      "politePastNeg": "出ませんでした",
      "te": "出て",
      "plainNeg": "出ない",
      "plainPast": "出た"
    }
  },
  {
    "jp": "寝る",
    "r": "ねる",
    "en": "to sleep",
    "cat": "verbs",
    "sub": "Group 2 — る-verbs (Ichidan)",
    "group": 2,
    "core": true,
    "ex": "夜11時に寝ます。",
    "exEn": "I go to sleep at 11 PM.",
    "conj": {
      "politePres": "寝ます",
      "politeNeg": "寝ません",
      "politePast": "寝ました",
      "politePastNeg": "寝ませんでした",
      "te": "寝て",
      "plainNeg": "寝ない",
      "plainPast": "寝た"
    }
  },
  {
    "jp": "始める",
    "r": "はじめる",
    "en": "to start",
    "cat": "verbs",
    "sub": "Group 2 — る-verbs (Ichidan)",
    "group": 2,
    "core": false,
    "ex": "勉強を始めましょう。",
    "exEn": "Let's start studying.",
    "conj": {
      "politePres": "始めます",
      "politeNeg": "始めません",
      "politePast": "始めました",
      "politePastNeg": "始めませんでした",
      "te": "始めて",
      "plainNeg": "始めない",
      "plainPast": "始めた"
    }
  },
  {
    "jp": "見せる",
    "r": "みせる",
    "en": "to show",
    "cat": "verbs",
    "sub": "Group 2 — る-verbs (Ichidan)",
    "group": 2,
    "core": false,
    "ex": "旅行の写真を見せてください。",
    "exEn": "Please show me the travel photos.",
    "conj": {
      "politePres": "見せます",
      "politeNeg": "見せません",
      "politePast": "見せました",
      "politePastNeg": "見せませんでした",
      "te": "見せて",
      "plainNeg": "見せない",
      "plainPast": "見せた"
    }
  },
  {
    "jp": "見る",
    "r": "みる",
    "en": "to see / watch",
    "cat": "verbs",
    "sub": "Group 2 — る-verbs (Ichidan)",
    "group": 2,
    "core": true,
    "ex": "夜テレビで映画を見ます。",
    "exEn": "I watch movies on TV at night.",
    "conj": {
      "politePres": "見ます",
      "politeNeg": "見ません",
      "politePast": "見ました",
      "politePastNeg": "見ませんでした",
      "te": "見て",
      "plainNeg": "見ない",
      "plainPast": "見た"
    }
  },
  {
    "jp": "忘れる",
    "r": "わすれる",
    "en": "to forget",
    "cat": "verbs",
    "sub": "Group 2 — る-verbs (Ichidan)",
    "group": 2,
    "core": false,
    "ex": "宿題を忘れないでください。",
    "exEn": "Please do not forget the homework.",
    "conj": {
      "politePres": "忘れます",
      "politeNeg": "忘れません",
      "politePast": "忘れました",
      "politePastNeg": "忘れませんでした",
      "te": "忘れて",
      "plainNeg": "忘れない",
      "plainPast": "忘れた"
    }
  },
  {
    "jp": "する",
    "r": "する",
    "en": "to do",
    "cat": "verbs",
    "sub": "Irregular verbs",
    "group": 3,
    "core": true,
    "ex": "毎日日本語の復習をします。",
    "exEn": "I review Japanese every day.",
    "conj": {
      "politePres": "します",
      "politeNeg": "しません",
      "politePast": "しました",
      "politePastNeg": "しませんでした",
      "te": "して",
      "plainNeg": "しない",
      "plainPast": "した"
    }
  },
  {
    "jp": "来る",
    "r": "くる",
    "en": "to come",
    "cat": "verbs",
    "sub": "Irregular verbs",
    "group": 3,
    "core": true,
    "ex": "友達が日本へ来ます。",
    "exEn": "My friend comes to Japan.",
    "conj": {
      "politePres": "来ます (きます)",
      "politeNeg": "来ません (きません)",
      "politePast": "来ました (きました)",
      "politePastNeg": "来ませんでした (きませんでした)",
      "te": "来て (きて)",
      "plainNeg": "来ない (こない)",
      "plainPast": "来た (きた)"
    }
  },
  {
    "jp": "勉強する",
    "r": "べんきょうする",
    "en": "to study",
    "cat": "verbs",
    "sub": "Irregular verbs",
    "group": 3,
    "core": false,
    "ex": "図書館で試験の勉強をします。",
    "exEn": "I study for the exam in the library.",
    "conj": {
      "politePres": "勉強します",
      "politeNeg": "勉強しません",
      "politePast": "勉強しました",
      "politePastNeg": "勉強しませんでした",
      "te": "勉強して",
      "plainNeg": "勉強しない",
      "plainPast": "勉強した"
    }
  },
  {
    "jp": "掃除する",
    "r": "そうじする",
    "en": "to clean",
    "cat": "verbs",
    "sub": "Irregular verbs",
    "group": 3,
    "core": false,
    "ex": "土曜日に部屋をきれいに掃除します。",
    "exEn": "I clean my room nicely on Saturday.",
    "conj": {
      "politePres": "掃除します",
      "politeNeg": "掃除しません",
      "politePast": "掃除しました",
      "politePastNeg": "掃除しませんでした",
      "te": "掃除して",
      "plainNeg": "掃除しない",
      "plainPast": "掃除した"
    }
  },
  {
    "jp": "洗濯する",
    "r": "せんたくする",
    "en": "to do laundry",
    "cat": "verbs",
    "sub": "Irregular verbs",
    "group": 3,
    "core": false,
    "ex": "週末に服をたくさん洗濯します。",
    "exEn": "I do lots of laundry on the weekend.",
    "conj": {
      "politePres": "洗濯します",
      "politeNeg": "洗濯しません",
      "politePast": "洗濯しました",
      "politePastNeg": "洗濯しませんでした",
      "te": "洗濯して",
      "plainNeg": "洗濯しない",
      "plainPast": "洗濯した"
    }
  },
  {
    "jp": "料理する",
    "r": "りょうりする",
    "en": "to cook",
    "cat": "verbs",
    "sub": "Irregular verbs",
    "group": 3,
    "core": false,
    "ex": "日本の料理を料理します。",
    "exEn": "I cook Japanese dishes.",
    "conj": {
      "politePres": "料理します",
      "politeNeg": "料理しません",
      "politePast": "料理しました",
      "politePastNeg": "料理しませんでした",
      "te": "料理して",
      "plainNeg": "料理しない",
      "plainPast": "料理した"
    }
  },
  {
    "jp": "電話する",
    "r": "でんわする",
    "en": "to telephone",
    "cat": "verbs",
    "sub": "Irregular verbs",
    "group": 3,
    "core": false,
    "ex": "先生に電話をします。",
    "exEn": "I telephone the teacher.",
    "conj": {
      "politePres": "電話します",
      "politeNeg": "電話しません",
      "politePast": "電話しました",
      "politePastNeg": "電話しませんでした",
      "te": "電話して",
      "plainNeg": "電話しない",
      "plainPast": "電話した"
    }
  },
  {
    "jp": "買い物する",
    "r": "かいものする",
    "en": "to go shopping",
    "cat": "verbs",
    "sub": "Irregular verbs",
    "group": 3,
    "core": false,
    "ex": "スーパーで野菜を買い物します。",
    "exEn": "I shop for vegetables at the supermarket.",
    "conj": {
      "politePres": "買い物します",
      "politeNeg": "買い物しません",
      "politePast": "買い物しました",
      "politePastNeg": "買い物しませんでした",
      "te": "買い物して",
      "plainNeg": "買い物しない",
      "plainPast": "買い物した"
    }
  },
  {
    "jp": "散歩する",
    "r": "さんぽする",
    "en": "to take a walk",
    "cat": "verbs",
    "sub": "Irregular verbs",
    "group": 3,
    "core": false,
    "ex": "朝、川の近くを散歩します。",
    "exEn": "In the morning, I take a walk near the river.",
    "conj": {
      "politePres": "散歩します",
      "politeNeg": "散歩しません",
      "politePast": "散歩しました",
      "politePastNeg": "散歩しませんでした",
      "te": "散歩して",
      "plainNeg": "散歩しない",
      "plainPast": "散歩した"
    }
  },
  {
    "jp": "結婚する",
    "r": "けっこんする",
    "en": "to marry",
    "cat": "verbs",
    "sub": "Irregular verbs",
    "group": 3,
    "core": false,
    "ex": "二人は来年結婚します。",
    "exEn": "The two will marry next year.",
    "conj": {
      "politePres": "結婚します",
      "politeNeg": "結婚しません",
      "politePast": "結婚しました",
      "politePastNeg": "結婚しませんでした",
      "te": "結婚して",
      "plainNeg": "結婚しない",
      "plainPast": "結婚した"
    }
  },
  {
    "jp": "大きい",
    "r": "おおきい",
    "en": "big",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "この象はとても大きいです。",
    "exEn": "This elephant is very big.",
    "conj": {
      "presAff": "大きいです",
      "presNeg": "大きくないです",
      "pastAff": "大きかったです",
      "pastNeg": "大きくなかったです"
    }
  },
  {
    "jp": "小さい",
    "r": "ちいさい",
    "en": "small",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "小さい猫がいます。",
    "exEn": "There is a small cat.",
    "conj": {
      "presAff": "小さいです",
      "presNeg": "小さくないです",
      "pastAff": "小さかったです",
      "pastNeg": "小さくなかったです"
    }
  },
  {
    "jp": "新しい",
    "r": "あたらしい",
    "en": "new",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "新しい車を買いました。",
    "exEn": "I bought a new car.",
    "conj": {
      "presAff": "新しいです",
      "presNeg": "新しくないです",
      "pastAff": "新しかったです",
      "pastNeg": "新しくなかったです"
    }
  },
  {
    "jp": "古い",
    "r": "ふるい",
    "en": "old",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "この建物は古いです。",
    "exEn": "This building is old.",
    "conj": {
      "presAff": "古いです",
      "presNeg": "古くないです",
      "pastAff": "古かったです",
      "pastNeg": "古くなかったです"
    }
  },
  {
    "jp": "良い",
    "r": "いい / よい",
    "en": "good",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "note": "Irregular: いい/よい → よくない、よかった、よくなかった",
    "ex": "今日は天気が良いです。",
    "exEn": "The weather is good today.",
    "conj": {
      "presAff": "いいです / よいです",
      "presNeg": "よくないです",
      "pastAff": "よかったです",
      "pastNeg": "よくなかったです"
    }
  },
  {
    "jp": "悪い",
    "r": "わるい",
    "en": "bad",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "天気が悪いです。",
    "exEn": "The weather is bad.",
    "conj": {
      "presAff": "悪いです",
      "presNeg": "悪くないです",
      "pastAff": "悪かったです",
      "pastNeg": "悪くなかったです"
    }
  },
  {
    "jp": "高い",
    "r": "たかい",
    "en": "expensive / high / tall",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "富士山は高くて美しいです。",
    "exEn": "Mt. Fuji is high and beautiful.",
    "conj": {
      "presAff": "高いです",
      "presNeg": "高くないです",
      "pastAff": "高かったです",
      "pastNeg": "高くなかったです"
    }
  },
  {
    "jp": "安い",
    "r": "やすい",
    "en": "cheap",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "この店の商品はとても安いです。",
    "exEn": "The products at this store are very cheap.",
    "conj": {
      "presAff": "安いです",
      "presNeg": "安くないです",
      "pastAff": "安かったです",
      "pastNeg": "安くなかったです"
    }
  },
  {
    "jp": "長い",
    "r": "ながい",
    "en": "long",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "夏休みは長いです。",
    "exEn": "Summer vacation is long.",
    "conj": {
      "presAff": "長いです",
      "presNeg": "長くないです",
      "pastAff": "長かったです",
      "pastNeg": "長くなかったです"
    }
  },
  {
    "jp": "短い",
    "r": "みじかい",
    "en": "short",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "冬の日は短いです。",
    "exEn": "Winter days are short.",
    "conj": {
      "presAff": "短いです",
      "presNeg": "短くないです",
      "pastAff": "短かったです",
      "pastNeg": "短くなかったです"
    }
  },
  {
    "jp": "多い",
    "r": "おおい",
    "en": "many",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "東京は人が多いです。",
    "exEn": "There are many people in Tokyo.",
    "conj": {
      "presAff": "多いです",
      "presNeg": "多くないです",
      "pastAff": "多かったです",
      "pastNeg": "多くなかったです"
    }
  },
  {
    "jp": "少ない",
    "r": "すくない",
    "en": "few / little",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "今週は雨が少ないです。",
    "exEn": "There is little rain this week.",
    "conj": {
      "presAff": "少ないです",
      "presNeg": "少くないです",
      "pastAff": "少なかったです",
      "pastNeg": "少なくなかったです"
    }
  },
  {
    "jp": "近い",
    "r": "ちかい",
    "en": "near",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "家から駅まで近いです。",
    "exEn": "It is near from my house to the station.",
    "conj": {
      "presAff": "近いです",
      "presNeg": "近くないです",
      "pastAff": "近かったです",
      "pastNeg": "近くなかったです"
    }
  },
  {
    "jp": "遠い",
    "r": "とおい",
    "en": "far",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "学校はここから遠いです。",
    "exEn": "The school is far from here.",
    "conj": {
      "presAff": "遠いです",
      "presNeg": "遠くないです",
      "pastAff": "遠かったです",
      "pastNeg": "遠くなかったです"
    }
  },
  {
    "jp": "重い",
    "r": "おもい",
    "en": "heavy",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "この荷物はとても重いです。",
    "exEn": "This luggage is very heavy.",
    "conj": {
      "presAff": "重いです",
      "presNeg": "重くないです",
      "pastAff": "重かったです",
      "pastNeg": "重くなかったです"
    }
  },
  {
    "jp": "軽い",
    "r": "かるい",
    "en": "light",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "この鞄は軽くて便利です。",
    "exEn": "This bag is light and convenient.",
    "conj": {
      "presAff": "軽いです",
      "presNeg": "軽くないです",
      "pastAff": "軽かったです",
      "pastNeg": "軽くなかったです"
    }
  },
  {
    "jp": "早い",
    "r": "はやい",
    "en": "early",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "今朝は早く起きました。",
    "exEn": "I woke up early this morning.",
    "conj": {
      "presAff": "早いです",
      "presNeg": "早くないです",
      "pastAff": "早かったです",
      "pastNeg": "早くなかったです"
    }
  },
  {
    "jp": "速い",
    "r": "はやい",
    "en": "fast",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "新幹線はとても速いです。",
    "exEn": "The bullet train is very fast.",
    "conj": {
      "presAff": "速いです",
      "presNeg": "速くないです",
      "pastAff": "速かったです",
      "pastNeg": "速くなかったです"
    }
  },
  {
    "jp": "遅い",
    "r": "おそい",
    "en": "late / slow",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "バスが遅いです。",
    "exEn": "The bus is slow.",
    "conj": {
      "presAff": "遅いです",
      "presNeg": "遅くないです",
      "pastAff": "遅かったです",
      "pastNeg": "遅くなかったです"
    }
  },
  {
    "jp": "暑い",
    "r": "あつい",
    "en": "hot (weather)",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "日本の夏はとても暑いです。",
    "exEn": "Japanese summer is very hot.",
    "conj": {
      "presAff": "暑いです",
      "presNeg": "暑くないです",
      "pastAff": "暑かったです",
      "pastNeg": "暑くなかったです"
    }
  },
  {
    "jp": "寒い",
    "r": "さむい",
    "en": "cold (weather)",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "今日は風が強くて寒いです。",
    "exEn": "The wind is strong and it is cold today.",
    "conj": {
      "presAff": "寒いです",
      "presNeg": "寒くないです",
      "pastAff": "寒かったです",
      "pastNeg": "寒くなかったです"
    }
  },
  {
    "jp": "熱い",
    "r": "あつい",
    "en": "hot (object/drink)",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "熱いお茶を飲みます。",
    "exEn": "I drink hot green tea.",
    "conj": {
      "presAff": "熱いです",
      "presNeg": "熱くないです",
      "pastAff": "熱かったです",
      "pastNeg": "熱くなかったです"
    }
  },
  {
    "jp": "冷たい",
    "r": "つめたい",
    "en": "cold (touch/drink)",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "冷たい水をください。",
    "exEn": "Please give me cold water.",
    "conj": {
      "presAff": "冷たいです",
      "presNeg": "冷たくないです",
      "pastAff": "冷たかったです",
      "pastNeg": "冷たくなかったです"
    }
  },
  {
    "jp": "温かい",
    "r": "あたたかい",
    "en": "warm",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "春は温かくて気持ちいいです。",
    "exEn": "Spring is warm and pleasant.",
    "conj": {
      "presAff": "温かいです",
      "presNeg": "温かくないです",
      "pastAff": "温かかったです",
      "pastNeg": "温かくなかったです"
    }
  },
  {
    "jp": "広い",
    "r": "ひろい",
    "en": "spacious / wide",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "この公園はとても広いです。",
    "exEn": "This park is very spacious.",
    "conj": {
      "presAff": "広いです",
      "presNeg": "広くないです",
      "pastAff": "広かったです",
      "pastNeg": "広くなかったです"
    }
  },
  {
    "jp": "狭い",
    "r": "せまい",
    "en": "narrow / small",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "私の部屋は少し狭いです。",
    "exEn": "My room is a little small.",
    "conj": {
      "presAff": "狭いです",
      "presNeg": "狭くないです",
      "pastAff": "狭かったです",
      "pastNeg": "狭くなかったです"
    }
  },
  {
    "jp": "明るい",
    "r": "あかるい",
    "en": "bright",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "この教室は窓が多くて明るいです。",
    "exEn": "This classroom has many windows and is bright.",
    "conj": {
      "presAff": "明るいです",
      "presNeg": "明るくないです",
      "pastAff": "明るかったです",
      "pastNeg": "明るくなかったです"
    }
  },
  {
    "jp": "暗い",
    "r": "くらい",
    "en": "dark",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "夜の道は暗いです。",
    "exEn": "The road at night is dark.",
    "conj": {
      "presAff": "暗いです",
      "presNeg": "暗くないです",
      "pastAff": "暗かったです",
      "pastNeg": "暗くなかったです"
    }
  },
  {
    "jp": "楽しい",
    "r": "たのしい",
    "en": "enjoyable",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "友達と旅行するのは楽しいです。",
    "exEn": "Traveling with friends is enjoyable.",
    "conj": {
      "presAff": "楽しいです",
      "presNeg": "楽しくないです",
      "pastAff": "楽しかったです",
      "pastNeg": "楽しくなかったです"
    }
  },
  {
    "jp": "面白い",
    "r": "おもしろい",
    "en": "interesting / funny",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "この本はとても面白いです。",
    "exEn": "This book is very interesting.",
    "conj": {
      "presAff": "面白いです",
      "presNeg": "面白くないです",
      "pastAff": "面白かったです",
      "pastNeg": "面白くなかったです"
    }
  },
  {
    "jp": "つまらない",
    "r": "つまらない",
    "en": "boring",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "昨日の映画はつまらなかったです。",
    "exEn": "Yesterday's movie was boring.",
    "conj": {
      "presAff": "つまらないです",
      "presNeg": "つまらなくないです",
      "pastAff": "つまらなかったです",
      "pastNeg": "つまらなくなかったです"
    }
  },
  {
    "jp": "難しい",
    "r": "むずかしい",
    "en": "difficult",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "この漢字は少し難しいです。",
    "exEn": "This kanji is a little difficult.",
    "conj": {
      "presAff": "難しいです",
      "presNeg": "難しくないです",
      "pastAff": "難しかったです",
      "pastNeg": "難しくなかったです"
    }
  },
  {
    "jp": "易しい",
    "r": "やさしい",
    "en": "easy",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "note": "易しい (やさしい) = easy; vs 優しい (やさしい) = kind / gentle",
    "ex": "今日のテストは易しかったです。",
    "exEn": "Today's test was easy.",
    "conj": {
      "presAff": "易しいです",
      "presNeg": "易しくないです",
      "pastAff": "易しかったです",
      "pastNeg": "易しくなかったです"
    }
  },
  {
    "jp": "忙しい",
    "r": "いそがしい",
    "en": "busy",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "今週は仕事で忙しいです。",
    "exEn": "I am busy with work this week.",
    "conj": {
      "presAff": "忙しいです",
      "presNeg": "忙しくないです",
      "pastAff": "忙しかったです",
      "pastNeg": "忙しくなかったです"
    }
  },
  {
    "jp": "眠い",
    "r": "ねむい",
    "en": "sleepy",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "夜遅くまで起きていたので眠いです。",
    "exEn": "I was up late, so I am sleepy.",
    "conj": {
      "presAff": "眠いです",
      "presNeg": "眠くないです",
      "pastAff": "眠かったです",
      "pastNeg": "眠くなかったです"
    }
  },
  {
    "jp": "痛い",
    "r": "いたい",
    "en": "painful",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "頭が少し痛いです。",
    "exEn": "My head hurts a little.",
    "conj": {
      "presAff": "痛いです",
      "presNeg": "痛くないです",
      "pastAff": "痛かったです",
      "pastNeg": "痛くなかったです"
    }
  },
  {
    "jp": "美味しい",
    "r": "おいしい",
    "en": "delicious",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "母の手料理はとても美味しいです。",
    "exEn": "My mother's home cooking is very delicious.",
    "conj": {
      "presAff": "美味しいです",
      "presNeg": "美味しくないです",
      "pastAff": "美味しかったです",
      "pastNeg": "美味しくなかったです"
    }
  },
  {
    "jp": "まずい",
    "r": "まずい",
    "en": "bad-tasting",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "薬はまずいですが、飲みます。",
    "exEn": "The medicine tastes bad, but I take it.",
    "conj": {
      "presAff": "まずいです",
      "presNeg": "まずくないです",
      "pastAff": "まずかったです",
      "pastNeg": "まずくなかったです"
    }
  },
  {
    "jp": "可愛い",
    "r": "かわいい",
    "en": "cute",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "あの子犬はとても可愛いです。",
    "exEn": "That puppy is very cute.",
    "conj": {
      "presAff": "可愛いです",
      "presNeg": "可愛くないです",
      "pastAff": "可愛かったです",
      "pastNeg": "可愛くなかったです"
    }
  },
  {
    "jp": "汚い",
    "r": "きたない",
    "en": "dirty",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "靴が雨で汚くなりました。",
    "exEn": "My shoes became dirty from the rain.",
    "conj": {
      "presAff": "汚いです",
      "presNeg": "汚くないです",
      "pastAff": "汚かったです",
      "pastNeg": "汚くなかったです"
    }
  },
  {
    "jp": "甘い",
    "r": "あまい",
    "en": "sweet",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "このケーキは甘くて美味しいです。",
    "exEn": "This cake is sweet and delicious.",
    "conj": {
      "presAff": "甘いです",
      "presNeg": "甘くないです",
      "pastAff": "甘かったです",
      "pastNeg": "甘くなかったです"
    }
  },
  {
    "jp": "辛い",
    "r": "からい",
    "en": "spicy",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "このカレーは少し辛いです。",
    "exEn": "This curry is a little spicy.",
    "conj": {
      "presAff": "辛いです",
      "presNeg": "辛くないです",
      "pastAff": "辛かったです",
      "pastNeg": "辛くなかったです"
    }
  },
  {
    "jp": "白い",
    "r": "しろい",
    "en": "white",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "白いシャツを着ています。",
    "exEn": "I am wearing a white shirt.",
    "conj": {
      "presAff": "白いです",
      "presNeg": "白くないです",
      "pastAff": "白かったです",
      "pastNeg": "白くなかったです"
    }
  },
  {
    "jp": "黒い",
    "r": "くろい",
    "en": "black",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "黒い猫が道を渡りました。",
    "exEn": "A black cat crossed the street.",
    "conj": {
      "presAff": "黒いです",
      "presNeg": "黒くないです",
      "pastAff": "黒かったです",
      "pastNeg": "黒くなかったです"
    }
  },
  {
    "jp": "赤い",
    "r": "あかい",
    "en": "red",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "赤くて甘いリンゴを食べました。",
    "exEn": "I ate a red and sweet apple.",
    "conj": {
      "presAff": "赤いです",
      "presNeg": "赤くないです",
      "pastAff": "赤かったです",
      "pastNeg": "赤くなかったです"
    }
  },
  {
    "jp": "青い",
    "r": "あおい",
    "en": "blue",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "青い空がとても綺麗です。",
    "exEn": "The blue sky is very beautiful.",
    "conj": {
      "presAff": "青いです",
      "presNeg": "青くないです",
      "pastAff": "青かったです",
      "pastNeg": "青くなかったです"
    }
  },
  {
    "jp": "丸い",
    "r": "まるい",
    "en": "round",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "丸いお盆にお茶を置きます。",
    "exEn": "I place the tea on the round tray.",
    "conj": {
      "presAff": "丸いです",
      "presNeg": "丸くないです",
      "pastAff": "丸かったです",
      "pastNeg": "丸くなかったです"
    }
  },
  {
    "jp": "若い",
    "r": "わかい",
    "en": "young",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "その先生は若くて元気です。",
    "exEn": "That teacher is young and energetic.",
    "conj": {
      "presAff": "若いです",
      "presNeg": "若くないです",
      "pastAff": "若かったです",
      "pastNeg": "若くなかったです"
    }
  },
  {
    "jp": "強い",
    "r": "つよい",
    "en": "strong",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "強い風が吹いています。",
    "exEn": "A strong wind is blowing.",
    "conj": {
      "presAff": "強いです",
      "presNeg": "強くないです",
      "pastAff": "強かったです",
      "pastNeg": "強くなかったです"
    }
  },
  {
    "jp": "弱い",
    "r": "よわい",
    "en": "weak",
    "cat": "adjectives",
    "sub": "い-Adjectives (I-Adjectives)",
    "type": "i",
    "ex": "雨が弱くなりました。",
    "exEn": "The rain has become weak.",
    "conj": {
      "presAff": "弱いです",
      "presNeg": "弱くないです",
      "pastAff": "弱かったです",
      "pastNeg": "弱くなかったです"
    }
  },
  {
    "jp": "好き",
    "r": "すき",
    "en": "liked / fond of",
    "cat": "adjectives",
    "sub": "な-Adjectives (Na-Adjectives)",
    "type": "na",
    "ex": "私は日本料理が好きです。",
    "exEn": "I like Japanese food.",
    "conj": {
      "presAff": "好きです",
      "presNeg": "好きじゃないです / 好きではありません",
      "pastAff": "好きでした",
      "pastNeg": "好きじゃなかったです"
    }
  },
  {
    "jp": "嫌い",
    "r": "きらい",
    "en": "disliked",
    "cat": "adjectives",
    "sub": "な-Adjectives (Na-Adjectives)",
    "type": "na",
    "ex": "野菜は嫌いではありません。",
    "exEn": "I do not dislike vegetables.",
    "conj": {
      "presAff": "嫌いです",
      "presNeg": "嫌いじゃないです / 嫌いではありません",
      "pastAff": "嫌いでした",
      "pastNeg": "嫌いじゃなかったです"
    }
  },
  {
    "jp": "きれい",
    "r": "きれい",
    "en": "beautiful / clean",
    "cat": "adjectives",
    "sub": "な-Adjectives (Na-Adjectives)",
    "type": "na",
    "ex": "公園にきれいな花が咲いています。",
    "exEn": "Beautiful flowers are blooming in the park.",
    "conj": {
      "presAff": "きれいです",
      "presNeg": "きれいじゃないです / きれいではありません",
      "pastAff": "きれいでした",
      "pastNeg": "きれいじゃなかったです"
    }
  },
  {
    "jp": "元気",
    "r": "げんき",
    "en": "healthy / energetic",
    "cat": "adjectives",
    "sub": "な-Adjectives (Na-Adjectives)",
    "type": "na",
    "ex": "お元気ですか？はい、元気です。",
    "exEn": "How are you? Yes, I am doing well.",
    "conj": {
      "presAff": "元気です",
      "presNeg": "元気じゃないです / 元気ではありません",
      "pastAff": "元気でした",
      "pastNeg": "元気じゃなかったです"
    }
  },
  {
    "jp": "静か",
    "r": "しずか",
    "en": "quiet",
    "cat": "adjectives",
    "sub": "な-Adjectives (Na-Adjectives)",
    "type": "na",
    "ex": "図書館はとても静かです。",
    "exEn": "The library is very quiet.",
    "conj": {
      "presAff": "静かです",
      "presNeg": "静かじゃないです / 静かではありません",
      "pastAff": "静かでした",
      "pastNeg": "静かじゃなかったです"
    }
  },
  {
    "jp": "にぎやか",
    "r": "にぎやか",
    "en": "lively / bustling",
    "cat": "adjectives",
    "sub": "な-Adjectives (Na-Adjectives)",
    "type": "na",
    "ex": "休日の街はにぎやかです。",
    "exEn": "The town is bustling on the holidays.",
    "conj": {
      "presAff": "にぎやかです",
      "presNeg": "にぎやかじゃないです / にぎやかではありません",
      "pastAff": "にぎやかでした",
      "pastNeg": "にぎやかじゃなかったです"
    }
  },
  {
    "jp": "暇",
    "r": "ひま",
    "en": "free / not busy",
    "cat": "adjectives",
    "sub": "な-Adjectives (Na-Adjectives)",
    "type": "na",
    "ex": "今週末は暇ですか？",
    "exEn": "Are you free this weekend?",
    "conj": {
      "presAff": "暇です",
      "presNeg": "暇じゃないです / 暇ではありません",
      "pastAff": "暇でした",
      "pastNeg": "暇じゃなかったです"
    }
  },
  {
    "jp": "便利",
    "r": "べんり",
    "en": "convenient",
    "cat": "adjectives",
    "sub": "な-Adjectives (Na-Adjectives)",
    "type": "na",
    "ex": "駅の近くに住むと便利です。",
    "exEn": "It is convenient to live near the station.",
    "conj": {
      "presAff": "便利です",
      "presNeg": "便利じゃないです / 便利ではありません",
      "pastAff": "便利でした",
      "pastNeg": "便利じゃなかったです"
    }
  },
  {
    "jp": "有名",
    "r": "ゆうめい",
    "en": "famous",
    "cat": "adjectives",
    "sub": "な-Adjectives (Na-Adjectives)",
    "type": "na",
    "ex": "京都は有名なお寺が多いです。",
    "exEn": "Kyoto has many famous temples.",
    "conj": {
      "presAff": "有名です",
      "presNeg": "有名じゃないです / 有名ではありません",
      "pastAff": "有名でした",
      "pastNeg": "有名じゃなかったです"
    }
  },
  {
    "jp": "親切",
    "r": "しんせつ",
    "en": "kind",
    "cat": "adjectives",
    "sub": "な-Adjectives (Na-Adjectives)",
    "type": "na",
    "ex": "田中さんはとても親切な人です。",
    "exEn": "Tanaka-san is a very kind person.",
    "conj": {
      "presAff": "親切です",
      "presNeg": "親切じゃないです / 親切ではありません",
      "pastAff": "親切でした",
      "pastNeg": "親切じゃなかったです"
    }
  },
  {
    "jp": "簡単",
    "r": "かんたん",
    "en": "easy / simple",
    "cat": "adjectives",
    "sub": "な-Adjectives (Na-Adjectives)",
    "type": "na",
    "ex": "この問題は簡単です。",
    "exEn": "This question is easy.",
    "conj": {
      "presAff": "簡単です",
      "presNeg": "簡単じゃないです / 簡単ではありません",
      "pastAff": "簡単でした",
      "pastNeg": "簡単じゃなかったです"
    }
  },
  {
    "jp": "大丈夫",
    "r": "だいじょうぶ",
    "en": "okay / all right",
    "cat": "adjectives",
    "sub": "な-Adjectives (Na-Adjectives)",
    "type": "na",
    "ex": "大丈夫ですか？はい、大丈夫です。",
    "exEn": "Are you okay? Yes, I am fine.",
    "conj": {
      "presAff": "大丈夫です",
      "presNeg": "大丈夫じゃないです / 大丈夫ではありません",
      "pastAff": "大丈夫でした",
      "pastNeg": "大丈夫じゃなかったです"
    }
  },
  {
    "jp": "上手",
    "r": "じょうず",
    "en": "skillful / good at",
    "cat": "adjectives",
    "sub": "な-Adjectives (Na-Adjectives)",
    "type": "na",
    "ex": "日本語を話すのが上手ですね。",
    "exEn": "You are skillful at speaking Japanese.",
    "conj": {
      "presAff": "上手です",
      "presNeg": "上手じゃないです / 上手ではありません",
      "pastAff": "上手でした",
      "pastNeg": "上手じゃなかったです"
    }
  },
  {
    "jp": "下手",
    "r": "へた",
    "en": "unskillful / bad at",
    "cat": "adjectives",
    "sub": "な-Adjectives (Na-Adjectives)",
    "type": "na",
    "ex": "私は絵を描くのが下手です。",
    "exEn": "I am not good at drawing pictures.",
    "conj": {
      "presAff": "下手です",
      "presNeg": "下手じゃないです / 下手ではありません",
      "pastAff": "下手でした",
      "pastNeg": "下手じゃなかったです"
    }
  },
  {
    "jp": "丈夫",
    "r": "じょうぶ",
    "en": "strong / durable",
    "cat": "adjectives",
    "sub": "な-Adjectives (Na-Adjectives)",
    "type": "na",
    "ex": "この靴は丈夫で長持ちします。",
    "exEn": "These shoes are sturdy and last a long time.",
    "conj": {
      "presAff": "丈夫です",
      "presNeg": "丈夫じゃないです / 丈夫ではありません",
      "pastAff": "丈夫でした",
      "pastNeg": "丈夫じゃなかったです"
    }
  },
  {
    "jp": "賑やか",
    "r": "にぎやか",
    "en": "lively",
    "cat": "adjectives",
    "sub": "な-Adjectives (Na-Adjectives)",
    "type": "na",
    "ex": "お祭りの夜は賑やかでした。",
    "exEn": "The festival night was lively.",
    "conj": {
      "presAff": "賑やかです",
      "presNeg": "賑やかじゃないです / 賑やかではありません",
      "pastAff": "賑やかでした",
      "pastNeg": "賑やかじゃなかったです"
    }
  }
],
N4: [
  {
    "jp": "会議",
    "r": "かいぎ",
    "en": "meeting/conference",
    "cat": "business",
    "ex": "会議があります。",
    "exEn": "There is a meeting."
  },
  {
    "jp": "説明",
    "r": "せつめい",
    "en": "explanation",
    "cat": "business",
    "ex": "説明してください。",
    "exEn": "Please explain."
  },
  {
    "jp": "連絡",
    "r": "れんらく",
    "en": "contact / communication",
    "cat": "business",
    "ex": "後で連絡します。",
    "exEn": "I will contact you later."
  },
  {
    "jp": "予約",
    "r": "よやく",
    "en": "reservation",
    "cat": "business",
    "ex": "予約しました。",
    "exEn": "I made a reservation."
  },
  {
    "jp": "申し込む",
    "r": "もうしこむ",
    "en": "to apply",
    "cat": "verbs",
    "ex": "コースに申し込みます。",
    "exEn": "I apply for the course."
  },
  {
    "jp": "確認する",
    "r": "かくにんする",
    "en": "to confirm",
    "cat": "verbs",
    "ex": "予約を確認します。",
    "exEn": "I confirm the reservation."
  },
  {
    "jp": "変える",
    "r": "かえる",
    "en": "to change",
    "cat": "verbs",
    "ex": "計画を変えます。",
    "exEn": "I change the plan."
  },
  {
    "jp": "続ける",
    "r": "つづける",
    "en": "to continue",
    "cat": "verbs",
    "ex": "勉強を続けます。",
    "exEn": "I continue studying."
  },
  {
    "jp": "始まる",
    "r": "はじまる",
    "en": "to begin (intrans)",
    "cat": "verbs",
    "ex": "授業が始まります。",
    "exEn": "Class begins."
  },
  {
    "jp": "終わる",
    "r": "おわる",
    "en": "to end (intrans)",
    "cat": "verbs",
    "ex": "仕事が終わります。",
    "exEn": "Work ends."
  },
  {
    "jp": "経験",
    "r": "けいけん",
    "en": "experience",
    "cat": "general",
    "ex": "いい経験になりました。",
    "exEn": "It became a good experience."
  },
  {
    "jp": "意見",
    "r": "いけん",
    "en": "opinion",
    "cat": "general",
    "ex": "意見を聞かせてください。",
    "exEn": "Please let me hear your opinion."
  },
  {
    "jp": "趣味",
    "r": "しゅみ",
    "en": "hobby",
    "cat": "general",
    "ex": "趣味は何ですか？",
    "exEn": "What is your hobby?"
  },
  {
    "jp": "文化",
    "r": "ぶんか",
    "en": "culture",
    "cat": "general",
    "ex": "日本の文化が好きです。",
    "exEn": "I like Japanese culture."
  },
  {
    "jp": "社会",
    "r": "しゃかい",
    "en": "society",
    "cat": "general",
    "ex": "社会のルール。",
    "exEn": "Rules of society."
  },
  {
    "jp": "文法",
    "r": "ぶんぽう",
    "en": "grammar",
    "cat": "school",
    "ex": "文法がむずかしいです。",
    "exEn": "Grammar is difficult."
  },
  {
    "jp": "単語",
    "r": "たんご",
    "en": "vocabulary/word",
    "cat": "school",
    "ex": "単語を覚えます。",
    "exEn": "I memorize vocabulary."
  },
  {
    "jp": "発音",
    "r": "はつおん",
    "en": "pronunciation",
    "cat": "school",
    "ex": "発音を練習します。",
    "exEn": "I practice pronunciation."
  },
  {
    "jp": "練習",
    "r": "れんしゅう",
    "en": "practice",
    "cat": "school",
    "ex": "毎日練習します。",
    "exEn": "I practice every day."
  },
  {
    "jp": "質問",
    "r": "しつもん",
    "en": "question",
    "cat": "school",
    "ex": "質問があります。",
    "exEn": "I have a question."
  },
  {
    "jp": "答え",
    "r": "こたえ",
    "en": "answer",
    "cat": "school",
    "ex": "答えを教えてください。",
    "exEn": "Please tell me the answer."
  },
  {
    "jp": "宿題",
    "r": "しゅくだい",
    "en": "homework",
    "cat": "school",
    "ex": "宿題をします。",
    "exEn": "I do homework."
  },
  {
    "jp": "試験",
    "r": "しけん",
    "en": "exam/test",
    "cat": "school",
    "ex": "来週試験があります。",
    "exEn": "There is an exam next week."
  },
  {
    "jp": "成績",
    "r": "せいせき",
    "en": "grades/results",
    "cat": "school",
    "ex": "成績がよかったです。",
    "exEn": "My grades were good."
  },
  {
    "jp": "授業",
    "r": "じゅぎょう",
    "en": "class/lesson",
    "cat": "school",
    "ex": "授業が始まります。",
    "exEn": "Class is starting."
  },
  {
    "jp": "留学",
    "r": "りゅうがく",
    "en": "study abroad",
    "cat": "school",
    "ex": "日本に留学したいです。",
    "exEn": "I want to study in Japan."
  },
  {
    "jp": "旅行",
    "r": "りょこう",
    "en": "travel/trip",
    "cat": "activities",
    "ex": "旅行が好きです。",
    "exEn": "I like traveling."
  },
  {
    "jp": "散歩",
    "r": "さんぽ",
    "en": "walk/stroll",
    "cat": "activities",
    "ex": "公園を散歩します。",
    "exEn": "I take a walk in the park."
  },
  {
    "jp": "運動",
    "r": "うんどう",
    "en": "exercise/sports",
    "cat": "activities",
    "ex": "毎日運動します。",
    "exEn": "I exercise every day."
  },
  {
    "jp": "料理",
    "r": "りょうり",
    "en": "cooking/cuisine",
    "cat": "activities",
    "ex": "料理が好きです。",
    "exEn": "I like cooking."
  },
  {
    "jp": "買い物",
    "r": "かいもの",
    "en": "shopping",
    "cat": "activities",
    "ex": "買い物に行きます。",
    "exEn": "I go shopping."
  },
  {
    "jp": "仕事",
    "r": "しごと",
    "en": "work/job",
    "cat": "business",
    "ex": "仕事が終わりました。",
    "exEn": "Work is finished."
  },
  {
    "jp": "電話する",
    "r": "でんわする",
    "en": "to make a phone call",
    "cat": "business",
    "ex": "後で電話します。",
    "exEn": "I will call you later."
  },
  {
    "jp": "メール",
    "r": "めーる",
    "en": "email/message",
    "cat": "business",
    "ex": "メールを送ります。",
    "exEn": "I will send an email."
  },
  {
    "jp": "報告",
    "r": "ほうこく",
    "en": "report",
    "cat": "business",
    "ex": "結果を報告します。",
    "exEn": "I will report the results."
  },
  {
    "jp": "準備",
    "r": "じゅんび",
    "en": "preparation",
    "cat": "general",
    "ex": "準備ができました。",
    "exEn": "Preparation is done."
  },
  {
    "jp": "約束",
    "r": "やくそく",
    "en": "promise/appointment",
    "cat": "general",
    "ex": "約束を守ります。",
    "exEn": "I keep promises."
  },
  {
    "jp": "心配",
    "r": "しんぱい",
    "en": "worry/concern",
    "cat": "general",
    "ex": "心配しないでください。",
    "exEn": "Please don't worry."
  },
  {
    "jp": "大丈夫",
    "r": "だいじょうぶ",
    "en": "okay/alright",
    "cat": "general",
    "ex": "大丈夫ですか？",
    "exEn": "Are you okay?"
  },
  {
    "jp": "難しい",
    "r": "むずかしい",
    "en": "difficult",
    "cat": "adjectives",
    "ex": "この問題は難しいです。",
    "exEn": "This problem is difficult."
  },
  {
    "jp": "簡単",
    "r": "かんたん",
    "en": "easy/simple",
    "cat": "adjectives",
    "ex": "この問題は簡単です。",
    "exEn": "This problem is simple."
  },
  {
    "jp": "便利",
    "r": "べんり",
    "en": "convenient/useful",
    "cat": "adjectives",
    "ex": "電車は便利です。",
    "exEn": "Trains are convenient."
  },
  {
    "jp": "複雑",
    "r": "ふくざつ",
    "en": "complicated",
    "cat": "adjectives",
    "ex": "文法が複雑です。",
    "exEn": "The grammar is complicated."
  },
  {
    "jp": "重要",
    "r": "じゅうよう",
    "en": "important",
    "cat": "adjectives",
    "ex": "これは重要です。",
    "exEn": "This is important."
  },
  {
    "jp": "特別",
    "r": "とくべつ",
    "en": "special",
    "cat": "adjectives",
    "ex": "今日は特別な日です。",
    "exEn": "Today is a special day."
  },
  {
    "jp": "自然",
    "r": "しぜん",
    "en": "nature",
    "cat": "general",
    "ex": "自然が好きです。",
    "exEn": "I like nature."
  },
  {
    "jp": "環境",
    "r": "かんきょう",
    "en": "environment",
    "cat": "general",
    "ex": "環境を守りましょう。",
    "exEn": "Let's protect the environment."
  },
  {
    "jp": "季節",
    "r": "きせつ",
    "en": "season",
    "cat": "time",
    "ex": "春は一番好きな季節です。",
    "exEn": "Spring is my favorite season."
  },
  {
    "jp": "天気",
    "r": "てんき",
    "en": "weather",
    "cat": "time",
    "ex": "今日の天気はいいです。",
    "exEn": "Today's weather is nice."
  },
  {
    "jp": "気温",
    "r": "きおん",
    "en": "temperature",
    "cat": "time",
    "ex": "気温が高いです。",
    "exEn": "The temperature is high."
  },
  {
    "jp": "春",
    "r": "はる",
    "en": "spring",
    "cat": "time",
    "ex": "春は花が咲きます。",
    "exEn": "Flowers bloom in spring."
  },
  {
    "jp": "夏",
    "r": "なつ",
    "en": "summer",
    "cat": "time",
    "ex": "夏は暑いです。",
    "exEn": "Summer is hot."
  },
  {
    "jp": "秋",
    "r": "あき",
    "en": "autumn/fall",
    "cat": "time",
    "ex": "秋は紅葉がきれいです。",
    "exEn": "Autumn leaves are beautiful."
  },
  {
    "jp": "冬",
    "r": "ふゆ",
    "en": "winter",
    "cat": "time",
    "ex": "冬は雪が降ります。",
    "exEn": "Snow falls in winter."
  },
  {
    "jp": "痛み",
    "r": "いたみ",
    "en": "pain",
    "cat": "health",
    "ex": "痛みがあります。",
    "exEn": "I have pain."
  },
  {
    "jp": "熱",
    "r": "ねつ",
    "en": "fever/heat",
    "cat": "health",
    "ex": "熱があります。",
    "exEn": "I have a fever."
  },
  {
    "jp": "薬",
    "r": "くすり",
    "en": "medicine/drug",
    "cat": "health",
    "ex": "薬を飲みます。",
    "exEn": "I take medicine."
  },
  {
    "jp": "運",
    "r": "うん",
    "en": "luck/fortune",
    "cat": "general",
    "ex": "今日は運がいいです。",
    "exEn": "I am lucky today."
  },
  {
    "jp": "笑う",
    "r": "わらう",
    "en": "to laugh/smile",
    "cat": "verbs",
    "ex": "たくさん笑います。",
    "exEn": "I laugh a lot."
  },
  {
    "jp": "泣く",
    "r": "なく",
    "en": "to cry",
    "cat": "verbs",
    "ex": "映画を見て泣きました。",
    "exEn": "I cried watching the movie."
  },
  {
    "jp": "怒る",
    "r": "おこる",
    "en": "to get angry",
    "cat": "verbs",
    "ex": "先生が怒りました。",
    "exEn": "The teacher got angry."
  },
  {
    "jp": "驚く",
    "r": "おどろく",
    "en": "to be surprised",
    "cat": "verbs",
    "ex": "知らせに驚きました。",
    "exEn": "I was surprised by the news."
  },
  {
    "jp": "困る",
    "r": "こまる",
    "en": "to be in trouble",
    "cat": "verbs",
    "ex": "お金がなくて困ります。",
    "exEn": "I am in trouble without money."
  },
  {
    "jp": "諦める",
    "r": "あきらめる",
    "en": "to give up",
    "cat": "verbs",
    "ex": "諦めないでください。",
    "exEn": "Please don't give up."
  }
]
};
