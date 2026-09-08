// ── HIRAGANA ──
const HIRAGANA=[
  {group:'Vowels',chars:[{jp:'あ',r:'a'},{jp:'い',r:'i'},{jp:'う',r:'u'},{jp:'え',r:'e'},{jp:'お',r:'o'}]},
  {group:'K-row',chars:[{jp:'か',r:'ka'},{jp:'き',r:'ki'},{jp:'く',r:'ku'},{jp:'け',r:'ke'},{jp:'こ',r:'ko'}]},
  {group:'S-row',chars:[{jp:'さ',r:'sa'},{jp:'し',r:'shi'},{jp:'す',r:'su'},{jp:'せ',r:'se'},{jp:'そ',r:'so'}]},
  {group:'T-row',chars:[{jp:'た',r:'ta'},{jp:'ち',r:'chi'},{jp:'つ',r:'tsu'},{jp:'て',r:'te'},{jp:'と',r:'to'}]},
  {group:'N-row',chars:[{jp:'な',r:'na'},{jp:'に',r:'ni'},{jp:'ぬ',r:'nu'},{jp:'ね',r:'ne'},{jp:'の',r:'no'}]},
  {group:'H-row',chars:[{jp:'は',r:'ha'},{jp:'ひ',r:'hi'},{jp:'ふ',r:'fu'},{jp:'へ',r:'he'},{jp:'ほ',r:'ho'}]},
  {group:'M-row',chars:[{jp:'ま',r:'ma'},{jp:'み',r:'mi'},{jp:'む',r:'mu'},{jp:'め',r:'me'},{jp:'も',r:'mo'}]},
  {group:'Y-row',chars:[{jp:'や',r:'ya'},{jp:'ゆ',r:'yu'},{jp:'よ',r:'yo'}]},
  {group:'R-row',chars:[{jp:'ら',r:'ra'},{jp:'り',r:'ri'},{jp:'る',r:'ru'},{jp:'れ',r:'re'},{jp:'ろ',r:'ro'}]},
  {group:'W-row',chars:[{jp:'わ',r:'wa'},{jp:'を',r:'wo'}]},
  {group:'N',chars:[{jp:'ん',r:'n'}]},
  {group:'Dakuten G',chars:[{jp:'が',r:'ga'},{jp:'ぎ',r:'gi'},{jp:'ぐ',r:'gu'},{jp:'げ',r:'ge'},{jp:'ご',r:'go'}]},
  {group:'Dakuten Z',chars:[{jp:'ざ',r:'za'},{jp:'じ',r:'ji'},{jp:'ず',r:'zu'},{jp:'ぜ',r:'ze'},{jp:'ぞ',r:'zo'}]},
  {group:'Dakuten D',chars:[{jp:'だ',r:'da'},{jp:'ぢ',r:'di'},{jp:'づ',r:'du'},{jp:'で',r:'de'},{jp:'ど',r:'do'}]},
  {group:'Dakuten B',chars:[{jp:'ば',r:'ba'},{jp:'び',r:'bi'},{jp:'ぶ',r:'bu'},{jp:'べ',r:'be'},{jp:'ぼ',r:'bo'}]},
  {group:'Handakuten P',chars:[{jp:'ぱ',r:'pa'},{jp:'ぴ',r:'pi'},{jp:'ぷ',r:'pu'},{jp:'ぺ',r:'pe'},{jp:'ぽ',r:'po'}]},
  {group:'Combo K/S',chars:[{jp:'きゃ',r:'kya'},{jp:'きゅ',r:'kyu'},{jp:'きょ',r:'kyo'},{jp:'しゃ',r:'sha'},{jp:'しゅ',r:'shu'},{jp:'しょ',r:'sho'}]},
  {group:'Combo T/N',chars:[{jp:'ちゃ',r:'cha'},{jp:'ちゅ',r:'chu'},{jp:'ちょ',r:'cho'},{jp:'にゃ',r:'nya'},{jp:'にゅ',r:'nyu'},{jp:'にょ',r:'nyo'}]},
  {group:'Combo H/M',chars:[{jp:'ひゃ',r:'hya'},{jp:'ひゅ',r:'hyu'},{jp:'ひょ',r:'hyo'},{jp:'みゃ',r:'mya'},{jp:'みゅ',r:'myu'},{jp:'みょ',r:'myo'}]},
  {group:'Combo R/G',chars:[{jp:'りゃ',r:'rya'},{jp:'りゅ',r:'ryu'},{jp:'りょ',r:'ryo'},{jp:'ぎゃ',r:'gya'},{jp:'ぎゅ',r:'gyu'},{jp:'ぎょ',r:'gyo'}]},
  {group:'Combo Z/B/P',chars:[{jp:'じゃ',r:'ja'},{jp:'じゅ',r:'ju'},{jp:'じょ',r:'jo'},{jp:'びゃ',r:'bya'},{jp:'びゅ',r:'byu'},{jp:'びょ',r:'byo'},{jp:'ぴゃ',r:'pya'},{jp:'ぴゅ',r:'pyu'},{jp:'ぴょ',r:'pyo'}]}
];
const KATAKANA=[
  {group:'Vowels',chars:[{jp:'ア',r:'a'},{jp:'イ',r:'i'},{jp:'ウ',r:'u'},{jp:'エ',r:'e'},{jp:'オ',r:'o'}]},
  {group:'K-row',chars:[{jp:'カ',r:'ka'},{jp:'キ',r:'ki'},{jp:'ク',r:'ku'},{jp:'ケ',r:'ke'},{jp:'コ',r:'ko'}]},
  {group:'S-row',chars:[{jp:'サ',r:'sa'},{jp:'シ',r:'shi'},{jp:'ス',r:'su'},{jp:'セ',r:'se'},{jp:'ソ',r:'so'}]},
  {group:'T-row',chars:[{jp:'タ',r:'ta'},{jp:'チ',r:'chi'},{jp:'ツ',r:'tsu'},{jp:'テ',r:'te'},{jp:'ト',r:'to'}]},
  {group:'N-row',chars:[{jp:'ナ',r:'na'},{jp:'ニ',r:'ni'},{jp:'ヌ',r:'nu'},{jp:'ネ',r:'ne'},{jp:'ノ',r:'no'}]},
  {group:'H-row',chars:[{jp:'ハ',r:'ha'},{jp:'ヒ',r:'hi'},{jp:'フ',r:'fu'},{jp:'ヘ',r:'he'},{jp:'ホ',r:'ho'}]},
  {group:'M-row',chars:[{jp:'マ',r:'ma'},{jp:'ミ',r:'mi'},{jp:'ム',r:'mu'},{jp:'メ',r:'me'},{jp:'モ',r:'mo'}]},
  {group:'Y-row',chars:[{jp:'ヤ',r:'ya'},{jp:'ユ',r:'yu'},{jp:'ヨ',r:'yo'}]},
  {group:'R-row',chars:[{jp:'ラ',r:'ra'},{jp:'リ',r:'ri'},{jp:'ル',r:'ru'},{jp:'レ',r:'re'},{jp:'ロ',r:'ro'}]},
  {group:'W-row',chars:[{jp:'ワ',r:'wa'},{jp:'ヲ',r:'wo'}]},
  {group:'N',chars:[{jp:'ン',r:'n'}]},
  {group:'Dakuten G',chars:[{jp:'ガ',r:'ga'},{jp:'ギ',r:'gi'},{jp:'グ',r:'gu'},{jp:'ゲ',r:'ge'},{jp:'ゴ',r:'go'}]},
  {group:'Dakuten Z',chars:[{jp:'ザ',r:'za'},{jp:'ジ',r:'ji'},{jp:'ズ',r:'zu'},{jp:'ゼ',r:'ze'},{jp:'ゾ',r:'zo'}]},
  {group:'Dakuten D',chars:[{jp:'ダ',r:'da'},{jp:'ヂ',r:'di'},{jp:'ヅ',r:'du'},{jp:'デ',r:'de'},{jp:'ド',r:'do'}]},
  {group:'Dakuten B',chars:[{jp:'バ',r:'ba'},{jp:'ビ',r:'bi'},{jp:'ブ',r:'bu'},{jp:'ベ',r:'be'},{jp:'ボ',r:'bo'}]},
  {group:'Handakuten P',chars:[{jp:'パ',r:'pa'},{jp:'ピ',r:'pi'},{jp:'プ',r:'pu'},{jp:'ペ',r:'pe'},{jp:'ポ',r:'po'}]},
  {group:'Combo K/S',chars:[{jp:'キャ',r:'kya'},{jp:'キュ',r:'kyu'},{jp:'キョ',r:'kyo'},{jp:'シャ',r:'sha'},{jp:'シュ',r:'shu'},{jp:'ショ',r:'sho'}]},
  {group:'Combo T/N',chars:[{jp:'チャ',r:'cha'},{jp:'チュ',r:'chu'},{jp:'チョ',r:'cho'},{jp:'ニャ',r:'nya'},{jp:'ニュ',r:'nyu'},{jp:'ニョ',r:'nyo'}]},
  {group:'Combo H/M',chars:[{jp:'ヒャ',r:'hya'},{jp:'ヒュ',r:'hyu'},{jp:'ヒョ',r:'hyo'},{jp:'ミャ',r:'mya'},{jp:'ミュ',r:'myu'},{jp:'ミョ',r:'myo'}]},
  {group:'Combo R/G',chars:[{jp:'リャ',r:'rya'},{jp:'リュ',r:'ryu'},{jp:'リョ',r:'ryo'},{jp:'ギャ',r:'gya'},{jp:'ギュ',r:'gyu'},{jp:'ギョ',r:'gyo'}]},
  {group:'Combo Z/B/P',chars:[{jp:'ジャ',r:'ja'},{jp:'ジュ',r:'ju'},{jp:'ジョ',r:'jo'},{jp:'ビャ',r:'bya'},{jp:'ビュ',r:'byu'},{jp:'ビョ',r:'byo'},{jp:'ピャ',r:'pya'},{jp:'ピュ',r:'pyu'},{jp:'ピョ',r:'pyo'}]}
];

// Exact Kana Stroke Count Database (Aligned with KanjiVG stroke specifications)
const KANA_STROKES = {
  // Hiragana Vowels & Main Rows
  'あ': 3, 'い': 2, 'う': 2, 'え': 2, 'お': 3,
  'か': 3, 'き': 4, 'く': 1, 'け': 3, 'こ': 2,
  'さ': 3, 'し': 1, 'す': 2, 'せ': 3, 'そ': 1,
  'た': 4, 'ち': 2, 'つ': 1, 'て': 1, 'と': 2,
  'な': 4, 'に': 3, 'ぬ': 2, 'ね': 2, 'の': 1,
  'は': 3, 'ひ': 1, 'ふ': 4, 'へ': 1, 'ほ': 4,
  'ま': 3, 'み': 2, 'む': 3, 'め': 2, 'も': 3,
  'や': 3, 'ゆ': 2, 'よ': 2,
  'ら': 2, 'り': 2, 'る': 1, 'れ': 2, 'ろ': 1,
  'わ': 2, 'を': 3, 'ん': 1,
  // Hiragana Dakuten & Handakuten
  'が': 5, 'ぎ': 6, 'ぐ': 3, 'げ': 5, 'ご': 4,
  'ざ': 5, 'じ': 3, 'ず': 4, 'ぜ': 5, 'ぞ': 3,
  'だ': 6, 'ぢ': 4, 'づ': 3, 'で': 3, 'ど': 4,
  'ば': 5, 'び': 3, 'ぶ': 6, 'べ': 3, 'ぼ': 6,
  'ぱ': 4, 'ぴ': 2, 'ぷ': 5, 'ぺ': 2, 'ぽ': 5,
  // Small Hiragana
  'ゃ': 3, 'ゅ': 2, 'ょ': 2, 'っ': 1,

  // Katakana Vowels & Main Rows
  'ア': 2, 'イ': 2, 'ウ': 3, 'エ': 3, 'オ': 3,
  'カ': 2, 'キ': 3, 'ク': 2, 'ケ': 3, 'コ': 2,
  'サ': 3, 'シ': 3, 'ス': 2, 'セ': 2, 'ソ': 2,
  'タ': 3, 'チ': 3, 'ツ': 3, 'テ': 3, 'ト': 2,
  'ナ': 2, 'ニ': 2, 'ヌ': 2, 'ネ': 4, 'ノ': 1,
  'ハ': 2, 'ヒ': 2, 'フ': 1, 'ヘ': 1, 'ホ': 4,
  'マ': 2, 'ミ': 3, 'ム': 2, 'メ': 2, 'モ': 3,
  'ヤ': 2, 'ユ': 2, 'ヨ': 3,
  'ラ': 2, 'リ': 2, 'ル': 2, 'レ': 1, 'ロ': 3,
  'ワ': 2, 'ヲ': 3, 'ン': 2,
  // Katakana Dakuten & Handakuten
  'ガ': 4, 'ギ': 5, 'グ': 4, 'ゲ': 5, 'ゴ': 4,
  'ザ': 5, 'ジ': 5, 'ズ': 4, 'ゼ': 4, 'ゾ': 4,
  'ダ': 5, 'ヂ': 5, 'ヅ': 5, 'デ': 5, 'ド': 4,
  'バ': 4, 'ビ': 4, 'ブ': 3, 'ベ': 3, 'ボ': 6,
  'パ': 3, 'ピ': 3, 'プ': 2, 'ペ': 2, 'ポ': 5,
  // Small Katakana
  'ャ': 2, 'ュ': 2, 'ョ': 3, 'ッ': 2
};

function getKanaStrokeCount(kana) {
  if (!kana) return 2;
  if (KANA_STROKES[kana]) return KANA_STROKES[kana];
  // If it's a digraph combo (e.g. きゃ, キャ)
  let count = 0;
  for (const c of kana) {
    count += KANA_STROKES[c] || 2;
  }
  return count > 0 ? count : 2;
}
