/* =========================================================
   栽培日誌と状態診断
   「今の状態」を入力 → 生育の遅れ・症状・作業漏れを診断してアドバイスを返す
   ========================================================= */

/* ---------------------------------------------------------
   生育ステージのモデル（分類ごと）
   at = 収穫までの日数に対する進行率
   --------------------------------------------------------- */
const STAGE_SETS = {
  '葉物': [
    { id: 'sow',     label: '種まき／植付け直後', at: 0.00 },
    { id: 'germ',    label: '発芽した・根づいた', at: 0.15 },
    { id: 'true2',   label: '本葉2〜3枚',        at: 0.35 },
    { id: 'true5',   label: '本葉5〜6枚',        at: 0.60 },
    { id: 'full',    label: '株が茂ってきた',     at: 0.85 },
    { id: 'harvest', label: '収穫できる大きさ',   at: 1.00 },
    { id: 'bolt',    label: 'とう立ち・花が咲いた', at: 1.45 },
    { id: 'end',     label: '終了・片付け',       at: 1.70 }
  ],
  '根菜': [
    { id: 'sow',     label: '種まき直後',        at: 0.00 },
    { id: 'germ',    label: '発芽した',          at: 0.12 },
    { id: 'true2',   label: '本葉2〜3枚（1回目の間引き）', at: 0.28 },
    { id: 'true5',   label: '本葉5〜6枚（2回目の間引き）', at: 0.50 },
    { id: 'bulk',    label: '根が太り始めた',     at: 0.75 },
    { id: 'harvest', label: '収穫できる大きさ',   at: 1.00 },
    { id: 'bolt',    label: 'とう立ち・すが入った', at: 1.35 },
    { id: 'end',     label: '終了・片付け',       at: 1.60 }
  ],
  '果菜': [
    { id: 'plant',   label: '定植直後',          at: 0.00 },
    { id: 'root',    label: '活着した（新芽が動いた）', at: 0.15 },
    { id: 'grow',    label: '茎葉が伸びている',   at: 0.40 },
    { id: 'flower',  label: '花が咲いた',        at: 0.65 },
    { id: 'fruit',   label: '実がつき始めた',     at: 0.85 },
    { id: 'harvest', label: '収穫が始まった',     at: 1.00 },
    { id: 'peak',    label: '収穫の最盛期',       at: 1.60 },
    { id: 'end',     label: '株が終わりかけ',     at: 2.60 }
  ],
  '豆': [
    { id: 'sow',     label: '種まき／植付け直後', at: 0.00 },
    { id: 'germ',    label: '発芽した',          at: 0.12 },
    { id: 'grow',    label: 'つる・枝が伸びた',   at: 0.45 },
    { id: 'flower',  label: '花が咲いた',        at: 0.70 },
    { id: 'pod',     label: 'さやがついた',       at: 0.88 },
    { id: 'harvest', label: '収穫が始まった',     at: 1.00 },
    { id: 'end',     label: '終了・片付け',       at: 1.45 }
  ],
  'イモ': [
    { id: 'plant',   label: '植付け直後',        at: 0.00 },
    { id: 'sprout',  label: '芽が出た',          at: 0.20 },
    { id: 'grow',    label: '茎葉が茂った',       at: 0.45 },
    { id: 'bulk',    label: '地中で肥大中',       at: 0.70 },
    { id: 'yellow',  label: '茎葉が黄色くなってきた', at: 0.92 },
    { id: 'harvest', label: '収穫適期',          at: 1.00 },
    { id: 'end',     label: '収穫完了',          at: 1.15 }
  ],
  'ネギ類': [
    { id: 'plant',   label: '植付け直後',        at: 0.00 },
    { id: 'root',    label: '根づいた・芽が動いた', at: 0.12 },
    { id: 'grow',    label: '葉が伸びている',     at: 0.40 },
    { id: 'bulk',    label: '太り始めた',        at: 0.75 },
    { id: 'harvest', label: '収穫できる',        at: 1.00 },
    { id: 'end',     label: '終了・片付け',       at: 1.25 }
  ],
  'ハーブ': [
    { id: 'plant',   label: '植付け／発芽直後',   at: 0.00 },
    { id: 'root',    label: '根づいた',          at: 0.20 },
    { id: 'grow',    label: '枝葉が増えてきた',   at: 0.60 },
    { id: 'harvest', label: '収穫できる',        at: 1.00 },
    { id: 'flower',  label: '花芽が出てきた',     at: 2.20 },
    { id: 'end',     label: '終了・片付け',       at: 3.00 }
  ],
  '多年草': [
    { id: 'plant',   label: '植付け直後',        at: 0.00 },
    { id: 'sprout',  label: '芽が出た',          at: 0.30 },
    { id: 'grow',    label: '茂ってきた',        at: 0.70 },
    { id: 'harvest', label: '収穫できる',        at: 1.00 },
    { id: 'dormant', label: '地上部が枯れた（休眠）', at: 1.80 }
  ]
};
function stagesOf(v) { return STAGE_SETS[v.category] || STAGE_SETS['葉物']; }

/* ---------------------------------------------------------
   入力の選択肢
   --------------------------------------------------------- */
const VIGOR_OPTS = [
  { id: 'good',  label: 'がっしりして良い調子' },
  { id: 'ok',    label: 'ふつう' },
  { id: 'leggy', label: 'ひょろ長い・間延びしている' },
  { id: 'small', label: '小さいまま育たない' }
];
const LEAF_OPTS = [
  { id: 'deep',   label: '濃い緑' },
  { id: 'normal', label: 'ふつうの緑' },
  { id: 'pale',   label: '色が薄い・黄色っぽい' },
  { id: 'spot',   label: '斑点・変色がある' }
];
/** 観察できる症状 → 診断DB(SYMPTOMS) への対応 */
const OBS_SYMPTOMS = [
  { id: 'holes',  label: '葉に穴・食べられた跡',      sym: 's4',  kw: ['穴', '食害', '食べられ', '虫食い', '食い'] },
  { id: 'bugs',   label: '小さな虫が付いている',       sym: 's5',  kw: ['アブラムシ', 'ハダニ', '虫が', '群がる', '真っ黒'] },
  { id: 'yellow', label: '葉が黄色くなってきた',       sym: 's2',  kw: ['黄色', '黄変'] },
  { id: 'powder', label: '葉が白い粉をふいている',     sym: 's3',  kw: ['白い粉', 'うどんこ'] },
  { id: 'wilt',   label: 'しおれる・急に枯れた',       sym: 's1',  kw: ['しおれ', '青枯', 'つる割', '枯れる', '腐る'] },
  { id: 'leggy',  label: 'ひょろ長い・色が薄い',       sym: 's9',  kw: ['徒長', 'ひょろ'] },
  { id: 'noflw',  label: '花は咲くが実がつかない',     sym: 's6',  kw: ['実がつかない', '実がつき', '花が落ちる', '受粉', '雄花'] },
  { id: 'bend',   label: '実のお尻が黒くへこむ',       sym: 's7',  kw: ['尻腐れ', 'お尻'] },
  { id: 'nogerm', label: '発芽しない・まばら',         sym: 's10', kw: ['発芽しない', '芽が出ない', '発芽不良'] },
  { id: 'noball', label: '結球しない・玉にならない',   sym: 's11', kw: ['結球', '玉が', '丸くならない', '巻かない', '膨らまない'] },
  { id: 'bolt',   label: '茎が伸びて花が咲いた',       sym: 's12', kw: ['とう立ち', '花が咲', '開花'] },
  { id: 'deform', label: '根が変形・二股になった',     sym: 's8',  kw: ['二股', '分岐', '変形', '曲がる'] },
  { id: 'crack',  label: '実・根が割れた',            sym: null,  kw: ['割れる', '裂果', 'ひび'] },
  { id: 'slow',   label: '生育が遅い・大きくならない', sym: null,  kw: ['小さい', '育ちが遅い', '太らない', '大きくならない', '細い'] }
];
/** 記録できる作業 */
const WORK_TYPES = [
  { id: 'water',     label: '水やり' },
  { id: 'fert',      label: '追肥' },
  { id: 'thin',      label: '間引き' },
  { id: 'net',       label: '防虫ネットを掛けた' },
  { id: 'sideshoot', label: 'わき芽かき・摘心' },
  { id: 'hilling',   label: '土寄せ' },
  { id: 'support',   label: '支柱立て・誘引' },
  { id: 'weed',      label: '草取り' },
  { id: 'mulch',     label: '敷きわら・マルチ' },
  { id: 'pest',      label: '虫を取った・薬を撒いた' },
  { id: 'cleanup',   label: '片付けた' }
];

/** 追肥の標準間隔（日）。0 は追肥不要 */
const FERT_INTERVAL = { '果菜': 18, '豆': 35, '葉物': 22, '根菜': 25, 'イモ': 35, 'ネギ類': 45, 'ハーブ': 28, '多年草': 60 };
const NO_FERT = ['sweetpotato'];

/** 収穫の単位と参考単価（実績の金額換算用） */
const HARVEST_UNIT = {
  komatsuna: ['株', 40], spinach: ['株', 45], mizuna: ['株', 45], shungiku: ['摘み取り1回', 120],
  leaflettuce: ['枚', 15], chingensai: ['株', 60], rucola: ['株', 25],
  broccoli: ['個', 130], cabbage: ['玉', 200], hakusai: ['玉', 350],
  daikon: ['本', 180], kabu: ['個', 60], carrot: ['本', 50], radish: ['個', 20],
  potato: ['kg', 400], sweetpotato: ['kg', 500],
  minitomato: ['個', 12], eggplant: ['本', 70], pepper: ['個', 40], cucumber: ['本', 70],
  edamame: ['さや', 4], okra: ['本', 25], goya: ['本', 130], ingen: ['さや', 6],
  snappea: ['さや', 8], soramame: ['さや', 35], strawberry: ['個', 40], zucchini: ['本', 150],
  onion: ['個', 50], garlic: ['個', 250], negi: ['束', 130], nira: ['束', 130],
  myoga: ['個', 60], shiso: ['枚', 10], basil: ['g', 20], parsley: ['束', 100], mint: ['束', 100]
};
function harvestUnitOf(v) { return (HARVEST_UNIT[v.id] || ['収穫', 0])[0]; }
function harvestPriceOf(v) { return (HARVEST_UNIT[v.id] || ['収穫', 0])[1]; }

/* ---------------------------------------------------------
   レコードの整形
   --------------------------------------------------------- */
function ensureCropShape(c) {
  if (!c.id) c.id = 'c' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
  if (!Array.isArray(c.entries)) c.entries = [];
  if (c.ended === undefined) c.ended = false;
  c.place = 'plot';                       // 畑のみを扱うため、旧データのプランター記録も畑として扱う
  return c;
}
function cropById(id) { return APP.crops.find(c => c.id === id); }
function daysBetween(a, b) { return Math.round((b - a) / 86400000); }
function parseDate(s) { return new Date(s + 'T00:00:00'); }
function todayStr(d) {
  d = d || APP.today;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 最新の観察記録 */
function latestEntry(c) {
  const es = c.entries.filter(e => e.stage || (e.symptoms || []).length || e.vigor);
  if (!es.length) return null;
  return es.slice().sort((a, b) => (a.date < b.date ? 1 : -1))[0];
}
/** 指定作業を最後に行ってからの日数（未記録なら null） */
function daysSinceWork(c, workId) {
  const es = c.entries.filter(e => (e.works || []).includes(workId));
  if (!es.length) return null;
  const last = es.slice().sort((a, b) => (a.date < b.date ? 1 : -1))[0];
  return daysBetween(parseDate(last.date), APP.today);
}

/* ---------------------------------------------------------
   診断エンジン
   --------------------------------------------------------- */
function diagnose(c) {
  ensureCropShape(c);
  const v = byId(c.vegId);
  if (!v) return { v: null, msgs: [] };
  const p = v.plans.find(x => x.id === c.planId) || v.plans[0];
  const days = Math.max(0, daysBetween(parseDate(c.date), APP.today));
  const stages = stagesOf(v);
  const ratio = p.days ? days / p.days : 0;
  const now = APP.nowDek;
  const [mon] = undek(now);

  const msgs = [];
  const seen = {};
  function push(level, title, body) {
    if (seen[title]) return;
    seen[title] = 1;
    msgs.push({ level: level, title: title, body: body });
  }

  /* 期待されるステージと、記録された実際のステージ */
  let expIdx = 0;
  stages.forEach((s, i) => { if (ratio >= s.at) expIdx = i; });
  const entry = latestEntry(c);
  const actIdx = entry && entry.stage ? stages.findIndex(s => s.id === entry.stage) : -1;
  const curId = actIdx >= 0 ? stages[actIdx].id : null;

  /* この栽培が終盤かどうか（終盤なら育成系のリマインドは出さない） */
  const finished = c.ended || ['end', 'dormant'].includes(curId) ||
    (actIdx < 0 && ratio > (stages[stages.length - 1].at));
  const frostTender = ['minitomato', 'eggplant', 'pepper', 'basil', 'okra',
    'sweetpotato', 'goya', 'cucumber', 'zucchini'].includes(v.id);
  const frostRisk = frostTender && (mon === 11 || mon === 12 || mon <= 2);

  /* --- 1. 終了段階なら、片付けと次作の提案に切り替える --- */
  if (finished || frostRisk) {
    if (frostRisk) {
      push('red', '霜に当たると枯れます',
        'この立地では11月下旬から霜が降ります。この作物は耐えられないので、残りを収穫して株を片付けてください。');
    } else {
      push('', 'この栽培は終盤です',
        '株を抜いて根を取り除き、完熟堆肥を入れて2〜4週間休ませると、次の作物がよく育ちます。片付けたら「終了にする」を押してください。');
    }
    const fam = FAMILY_INFO[v.family];
    push('blue', `この場所は次に ${v.family} 以外を`,
      `${v.family}は${fam ? fam.rest : 1}年空けるのが原則です（同じ科：${fam ? fam.members : ''}）。`);
    const next = startableNow(1)
      .filter(x => x.v.place.includes(c.place) && x.v.family !== v.family && x.v.id !== v.id)
      .slice(0, 3);
    if (next.length) {
      push('green', '跡地に今から植えられるもの',
        next.map(x => `${x.v.emoji}${x.v.name}（${x.p.label}）`).join(' / ') + '　— 詳しくは「今月やること」タブへ。');
    }
    return { v, p, days, stages, expIdx, actIdx, entry, msgs, finished: true, progress: 100 };
  }

  /* --- 2. 生育の進み具合 --- */
  if (actIdx >= 0) {
    const diff = actIdx - expIdx;
    if (diff <= -2) {
      const causes = [];
      if (v.sun === 'full') causes.push('日当たり不足（この作物は1日6時間以上必要）');
      if (daysSinceWork(c, 'fert') === null && FERT_INTERVAL[v.category] && !NO_FERT.includes(v.id))
        causes.push('追肥をまだ一度もしていない');
      if (['葉物', '根菜'].includes(v.category) && daysSinceWork(c, 'thin') === null)
        causes.push('間引き不足による密植');
      if (mon >= 12 || mon <= 2) causes.push('低温による生育停止（冬は正常な現象）');
      if (mon >= 7 && mon <= 8) causes.push('高温・水切れによる停滞');
      push('red', `生育が遅れています（標準は「${stages[expIdx].label}」）`,
        (causes.length ? '考えられる原因：' + causes.join(' / ') + '。' : '')
        + '日照・水・肥料・株間の4点を順に確認してください。'
        + (mon >= 12 || mon <= 2 ? '冬は生育が止まって当然なので、慌てて追肥しないこと。春に一気に伸びます。' : ''));
    } else if (diff === -1) {
      push('', 'ほぼ標準の範囲です',
        `現在「${stages[actIdx].label}」。標準は「${stages[expIdx].label}」で、わずかに後ろですが天候によるずれの範囲です。`);
    } else {
      push('green', '想定どおりに育っています',
        `現在「${stages[actIdx].label}」。標準は「${stages[expIdx].label}」なので順調です。`);
    }

    /* ステージ固有 */
    if (curId === 'germ' && ['葉物', '根菜'].includes(v.category)) {
      push('blue', '今やること：間引きと防虫',
        `混み合った所を間引いて、最終的に株間${v.spacing.plant}cmにします。`
        + (v.family === 'アブラナ科' ? 'この時期の虫害が最も致命的です。防虫ネットをまだなら今すぐ掛けてください。' : ''));
    }
    if (curId === 'true5' && v.category === '根菜') {
      push('blue', '今やること：最終間引きと追肥',
        `株間${v.spacing.plant}cmに仕上げます。ここで間引きが甘いと、根が最後まで太りません。`);
    }
    if (curId === 'flower' && v.category === '果菜') {
      push('blue', '今やること：着果の確認と追肥開始',
        '最初の実がピンポン玉大になったら追肥を始めます。それより早い追肥は「つるボケ」の原因です。'
        + (['cucumber', 'zucchini', 'goya', 'strawberry'].includes(v.id)
            ? '実つきが悪ければ、朝のうちに雄花の花粉を雌花につける人工授粉が確実です。' : ''));
    }
    if (curId === 'harvest' || curId === 'peak') {
      push('green', '収穫期です',
        `${v.yieldNote}。`
        + (v.id === 'broccoli' ? '頂花蕾を穫ったあとも株を抜かず、追肥すれば側花蕾が春まで穫れます（収量が3倍変わります）。' : '穫り遅れると味が落ちる作物が多いので、こまめに見てください。')
        + '収穫したら下の「記録を追加」で数量を残すと、年間の実績が集計されます。');
    }
    if (curId === 'bolt') {
      push('red', 'とう立ちしています',
        '花芽ができると葉や根は硬くなります。止められないので、硬くなる前に全部収穫してください。菜花として食べられる作物も多いです。次からは晩抽性の品種を選びます。');
    }
    if (curId === 'yellow' && v.category === 'イモ') {
      push('blue', '収穫のサインです',
        '茎葉が黄色くなったら収穫適期。晴天が2〜3日続いた日に掘り上げ、半日干してから保存してください。');
    }
  } else {
    push('', '状態を記録するとアドバイスが具体的になります',
      `経過${days}日なので、標準的には「${stages[expIdx].label}」のころです。下の「記録を追加」から今の状態を入力してください。`);
  }

  /* --- 3. 見た目の入力から --- */
  let fertAdvised = false;
  if (entry) {
    if (entry.vigor === 'leggy') {
      push('red', '徒長しています（ひょろ長い）',
        '原因は【日照不足】【密植】【窒素過多】のいずれか。間引いて株間を空け、追肥は止めてください。'
        + (v.sun === 'full' ? `${v.name}は1日6時間以上の直射日光が必要です。日陰になる畝ではどうやっても徒長します。` : ''));
    }
    if (entry.vigor === 'small') {
      push('', '株が大きくならない',
        `多いのは【株間が狭い】【肥料切れ】【土が浅い・硬い】の3つ。${v.name}は株間${v.spacing.plant}cm・深さ${v.depth}cm以上の耕土が必要です。`
        + '畝を深く耕せていないと、途中で必ず頭打ちになります。');
    }
    if (entry.leaf === 'pale') {
      const fd = daysSinceWork(c, 'fert');
      if (NO_FERT.includes(v.id)) {
        push('', '葉の色が薄い',
          `${v.name}は無肥料で育てる作物です。葉色の薄さは正常な範囲のことが多いので、追肥しないでください（つるボケの原因になります）。`);
        fertAdvised = true;
      } else if (fd === null || fd > (FERT_INTERVAL[v.category] || 25)) {
        push('blue', '肥料切れの可能性が高い',
          `${fd === null ? 'まだ追肥の記録がありません' : `最後の追肥から${fd}日経っています`}。${v.fert} 追肥は株元ではなく、葉の先端の真下あたりに施すと効きます。`);
        fertAdvised = true;
      } else {
        push('', '葉の色が薄い',
          `追肥は${fd}日前に済んでいるので、水のやりすぎや水はけの悪さによる根傷みも疑ってください。畝が低いと雨のあとに水が溜まります。`);
        fertAdvised = true;
      }
    }
    if (entry.leaf === 'deep' && ['豆', 'イモ'].includes(v.category)) {
      push('', '葉が濃すぎるかもしれません',
        `${v.category === '豆' ? 'マメ科は根粒菌が窒素を作るため、' : 'イモ類は'}肥料が多いと葉ばかり茂って実（芋）がつきません。追肥は止めてください。`);
      fertAdvised = true;
    }
    if (entry.leaf === 'spot') {
      push('', '斑点・変色がある',
        'べと病・炭疽病などの糸状菌が疑われます。病葉を切り取って畑の外へ出し、下葉を整理して風通しを確保してください。窒素過多も発病を助長します。');
    }
  }

  /* --- 4. 症状から（野菜固有 → 一般の順に、重複させない） --- */
  if (entry && entry.symptoms && entry.symptoms.length) {
    entry.symptoms.forEach(sid => {
      const obs = OBS_SYMPTOMS.find(o => o.id === sid);
      if (!obs) return;
      const own = (v.troubles || []).find(t =>
        (obs.kw || []).some(k => (t.name + t.sign + (t.cause || '')).includes(k)));
      if (own) {
        push('red', `${v.name}の「${own.name}」の可能性`,
          `${own.cause ? '原因：' + own.cause + '　' : ''}→ ${own.fix}`);
        return;
      }
      const s = obs.sym ? SYMPTOMS.find(x => x.id === obs.sym) : null;
      if (s) {
        push('red', obs.label, s.causes.slice(0, 2).map(cz => `【${cz.name}】${cz.fix}`).join(' '));
      } else if (sid === 'crack') {
        push('', '実・根が割れた',
          '乾いた状態から急に大量の水が入ると割れます。水やりを一定にし、大雨の前に収穫するのが対策です。味は変わらないので食べられます。');
      } else if (sid === 'slow') {
        push('', '生育が遅い',
          '日照 → 株間 → 肥料 → 土の深さ の順に確認してください。冬季の停滞は正常です。');
      }
      if (sid === 'nogerm') fertAdvised = true;   // 発芽段階では追肥を勧めない
    });
  }

  /* --- 5. 作業の抜け --- */
  if (v.family === 'アブラナ科' && days < 60 && daysSinceWork(c, 'net') === null && mon >= 3 && mon <= 10) {
    push('red', '防虫ネットの記録がありません',
      'アブラナ科は「虫が出てから」では手遅れです。種まき・定植と同時に掛けるのが唯一の実用的な対策。掛けたら下の作業記録にチェックしてください。');
  }
  if (!fertAdvised && !NO_FERT.includes(v.id) && FERT_INTERVAL[v.category]) {
    const fd = daysSinceWork(c, 'fert');
    const iv = FERT_INTERVAL[v.category];
    if (v.id === 'onion') {
      if ((mon === 2 || mon === 3) && (fd === null || fd > 25))
        push('blue', 'タマネギの追肥時期です',
          '2月と3月上旬の2回だけ追肥します。3月下旬以降の追肥はとう立ちと貯蔵性の低下を招くので厳禁です。');
    } else if (ratio > 0.25 && (fd === null ? days > iv : fd > iv)) {
      push('blue', '追肥のタイミングです',
        `${fd === null ? `植えてから${days}日、まだ追肥の記録がありません` : `最後の追肥から${fd}日経っています`}。${v.fert}`);
    }
  }
  if (['minitomato', 'eggplant', 'pepper'].includes(v.id) && actIdx >= 2 && mon >= 5 && mon <= 10) {
    const sd = daysSinceWork(c, 'sideshoot');
    if (sd === null || sd > 7) {
      push('blue', 'わき芽かきの時期です',
        '葉の付け根から出る芽を摘みます。週2回チェックが目安。放置すると枝が増えすぎて実が小さくなります。');
    }
  }
  if (mon >= 7 && mon <= 8) {
    const wd = daysSinceWork(c, 'water');
    if (wd !== null && wd >= 7) {
      push('red', '真夏の水やりが1週間以上ありません',
        '地植えでも、真夏に1週間以上雨がなければ水やりが必要です。朝のうちに株元へたっぷり与え、敷きわらで地面の乾燥を抑えてください。');
    }
  }

  /* --- 6. 季節リスク（関係する作物だけ） --- */
  if ((mon === 9 || mon === 10) && ['果菜', '豆'].includes(v.category)) {
    push('', '台風への備え',
      '支柱を杭にしっかり固定し、背の高い株は倒伏防止に紐で寄せておくと安心です。');
  }
  if (mon === 6 && ['果菜', '豆'].includes(v.category)) {
    push('', '梅雨の病気に注意',
      '泥はねが病気の入口になります。株元に敷きわらを敷き、混み合った下葉を整理して風を通してください。');
  }

  /* --- 7. 次の作業（この栽培の残りの工程のうち、2ヶ月以内のもの） --- */
  const nxt = nextStepOf(p, now);
  if (nxt && nxt.d <= 6) {
    push('blue', `次の作業：${nxt.s.label}`, `${dekLabel(nxt.at)}ごろ（約${Math.round(nxt.d * DEK_DAYS)}日後）が目安です。`);
  }

  return { v, p, days, stages, expIdx, actIdx, entry, msgs, finished: false, progress: Math.min(100, Math.round(ratio * 100)) };
}

/* ---------------------------------------------------------
   記録タブの描画
   --------------------------------------------------------- */
function renderLogTab() {
  APP.crops.forEach(ensureCropShape);
  const list = document.getElementById('logList');

  if (!APP.crops.length) {
    list.innerHTML = '<div class="empty">まだ登録がありません。上のフォームから、いま育てているもの（これから植えるもの）を登録してください。</div>';
  } else {
    let h = '';
    APP.crops.forEach(c => {
      const d = diagnose(c);
      if (!d.v) return;
      const v = d.v, p = d.p;
      h += `<div class="card" data-crop="${c.id}">`;

      /* ヘッダ */
      h += `<div class="crop-row" style="border-bottom:none;padding-top:0">
        <div class="cicon">${v.emoji}</div>
        <div class="cbody">
          <div class="ctitle">${esc(v.name)}${c.ended ? ' <span class="pill">終了</span>' : ''}</div>
          <div class="tiny">${esc(p.label)} ／ ${c.date} 開始 ／ ${d.days}日経過 ／ ${c.qty}株</div>
          <div class="progress"><i style="width:${d.progress}%"></i></div>
          <div class="tiny">${d.actIdx >= 0 ? '記録上の状態：<b>' + esc(d.stages[d.actIdx].label) + '</b>' : '状態は未記録'}
            ／ 標準的な進み：${esc(d.stages[d.expIdx].label)}</div>
        </div>
        <div class="crop-actions vertical">
          <button class="btn sm" data-act="toggleform" data-crop="${c.id}">記録を追加</button>
          <button class="btn sm ghost" data-act="end" data-crop="${c.id}">${c.ended ? '再開' : '終了にする'}</button>
          <button class="btn sm danger" data-act="del" data-crop="${c.id}">削除</button>
        </div>
      </div>`;

      /* 診断 */
      h += `<h3 class="sub">🩺 いまのアドバイス</h3>`;
      d.msgs.slice(0, 8).forEach(m => {
        h += `<div class="note ${m.level}" style="margin:8px 0"><strong>${esc(m.title)}</strong>${m.body}</div>`;
      });

      /* 入力フォーム */
      h += `<div class="entry-form" data-form="${c.id}" hidden>
        <h3 class="sub">✍️ 今の状態を記録する</h3>
        <div class="row">
          <div class="field"><label class="f">日付</label>
            <input type="date" data-f="date" value="${todayStr()}"></div>
          <div class="field"><label class="f">生育ステージ</label>
            <select data-f="stage"><option value="">（選ばない）</option>
              ${d.stages.map(s => `<option value="${s.id}"${d.actIdx >= 0 && d.stages[d.actIdx].id === s.id ? ' selected' : ''}>${esc(s.label)}</option>`).join('')}
            </select></div>
          <div class="field"><label class="f">株の様子</label>
            <select data-f="vigor"><option value="">（選ばない）</option>
              ${VIGOR_OPTS.map(o => `<option value="${o.id}">${esc(o.label)}</option>`).join('')}
            </select></div>
          <div class="field"><label class="f">葉の色</label>
            <select data-f="leaf"><option value="">（選ばない）</option>
              ${LEAF_OPTS.map(o => `<option value="${o.id}">${esc(o.label)}</option>`).join('')}
            </select></div>
          <div class="field"><label class="f">草丈（cm・任意）</label>
            <input type="number" data-f="height" min="0" max="400" style="width:100px"></div>
        </div>

        <label class="f" style="margin-top:8px">気になること（当てはまるものすべて）</label>
        <div class="checks">${OBS_SYMPTOMS.map(o =>
          `<label class="check"><input type="checkbox" data-sym="${o.id}"> ${esc(o.label)}</label>`).join('')}</div>

        <label class="f" style="margin-top:10px">今日やった作業</label>
        <div class="checks">${WORK_TYPES.map(o =>
          `<label class="check"><input type="checkbox" data-work="${o.id}"> ${esc(o.label)}</label>`).join('')}</div>

        <div class="row" style="margin-top:10px">
          <div class="field"><label class="f">収穫量（任意）</label>
            <input type="number" data-f="hqty" min="0" max="9999" style="width:100px" placeholder="0">
            <span class="tiny"> ${esc(harvestUnitOf(v))}</span></div>
          <div class="field" style="flex:1;min-width:220px"><label class="f">メモ</label>
            <input type="text" data-f="memo" placeholder="気づいたこと・天気など" style="width:100%"></div>
          <div class="field"><button class="btn" data-act="save" data-crop="${c.id}">記録する</button></div>
        </div>
      </div>`;

      /* 日誌 */
      if (c.entries.length) {
        h += `<h3 class="sub">📖 これまでの記録（${c.entries.length}件）</h3><div class="timeline">`;
        c.entries.slice().sort((a, b) => (a.date < b.date ? 1 : -1)).forEach(e => {
          const st = e.stage ? (d.stages.find(s => s.id === e.stage) || {}).label : null;
          const syms = (e.symptoms || []).map(s => (OBS_SYMPTOMS.find(o => o.id === s) || {}).label).filter(Boolean);
          const wks = (e.works || []).map(w => (WORK_TYPES.find(o => o.id === w) || {}).label).filter(Boolean);
          h += `<div class="tl-item">
            <div class="tl-date">${e.date}<span class="tiny"> (${daysBetween(parseDate(c.date), parseDate(e.date))}日目)</span></div>
            <div class="tl-body">
              ${st ? `<span class="pill green">${esc(st)}</span>` : ''}
              ${e.height ? `<span class="pill">草丈 ${e.height}cm</span>` : ''}
              ${e.harvest && e.harvest.qty ? `<span class="pill accent">収穫 ${e.harvest.qty}${esc(e.harvest.unit)}</span>` : ''}
              ${syms.map(s => `<span class="pill red">${esc(s)}</span>`).join('')}
              ${wks.map(s => `<span class="pill blue">${esc(s)}</span>`).join('')}
              ${e.memo ? `<div class="muted" style="margin-top:4px">${esc(e.memo)}</div>` : ''}
            </div>
            <button class="sx" data-act="delentry" data-crop="${c.id}" data-entry="${e.id}">×</button>
          </div>`;
        });
        h += '</div>';
      }

      h += '</div>';
    });
    list.innerHTML = h;
  }

  bindLogEvents();
  renderLogSummary();
}

function bindLogEvents() {
  const list = document.getElementById('logList');
  list.querySelectorAll('[data-act]').forEach(b => {
    b.onclick = () => {
      const c = cropById(b.dataset.crop);
      if (!c) return;
      const act = b.dataset.act;
      if (act === 'toggleform') {
        const f = list.querySelector(`[data-form="${c.id}"]`);
        if (f) f.hidden = !f.hidden;
      } else if (act === 'del') {
        if (!confirm(`「${byId(c.vegId).name}」の記録をすべて削除します。よろしいですか？`)) return;
        APP.crops = APP.crops.filter(x => x.id !== c.id);
        saveCrops();
      } else if (act === 'end') {
        c.ended = !c.ended;
        saveCrops();
      } else if (act === 'delentry') {
        c.entries = c.entries.filter(e => e.id !== b.dataset.entry);
        saveCrops();
      } else if (act === 'save') {
        saveEntry(c, list.querySelector(`[data-form="${c.id}"]`));
      }
    };
  });
}

function saveEntry(c, form) {
  if (!form) return;
  const g = sel => form.querySelector(`[data-f="${sel}"]`);
  const v = byId(c.vegId);
  const entry = {
    id: 'e' + Math.random().toString(36).slice(2, 9),
    date: g('date').value || todayStr(),
    stage: g('stage').value || '',
    vigor: g('vigor').value || '',
    leaf: g('leaf').value || '',
    height: g('height').value ? parseInt(g('height').value, 10) : null,
    symptoms: Array.from(form.querySelectorAll('[data-sym]')).filter(x => x.checked).map(x => x.dataset.sym),
    works: Array.from(form.querySelectorAll('[data-work]')).filter(x => x.checked).map(x => x.dataset.work),
    memo: (g('memo').value || '').slice(0, 300)
  };
  const hq = parseFloat(g('hqty').value);
  if (hq > 0) entry.harvest = { qty: hq, unit: harvestUnitOf(v) };
  const empty = !entry.stage && !entry.vigor && !entry.leaf && !entry.height &&
    !entry.symptoms.length && !entry.works.length && !entry.memo && !entry.harvest;
  if (empty) { alert('記録する内容を1つ以上入力してください。'); return; }
  c.entries.push(entry);
  saveCrops();
}

function saveCrops() {
  Store.set('crops', APP.crops);
  renderLogTab();
  renderNow();
}

/* ---------------------------------------------------------
   収穫実績・見込み・バックアップ
   --------------------------------------------------------- */
function renderLogSummary() {
  const box = document.getElementById('logHarvest');
  let h = '';

  /* 実績 */
  const actual = {};
  APP.crops.forEach(c => {
    c.entries.forEach(e => {
      if (!e.harvest || !e.harvest.qty) return;
      const k = c.vegId;
      if (!actual[k]) actual[k] = { qty: 0, unit: e.harvest.unit, times: 0, first: e.date, last: e.date };
      actual[k].qty += e.harvest.qty;
      actual[k].times++;
      if (e.date < actual[k].first) actual[k].first = e.date;
      if (e.date > actual[k].last) actual[k].last = e.date;
    });
  });
  const keys = Object.keys(actual);
  h += '<h3>🧺 収穫の実績</h3>';
  if (!keys.length) {
    h += '<div class="tiny">まだ収穫の記録がありません。各栽培の「記録を追加」で収穫量を入力すると、ここに累計と金額換算が出ます。</div>';
  } else {
    let total = 0;
    h += '<div class="table-wrap"><table class="data"><thead><tr><th>野菜</th><th class="num">収穫回数</th><th class="num">累計</th><th>期間</th><th class="num">金額換算</th></tr></thead><tbody>';
    keys.forEach(k => {
      const v = byId(k), a = actual[k];
      const money = Math.round(a.qty * harvestPriceOf(v));
      total += money;
      h += `<tr><td>${v.emoji} ${esc(v.name)}</td><td class="num">${a.times}回</td>
        <td class="num">${a.qty}${esc(a.unit)}</td><td class="tiny">${a.first} 〜 ${a.last}</td>
        <td class="num">${money.toLocaleString()}円</td></tr>`;
    });
    h += `</tbody><tfoot><tr><th colspan="4">合計</th><th class="num">${total.toLocaleString()}円</th></tr></tfoot></table></div>`;
    h += `<div class="tiny" style="margin-top:6px">※スーパーの一般的な価格での換算です。</div>`;
  }

  /* 見込み */
  if (APP.crops.length) {
    let sum = 0;
    h += '<h3 style="margin-top:22px">📈 これからの収穫見込み</h3><div class="table-wrap"><table class="data"><thead><tr><th>野菜</th><th>収穫期</th><th>収量の目安</th><th class="num">金額換算</th></tr></thead><tbody>';
    APP.crops.filter(c => !c.ended).forEach(c => {
      const v = byId(c.vegId);
      const p = v.plans.find(x => x.id === c.planId) || v.plans[0];
      const hv = harvestStep(p);
      const amount = valuePerPlant(v) * c.qty;
      sum += amount;
      h += `<tr><td>${v.emoji} ${esc(v.name)}</td><td>${hv ? rangeLabel(hv.from, hv.to) : '—'}</td>
        <td class="tiny">${esc(v.yieldNote)}</td><td class="num">約 ${amount.toLocaleString()}円</td></tr>`;
    });
    h += `</tbody><tfoot><tr><th colspan="3">合計</th><th class="num">約 ${sum.toLocaleString()}円</th></tr></tfoot></table></div>`;
  }

  /* バックアップ */
  h += `<h3 style="margin-top:22px">💾 データの保存とバックアップ</h3>
    <div class="muted" style="margin-bottom:8px">
      記録はこのブラウザの中だけに保存されています。ブラウザのデータを消すと失われるので、
      ときどき書き出してください。書き出したファイルは、別の端末やブラウザで読み込めます。
    </div>
    <div class="row btnrow">
      <button class="btn ghost" id="btnExport">書き出す</button>
      <button class="btn ghost" id="btnImport">読み込む</button>
      <input type="file" id="fileImport" accept="application/json" style="display:none">
    </div>
    <div style="text-align:right;margin-top:10px">
      <button class="btn sm danger" id="btnClear">すべて消去</button>
    </div>`;

  box.innerHTML = h;

  const ex = document.getElementById('btnExport');
  if (ex) ex.onclick = exportJournal;
  const im = document.getElementById('btnImport');
  if (im) im.onclick = () => document.getElementById('fileImport').click();
  const fi = document.getElementById('fileImport');
  if (fi) fi.onchange = e => importJournal(e.target.files[0]);
  const cl = document.getElementById('btnClear');
  if (cl) cl.onclick = () => {
    if (!confirm('すべての栽培記録と作付けプランを消去します。元に戻せません。よろしいですか？')) return;
    APP.crops = []; Store.set('crops', []);
    renderLogTab(); renderNow();
  };
}

function exportJournal() {
  const data = {
    app: 'my-harvest', version: 1, exportedAt: new Date().toISOString(),
    site: SITE.name, crops: APP.crops, sim: APP.sim
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `my-harvest-${todayStr()}.json`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

function importJournal(file) {
  if (!file) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      if (!d || d.app !== 'my-harvest' || !Array.isArray(d.crops)) throw new Error('形式が違います');
      if (!confirm(`${d.crops.length}件の栽培記録を読み込みます。現在の記録は置き換えられます。よろしいですか？`)) return;
      APP.crops = d.crops.map(ensureCropShape);
      Store.set('crops', APP.crops);
      if (d.sim && Array.isArray(d.sim.items)) { APP.sim = d.sim; Store.set('sim', APP.sim); }
      renderLogTab(); renderNow(); renderSim();
      alert('読み込みました。');
    } catch (e) {
      alert('読み込めませんでした：' + e.message);
    }
  };
  r.readAsText(file);
}
