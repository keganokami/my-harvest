/* =========================================================
   my-harvest / core.js
   共通ユーティリティ・定数・データの器
   地域基準: 中間地（近畿平地） / 補正: 北摂丘陵・標高約200m の内陸想定
   ========================================================= */

/** 野菜データの器（data/veg-*.js が push する） */
const VEG_DB = [];

/** 立地プロファイル（この菜園の立地に合わせた補正値） */
const SITE = {
  name: '中間地・北摂丘陵（標高約200m）',
  zone: '中間地',
  zoneNote: '種袋・栽培カレンダーは「中間地」の欄を見てください。',
  altitude: '標高 約200m（北摂丘陵）',
  corrections: [
    '平野部の市街地より年間を通して 1〜2℃ 低め。冬の朝は氷点下になる日があります。',
    '遅霜は 4月上旬まで警戒。夏野菜の苗の定植は「4月下旬〜5月上旬」が安全圏（早植えは失敗の最大要因）。',
    '初霜は 11月下旬〜12月上旬。霜に弱い作物（サツマイモ・ショウガ・ナス）はそれまでに収穫を終える。',
    '秋まきは中間地標準どおり、または数日早める。冬越し作物（タマネギ・ソラマメ）は標準どおりでOK。',
    '梅雨（6月中旬〜7月中旬）は多湿。泥はねから病気が広がるので、株間を広めに取り敷きわらをする。',
    '真夏（7月下旬〜8月）は日中35℃超え。地面が乾ききるので、敷きわらで地温と乾燥を抑える。'
  ]
};

/* ---------------------------------------------------------
   旬（じゅん）ベースの日付ユーティリティ
   1年 = 36旬。dek = (月-1)*3 + (旬-1)   旬: 1=上旬, 2=中旬, 3=下旬
   --------------------------------------------------------- */

/** [月, 旬] -> 0..35 */
function dek(m, d) {
  return ((m - 1) * 3 + (d - 1) + 36) % 36;
}

/** 0..35 -> [月, 旬] */
function undek(i) {
  i = ((i % 36) + 36) % 36;
  return [Math.floor(i / 3) + 1, (i % 3) + 1];
}

const JUN_NAME = ['上旬', '中旬', '下旬'];

/** 0..35 -> "9月中旬" */
function dekLabel(i) {
  const [m, d] = undek(i);
  return `${m}月${JUN_NAME[d - 1]}`;
}

/** [from,to] -> "9月中旬〜10月下旬" */
function rangeLabel(from, to) {
  const a = Array.isArray(from) ? dek(from[0], from[1]) : from;
  const b = Array.isArray(to) ? dek(to[0], to[1]) : to;
  return a === b ? dekLabel(a) : `${dekLabel(a)}〜${dekLabel(b)}`;
}

/** Date -> 0..35 */
function dateToDek(date) {
  const d = date.getDate();
  const j = d <= 10 ? 1 : d <= 20 ? 2 : 3;
  return dek(date.getMonth() + 1, j);
}

/** 0..35 の範囲判定（年をまたぐ範囲に対応） */
function inRange(i, from, to) {
  const a = Array.isArray(from) ? dek(from[0], from[1]) : from;
  const b = Array.isArray(to) ? dek(to[0], to[1]) : to;
  i = ((i % 36) + 36) % 36;
  return a <= b ? i >= a && i <= b : i >= a || i <= b;
}

/** 範囲の長さ（旬数, 年またぎ対応） */
function rangeLen(from, to) {
  const a = Array.isArray(from) ? dek(from[0], from[1]) : from;
  const b = Array.isArray(to) ? dek(to[0], to[1]) : to;
  return ((b - a + 36) % 36) + 1;
}

/** i から j までの旬数（前方向） */
function dekDistance(i, j) {
  return ((j - i + 36) % 36);
}

/** 旬 -> だいたいの日数 */
const DEK_DAYS = 10.14;

/* ---------------------------------------------------------
   科（連作障害・輪作の基礎）
   --------------------------------------------------------- */
const FAMILY_INFO = {
  'ナス科': {
    rest: 4,
    color: '#e05252',
    members: 'トマト・ナス・ピーマン・シシトウ・トウガラシ・ジャガイモ',
    why: '青枯病・半身萎凋病・センチュウが土に残りやすく、家庭菜園で最も連作障害が出る科。',
    tip: 'ジャガイモもナス科。「トマトの跡地にジャガイモ」は典型的なNGパターンです。'
  },
  'ウリ科': {
    rest: 3,
    color: '#3aa76d',
    members: 'キュウリ・カボチャ・ズッキーニ・ゴーヤ・スイカ・メロン',
    why: 'つる割病・つる枯病。接ぎ木苗を使えばかなり回避できます。',
    tip: 'キュウリは接ぎ木苗（+100円程度）を選ぶだけで成功率が跳ね上がります。'
  },
  'アブラナ科': {
    rest: 2,
    color: '#5a8fd6',
    members: 'ダイコン・カブ・コマツナ・ミズナ・ハクサイ・キャベツ・ブロッコリー・チンゲンサイ・ラディッシュ・ルッコラ',
    why: '根こぶ病。酸性土壌で多発するので石灰による pH 調整が効きます。',
    tip: '秋冬の主力がほぼこの科。同じ場所で葉物を繰り返さないよう、区画を回すのがコツ。'
  },
  'マメ科': {
    rest: 3,
    color: '#c99a2e',
    members: 'エダマメ・インゲン・エンドウ・ソラマメ・ラッカセイ',
    why: '立枯病・センチュウ。特にエンドウは連作障害が強く 4〜5年空けます。',
    tip: '根粒菌が窒素を土に残すので、マメ科の跡地は葉物がよく育つ「お得な跡地」です。'
  },
  'ヒユ科': {
    rest: 2,
    color: '#7a6bbf',
    members: 'ホウレンソウ・スイスチャード・ビーツ',
    why: '萎凋病。ホウレンソウは酸性土壌に非常に弱いのが最大のポイント。',
    tip: 'ホウレンソウが育たない原因の8割は「土が酸性」。石灰を必ず入れます。'
  },
  'セリ科': {
    rest: 2,
    color: '#4aa3a3',
    members: 'ニンジン・パセリ・ミツバ・セロリ・パクチー',
    why: '軽度。ただしニンジンは発芽が最大の関門。',
    tip: 'セリ科の種は「好光性」。土を薄くかけるだけにします。'
  },
  'キク科': {
    rest: 2,
    color: '#d98cb3',
    members: 'レタス・サニーレタス・シュンギク・ゴボウ',
    why: '軽度。菌核病・すそ枯病。',
    tip: 'アブラナ科と交互に植えると虫の被害が分散します（レタスは虫が付きにくい）。'
  },
  'ヒガンバナ科': {
    rest: 1,
    color: '#8f9b3f',
    members: 'タマネギ・ネギ・ニンニク・ニラ・ラッキョウ・ワケギ',
    why: 'ほぼ連作可能。むしろ他の作物の病気を抑える働きがあります。',
    tip: 'ネギ・ニラを混植すると土の中の病原菌を抑えます（トマト＋ニラは定番）。'
  },
  'ヒルガオ科': {
    rest: 1,
    color: '#b5793f',
    members: 'サツマイモ・空芯菜',
    why: '連作障害はほぼなし。やせ地でも育つ優等生。',
    tip: '肥料が多いと「つるボケ」して芋がつきません。無肥料でOK。'
  },
  'イネ科': {
    rest: 1,
    color: '#c9b04a',
    members: 'トウモロコシ',
    why: '連作障害はほぼなし。土を深く耕す「緑肥」的な効果もあります。',
    tip: '2列以上まとめて植えないと受粉せず、スカスカの実になります。'
  },
  'ショウガ科': {
    rest: 4,
    color: '#d0a04a',
    members: 'ショウガ・ミョウガ',
    why: '根茎腐敗病。ショウガは 4年以上空けます。',
    tip: 'ミョウガは半日陰の定位置で放置栽培。連作の概念から外れる多年草です。'
  },
  'シソ科': {
    rest: 1,
    color: '#6ba368',
    members: 'シソ・バジル・ミント・ローズマリー',
    why: 'ほぼなし。丈夫でこぼれ種でも増えます。',
    tip: 'ミント・ローズマリーは地下茎や株張りで畝を占領するので、畑では扱いません。'
  },
  'アオイ科': {
    rest: 2,
    color: '#c98a5e',
    members: 'オクラ',
    why: 'ほぼ連作可能。ただし2年程度は空けたほうが無難。',
    tip: '高温を好むので、他の夏野菜が弱る猛暑期に強いのが持ち味です。'
  },
  'バラ科': {
    rest: 3,
    color: '#e07a9b',
    members: 'イチゴ',
    why: '萎黄病・炭疽病。',
    tip: 'イチゴは1年で更新（ランナーから子株を取る）のが基本です。'
  }
};

/* ---------------------------------------------------------
   ステップの種類
   --------------------------------------------------------- */
const STEP_KIND = {
  sow:     { label: '種まき',   short: '種',   color: '#8b6f47' },
  nursery: { label: '育苗',     short: '苗',   color: '#a8c66c' },
  plant:   { label: '植付け',   short: '植',   color: '#2e8b57' },
  grow:    { label: '生育・管理', short: '育',  color: '#7cb342' },
  harvest: { label: '収穫',     short: '穫',   color: '#e8a33d' },
  store:   { label: '貯蔵',     short: '蔵',   color: '#9e9e9e' }
};

const START_TYPE = {
  seed:     { label: '種から',       icon: '🌱', cost: '1袋 200〜400円（数十〜数百粒）' },
  seedling: { label: '苗から',       icon: '🪴', cost: '1株 100〜400円' },
  bulb:     { label: '球根・鱗片から', icon: '🧄', cost: '1ネット 500〜900円' },
  tuber:    { label: '種イモから',    icon: '🥔', cost: '1kg 500〜900円' },
  slip:     { label: '挿し苗から',    icon: '🍠', cost: '10本 400〜700円' },
  root:     { label: '株・根から',    icon: '🌿', cost: '1株 200〜500円' }
};

/* ---------------------------------------------------------
   小物ユーティリティ
   --------------------------------------------------------- */
function byId(id) { return VEG_DB.find(v => v.id === id); }

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

/** localStorage ラッパ（file:// でも例外で落ちないように） */
const Store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem('myharvest:' + key);
      return v ? JSON.parse(v) : fallback;
    } catch (e) { return fallback; }
  },
  set(key, val) {
    try { localStorage.setItem('myharvest:' + key, JSON.stringify(val)); }
    catch (e) { /* プライベートモード等では黙って諦める */ }
  },
  del(key) {
    try { localStorage.removeItem('myharvest:' + key); } catch (e) {}
  }
};

/** 星表示 */
function stars(n, max) {
  max = max || 5;
  return '★'.repeat(n) + '☆'.repeat(max - n);
}

/** プランのメイン収穫期を返す */
function harvestStep(plan) {
  return plan.steps.find(s => s.kind === 'harvest');
}

/** プランの最初のステップ（種まき or 植付け）を返す */
function startStep(plan) {
  return plan.steps[0];
}

/** 作付け開始が「今」できるか（前後1旬の余裕を持たせる） */
function canStartNow(plan, nowDek, slack) {
  slack = slack === undefined ? 0 : slack;
  const s = startStep(plan);
  const a = dek(s.from[0], s.from[1]) - slack;
  const b = dek(s.to[0], s.to[1]) + slack;
  return inRange(nowDek, ((a % 36) + 36) % 36, ((b % 36) + 36) % 36);
}
