/* =========================================================
   作付けシミュレーター（畝単位）

   敷地の寸法から畝の本数と長さを割り出し、
   「株間 × 条数」で畝を何cm使うかを計算して作付けを検証する。
   ========================================================= */

const BED_MARGIN = 20;     // 畝の両肩に空ける余裕（左右10cmずつ）

/** 一般的な家庭で消費しきれる現実的な株数の上限（自動プラン用） */
const MAX_QTY = {
  mint: 1, shiso: 2, basil: 3, parsley: 3, myoga: 6, nira: 6,
  negi: 30, rucola: 40, strawberry: 10, zucchini: 1, goya: 2,
  minitomato: 4, eggplant: 2, pepper: 3, cucumber: 2, okra: 4,
  broccoli: 4, cabbage: 3, hakusai: 3, sweetpotato: 8, potato: 12,
  onion: 60, garlic: 30, edamame: 20, snappea: 8, soramame: 6,
  ingen: 12, daikon: 15, carrot: 60, kabu: 30, radish: 60,
  komatsuna: 40, mizuna: 20, spinach: 40, shungiku: 12,
  chingensai: 12, leaflettuce: 8
};
function capQty(v, n) { return Math.max(1, Math.min(n, MAX_QTY[v.id] || 999)); }

/* ---------------------------------------------------------
   畝の計算
   --------------------------------------------------------- */

/* --- 敷地の形（四角形） ---------------------------------
   4辺の長さから頂点を決める。左辺を垂直に固定して基準にする。
   左右・上下が等しければ長方形になる。
   ------------------------------------------------------- */

/** 2円の交点（中心 p1 半径 r1 と 中心 p2 半径 r2）。無ければ null */
function circleIntersect(p1, r1, p2, r2) {
  const dx = p2.x - p1.x, dy = p2.y - p1.y;
  const d = Math.hypot(dx, dy);
  if (d > r1 + r2 || d < Math.abs(r1 - r2) || d === 0) return null;
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const h2 = r1 * r1 - a * a;
  if (h2 < 0) return null;
  const h = Math.sqrt(h2);
  const mx = p1.x + a * dx / d, my = p1.y + a * dy / d;
  return [
    { x: mx + h * dy / d, y: my - h * dx / d },
    { x: mx - h * dy / d, y: my + h * dx / d }
  ];
}

/** 敷地の4頂点 [左上, 右上, 右下, 左下]。成立しない寸法なら null */
function plotPolygon(e) {
  const A = { x: 0, y: 0 };            // 左上
  const B = { x: e.top, y: 0 };        // 右上（上辺の長さ）
  const D = { x: 0, y: e.left };       // 左下（左辺の長さ）
  const hits = circleIntersect(B, e.right, D, e.bottom);
  if (!hits) return null;
  // 下側（y が大きい方）を右下の頂点とする
  const C = hits[0].y >= hits[1].y ? hits[0] : hits[1];
  if (C.x <= 0 || C.y <= 0) return null;
  return [A, B, C, D];
}

/** 多角形を x/y 入れ替え（畝を東西方向に走らせるときに使う） */
function swapPoly(poly) { return poly.map(p => ({ x: p.y, y: p.x })); }

/** 多角形の面積（cm²） */
function polyArea(poly) {
  let a = 0;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length];
    a += p.x * q.y - q.x * p.y;
  }
  return Math.abs(a) / 2;
}

/** x の位置で多角形が縦にどこからどこまでか。外なら null */
function spanAtX(poly, x) {
  const ys = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length];
    if (p.x === q.x) { if (Math.abs(p.x - x) < 1e-6) { ys.push(p.y, q.y); } continue; }
    const lo = Math.min(p.x, q.x), hi = Math.max(p.x, q.x);
    if (x < lo - 1e-6 || x > hi + 1e-6) continue;
    ys.push(p.y + (q.y - p.y) * (x - p.x) / (q.x - p.x));
  }
  if (ys.length < 2) return null;
  return { top: Math.min.apply(null, ys), bottom: Math.max.apply(null, ys) };
}

/** 幅[x1,x2]の帯が敷地に収まる範囲。帯の全域で共通の上端・下端をとる */
function stripSpan(poly, x1, x2) {
  let top = -Infinity, bottom = Infinity;
  const N = 12;
  for (let i = 0; i <= N; i++) {
    const sp = spanAtX(poly, x1 + (x2 - x1) * i / N);
    if (!sp) return null;
    top = Math.max(top, sp.top);
    bottom = Math.min(bottom, sp.bottom);
  }
  const len = bottom - top;
  return len > 0 ? { top: top, len: len } : null;
}

const MIN_BED_LEN = 50;   // これより短い畝は作らない

/** 敷地の形と畝幅・通路幅から、畝の本数・位置・長さを割り出す */
function bedLayout(s) {
  const e = s.edges;
  const poly0 = plotPolygon(e);
  if (!poly0) return { count: 0, beds: [], poly: null, ok: false, plotM2: 0, areaM2: 0, tatami: 0, bedW: s.bedW };
  const poly = s.dir === 'ew' ? swapPoly(poly0) : poly0;   // 東西畝なら軸を入れ替えて計算
  const maxX = Math.max.apply(null, poly.map(p => p.x));

  const beds = [];
  let x = 0, guard = 0;
  while (x + s.bedW <= maxX + 1e-6 && guard++ < 20) {
    const sp = stripSpan(poly, x, x + s.bedW);
    if (sp && sp.len >= MIN_BED_LEN) {
      beds.push({ x: x, w: s.bedW, top: sp.top, len: Math.round(sp.len) });
    }
    x += s.bedW + s.pathW;
  }
  const plotM2 = polyArea(poly0) / 10000;
  const areaM2 = beds.reduce((a, b) => a + b.w * b.len, 0) / 10000;
  return {
    count: beds.length, beds: beds, poly: poly0, layoutPoly: poly, ok: true,
    bedW: s.bedW, plotM2: plotM2, areaM2: areaM2, tatami: plotM2 / 1.62,
    totalLen: beds.reduce((a, b) => a + b.len, 0)
  };
}

/** 指定した畝（place 文字列）の長さ */
function bedLenOf(place) {
  const lay = bedLayout(APP.sim);
  const i = parseInt(String(place).slice(3), 10);
  return (lay.beds[i] || {}).len || 0;
}

/** その野菜を畝幅に何条植えられるか */
function rowsInBed(v, bedW) {
  const usable = bedW - BED_MARGIN;
  if (usable < 0) return 1;
  return Math.max(1, Math.floor(usable / v.spacing.row) + 1);
}

/** qty株を植えるのに必要な畝の長さ(cm) */
function bedLengthFor(v, qty, bedW) {
  const rows = rowsInBed(v, bedW);
  return Math.ceil(qty / rows) * v.spacing.plant;
}

/** 畝の中での各条の位置（cm・畝の左端からの距離）。畝幅の中央に振り分ける */
function rowPositions(v, bedW) {
  const rows = rowsInBed(v, bedW);
  const span = (rows - 1) * v.spacing.row;
  const left = Math.max(BED_MARGIN / 2, (bedW - span) / 2);
  const out = [];
  for (let i = 0; i < rows; i++) out.push(left + i * v.spacing.row);
  return out;
}

/** 畝幅を変えると条数と株数がどう変わるか */
const BED_WIDTH_OPTIONS = [60, 70, 90, 120];
function widthComparison(v, bedLen) {
  return BED_WIDTH_OPTIONS.map(w => {
    const rows = rowsInBed(v, w);
    return {
      bedW: w,
      rows: rows,
      perMeter: rows * Math.floor(100 / v.spacing.plant),
      perBed: bedLen ? qtyForLength(v, bedLen, w) : null,
      // 畝幅に対して株が収まりきらない（条間が畝幅を超える）場合の注意
      tight: v.spacing.row > w - BED_MARGIN / 2
    };
  });
}

/** 畝の長さ len(cm) に何株植えられるか */
function qtyForLength(v, len, bedW) {
  const rows = rowsInBed(v, bedW);
  return Math.max(0, rows * Math.floor(len / v.spacing.plant));
}

/** 1株あたりの金額換算 */
function valuePerPlant(v) {
  const u = v.valueUnit;
  if (/1m²/.test(u)) return Math.round(v.marketValue / v.perM2);
  return v.marketValue; // 1株 / 苗1本 など
}

/** その作型が畝を占有する期間 [開始dek, 終了dek]（貯蔵は除く） */
function planOccupy(p) {
  const active = p.steps.filter(s => s.kind !== 'store');
  const a = dek(active[0].from[0], active[0].from[1]);
  let end = a;
  active.forEach(s => {
    const e = dek(s.to[0], s.to[1]);
    if (dekDistance(a, e) > dekDistance(a, end)) end = e;
  });
  return [a, end];
}

/** ある旬に、その畝がどう使われているか（追加順に畝の先頭から詰める） */
function bedPacking(bedIndex, dekad) {
  const s = APP.sim;
  const segs = [];
  let pos = 0;
  s.items.filter(it => it.place === 'bed' + bedIndex).forEach(it => {
    const v = byId(it.vegId);
    if (!v) return;
    const p = v.plans.find(x => x.id === it.planId);
    if (!p) return;
    const [a, e] = planOccupy(p);
    if (!inRange(dekad, a, e)) return;
    const len = bedLengthFor(v, it.qty, s.bedW);
    segs.push({ v: v, p: p, it: it, start: pos, len: len, rows: rowsInBed(v, s.bedW) });
    pos += len;
  });
  return { segs: segs, used: pos };
}

/* ---------------------------------------------------------
   入力フォーム
   --------------------------------------------------------- */
function simSaveAndRender() {
  Store.set('sim', APP.sim);
  renderSim();
}

function initSimForm() {
  const s = APP.sim;
  const ids = ['edgeLeft', 'edgeRight', 'edgeTop', 'edgeBottom', 'simBedW', 'simPathW', 'simDir'];
  document.getElementById('edgeLeft').value = String(s.edges.left);
  document.getElementById('edgeRight').value = String(s.edges.right);
  document.getElementById('edgeTop').value = String(s.edges.top);
  document.getElementById('edgeBottom').value = String(s.edges.bottom);
  document.getElementById('simBedW').value = String(s.bedW);
  document.getElementById('simPathW').value = String(s.pathW);
  document.getElementById('simDir').value = s.dir;

  const readEdge = (id, fallback) => {
    const n = parseInt(document.getElementById(id).value, 10);
    return (isFinite(n) && n >= 30 && n <= 2000) ? n : fallback;
  };
  ids.forEach(id => {
    document.getElementById(id).onchange = () => {
      s.edges = {
        left: readEdge('edgeLeft', s.edges.left),
        right: readEdge('edgeRight', s.edges.right),
        top: readEdge('edgeTop', s.edges.top),
        bottom: readEdge('edgeBottom', s.edges.bottom)
      };
      document.getElementById('edgeLeft').value = String(s.edges.left);
      document.getElementById('edgeRight').value = String(s.edges.right);
      document.getElementById('edgeTop').value = String(s.edges.top);
      document.getElementById('edgeBottom').value = String(s.edges.bottom);
      s.bedW = parseInt(document.getElementById('simBedW').value, 10) || 70;
      s.pathW = parseInt(document.getElementById('simPathW').value, 10) || 40;
      s.dir = document.getElementById('simDir').value;
      // 無くなった畝の割り当てを整理
      const lay = bedLayout(s);
      s.items = s.items.filter(it => parseInt(it.place.slice(3), 10) < lay.count);
      APP.simEdit = null;
      fillSimPlace();
      simSaveAndRender();
    };
  });

  const vsel = document.getElementById('simVeg');
  const psel = document.getElementById('simPlan');
  fillVegSelect(vsel, psel);
  const origOnChange = vsel.onchange;
  vsel.onchange = () => { origOnChange(); updateSimHint(); };
  psel.onchange = updateSimHint;
  fillSimPlace();
  document.getElementById('simPlace').onchange = updateSimHint;
  updateSimHint();

  document.getElementById('simAdd').onclick = () => {
    const v = byId(vsel.value);
    const p = v.plans.find(x => x.id === psel.value) || v.plans[0];
    APP.sim.items.push({
      vegId: v.id, planId: p.id,
      place: document.getElementById('simPlace').value,
      qty: Math.max(1, parseInt(document.getElementById('simQty').value, 10) || 1)
    });
    simSaveAndRender();
  };
  document.getElementById('simAuto').onclick = () => {
    if (APP.sim.items.length && !confirm('現在の作付けをすべて置き換えて、おまかせの年間プランを作成します。よろしいですか？')) return;
    APP.sim.items = autoPlan();
    simSaveAndRender();
  };
}

function fillSimPlace() {
  const sel = document.getElementById('simPlace');
  const lay = bedLayout(APP.sim);
  let h = '';
  lay.beds.forEach((b, i) => { h += `<option value="bed${i}">畝${i + 1}（幅${b.w}cm × 長さ${b.len}cm）</option>`; });
  sel.innerHTML = h || '<option value="">（畝がありません）</option>';
}

function updateSimHint() {
  const v = byId(document.getElementById('simVeg').value);
  const p = v.plans.find(x => x.id === document.getElementById('simPlan').value) || v.plans[0];
  const place = document.getElementById('simPlace').value;
  const s = APP.sim;
  const lay = bedLayout(s);
  const [a, b] = planOccupy(p);

  const bedLen = bedLenOf(place) || (lay.beds[0] || {}).len || 0;
  let hint = `占有期間：<b>${dekLabel(a)}〜${dekLabel(b)}</b>（約${Math.round(rangeLen(a, b) * DEK_DAYS)}日）`;
  const rows = rowsInBed(v, lay.bedW);
  const cap = qtyForLength(v, bedLen, lay.bedW);
  hint += `<br>畝幅${lay.bedW}cmに <b>${rows}条</b>（条間${v.spacing.row}cm）／ 株間${v.spacing.plant}cm`
        + `<br>この畝（${bedLen}cm）を使い切ると <b>${cap}株</b>`;
  document.getElementById('simQty').value = Math.max(1, Math.min(cap, capQty(v, cap)));
  const qty = parseInt(document.getElementById('simQty').value, 10) || 1;
  hint += ` ／ この株数なら畝の <b>${bedLengthFor(v, qty, lay.bedW)}cm</b> を使います`;

  // 畝幅を変えると何条・何株になるか
  hint += `<div class="wcmp"><div class="wcmp-t">${esc(v.name)}は畝幅でこう変わります</div><table>
    <tr><th>畝幅</th>${widthComparison(v, bedLen).map(c =>
      `<th class="${c.bedW === lay.bedW ? 'cur' : ''}">${c.bedW}cm</th>`).join('')}</tr>
    <tr><th>条数</th>${widthComparison(v, bedLen).map(c =>
      `<td class="${c.bedW === lay.bedW ? 'cur' : ''}">${c.rows}条</td>`).join('')}</tr>
    <tr><th>この畝(${bedLen}cm)</th>${widthComparison(v, bedLen).map(c =>
      `<td class="${c.bedW === lay.bedW ? 'cur' : ''}">${c.perBed}株</td>`).join('')}</tr>
    </table><div class="tiny">条間${v.spacing.row}cm・株間${v.spacing.plant}cm から算出。畝幅は「① 敷地と畝の設定」で変えられます。</div></div>`;
  document.getElementById('simHint').innerHTML = hint;
}

/* ---------------------------------------------------------
   畝の取り方の候補
   敷地が小さいほど、畝幅と通路の取り方で栽培面積が大きく変わる。
   --------------------------------------------------------- */
const BED_W_CHOICES = [40, 50, 60, 70, 90, 100, 110, 120];
const PATH_W_CHOICES = [0, 25, 30, 40];

function bedSuggestions(edges) {
  const out = [];
  const seen = {};
  ['ns', 'ew'].forEach(dir => BED_W_CHOICES.forEach(bedW => PATH_W_CHOICES.forEach(pathW => {
    const lay = bedLayout({ edges: edges, bedW: bedW, pathW: pathW, dir: dir });
    if (!lay.ok || !lay.count) return;
    // 同じ結果になる組み合わせ（通路が効かない場合など）は最小の通路幅だけ残す
    const key = dir + ':' + lay.beds.map(b => b.w + 'x' + b.len).join(',');
    if (seen[key]) return;
    seen[key] = 1;
    out.push({
      dir: dir, bedW: bedW, pathW: pathW, count: lay.count,
      area: lay.areaM2, beds: lay.beds.slice(),
      // 面積を主に、南北方向と輪作しやすさ（2本以上）を少し加点
      score: lay.areaM2 + (dir === 'ns' ? 0.08 : 0) + (lay.count >= 2 ? 0.06 : 0)
    });
  })));
  return out.sort((a, b) => b.score - a.score).slice(0, 5);
}

function renderSuggestions() {
  const box = document.getElementById('simSuggest');
  if (!box) return;
  const s = APP.sim;
  const list = bedSuggestions(s.edges);
  if (!list.length) { box.innerHTML = ''; return; }
  let h = '<div class="sugg"><div class="sugg-t">畝の取り方の候補（栽培面積の大きい順）</div>';
  list.forEach((c, i) => {
    const cur = c.dir === s.dir && c.bedW === s.bedW && c.pathW === s.pathW;
    h += `<button class="sugg-item${cur ? ' cur' : ''}" data-sugg="${i}">
      <span class="sg-main">${c.dir === 'ns' ? '南北' : '東西'} ／ 畝${c.bedW}cm ／ 通路${c.pathW === 0 ? 'なし' : c.pathW + 'cm'}</span>
      <span class="sg-sub">畝${c.count}本（${c.beds.map(b => b.w + '×' + b.len + 'cm').join('、')}） 栽培面積 ${c.area.toFixed(2)}m²</span>
      ${cur ? '<span class="sg-cur">選択中</span>' : ''}
    </button>`;
  });
  h += '</div>';
  box.innerHTML = h;
  box.querySelectorAll('[data-sugg]').forEach(b => {
    b.onclick = () => {
      const c = list[+b.dataset.sugg];
      APP.sim.dir = c.dir; APP.sim.bedW = c.bedW; APP.sim.pathW = c.pathW;
      const lay = bedLayout(APP.sim);
      APP.sim.items = APP.sim.items.filter(it => parseInt(it.place.slice(3), 10) < lay.count);
      APP.simEdit = null;
      document.getElementById('simDir').value = c.dir;
      document.getElementById('simBedW').value = String(c.bedW);
      document.getElementById('simPathW').value = String(c.pathW);
      fillSimPlace();
      simSaveAndRender();
    };
  });
}

function presetSim(vegId) {
  const sel = document.getElementById('simVeg');
  sel.value = vegId;
  if (sel.onchange) sel.onchange();
}

/* ---------------------------------------------------------
   検証
   --------------------------------------------------------- */
function validateSim() {
  const s = APP.sim;
  const lay = bedLayout(s);
  const warns = [];

  if (!lay.ok) {
    warns.push({ level: 'error', place: '敷地',
      msg: '入力された4辺の長さでは四角形になりません（1辺が他の3辺の合計より長い、など）。実測値を確認してください。' });
    return warns;
  }
  for (let b = 0; b < lay.count; b++) {
    const items = s.items.filter(it => it.place === 'bed' + b);
    const name = '畝' + (b + 1);
    const bedLen = lay.beds[b].len;

    // 長さ：各旬に必要な畝の長さ
    let peak = 0, peakDek = 0;
    for (let d = 0; d < 36; d++) {
      const used = bedPacking(b, d).used;
      if (used > peak) { peak = used; peakDek = d; }
    }
    if (peak > bedLen + 1) {
      warns.push({ level: 'error', place: name,
        msg: `${name}は${dekLabel(peakDek)}に長さが足りません（必要 ${Math.round(peak)}cm / この畝の長さ ${bedLen}cm）。株数を減らすか、別の畝・別の時期にずらしてください。` });
    }

    // 連作：同じ畝に同じ科
    const famSeen = {};
    items.forEach(it => {
      const v = byId(it.vegId);
      const fam = FAMILY_INFO[v.family];
      if (!fam || fam.rest <= 1) return;
      if (famSeen[v.family]) {
        warns.push({ level: 'error', place: name,
          msg: `${name}に${v.family}が重複しています（${famSeen[v.family]} と ${v.name}）。${v.family}は${fam.rest}年空けるのが原則です。別の畝へ移してください。` });
      } else famSeen[v.family] = v.name;
    });

    // 同時に何種が同居するか
    let maxConcurrent = 0, concurrentAt = 0;
    for (let d = 0; d < 36; d++) {
      const n = bedPacking(b, d).segs.length;
      if (n > maxConcurrent) { maxConcurrent = n; concurrentAt = d; }
    }
    if (maxConcurrent >= 3) {
      warns.push({ level: 'info', place: name,
        msg: `${name}は${dekLabel(concurrentAt)}に${maxConcurrent}種が同時に育つ計画です。長さは足りていますが、背の高い作物が低い作物に影を作らないよう、畝の北側に背の高いものを配置してください。` });
    }

    // 空き期間
    if (items.length) {
      let empty = 0;
      for (let d = 0; d < 36; d++) if (bedPacking(b, d).used === 0) empty++;
      if (empty >= 12) {
        warns.push({ level: 'info', place: name,
          msg: `${name}は年間で約${Math.round(empty * DEK_DAYS)}日まるごと空いています。空き期間は堆肥を入れて休ませるか、コマツナ・ラディッシュ・インゲンなど短期作物を挟むと効率が上がります。` });
      }
    }
  }

  return warns;
}

/* ---------------------------------------------------------
   自動プラン生成
   --------------------------------------------------------- */

/** cursor から見た待ち時間。適期の窓の中にいるなら 0 */
function waitFrom(cursor, plan) {
  const st = startStep(plan);
  const a = dek(st.from[0], st.from[1]);
  const b = dek(st.to[0], st.to[1]);
  if (inRange(cursor, a, b)) return 0;
  return dekDistance(cursor, a);
}

/** 占有期間中の最小空き容量 */
function minFree(occ, cap, a, e) {
  let mn = Infinity;
  const len = rangeLen(a, e);
  for (let k = 0; k < len; k++) mn = Math.min(mn, cap - occ[(a + k) % 36]);
  return mn;
}
function addOcc(occ, a, e, amount) {
  const len = rangeLen(a, e) + 1;   // 片付け・土づくりに1旬
  for (let k = 0; k < len; k++) occ[(a + k) % 36] += amount;
}

function autoPlan() {
  const s = APP.sim;
  const lay = bedLayout(s);
  const items = [];
  const now = APP.nowDek;
  const usedVeg = {};
  const usedCat = {};

  function nextCursor(occ, cap, threshold, from) {
    for (let k = 0; k < 36; k++) {
      const d = (from + k) % 36;
      if (cap - occ[d] >= threshold) return { dek: d, scanned: k };
    }
    return null;
  }

  function pickBest(opts) {
    const cands = [];
    VEG_DB.forEach(v => {
      if (usedVeg[v.id]) return;
      if (!v.place.includes(opts.place)) return;
      if (opts.maxDepth && v.depth > opts.maxDepth) return;
      if (opts.skipShade && v.sun === 'shade') return;
      if (opts.famUsed && FAMILY_INFO[v.family] && FAMILY_INFO[v.family].rest > 1
          && opts.famUsed[v.family]) return;
      v.plans.forEach(p => {
        const [a, e] = planOccupy(p);
        const wait = waitFrom(opts.cursor, p);
        if (wait > 9) return;
        const free = minFree(opts.occ, opts.cap, a, e);
        const qty = capQty(v, opts.qtyOf(v, free));
        const need = opts.amountOf(v, qty);
        if (need > free + 1e-6) return;
        if (need < opts.cap * 0.12) return;              // 細切れの端数には植えない
        if (v.perM2 >= 20 && qty < 4) return;            // すじまき作物を数株だけ作らない
        const value = valuePerPlant(v) * qty;
        const score = planScore(v, p)
          - wait * 0.8
          + Math.min(value / 1200, 4)
          - (usedCat[v.category] ? 2.5 : 0);
        cands.push({ v, p, a, e, wait, qty, need, score });
      });
    });
    if (!cands.length) return null;
    cands.sort((x, y) => y.score - x.score);
    return cands[0];
  }

  function fill(opts) {
    const occ = new Array(36).fill(0);
    const famUsed = {};
    let scanFrom = now, guard = 0, added = 0;
    while (guard++ < 40 && added < opts.maxItems) {
      const cur = nextCursor(occ, opts.cap, opts.threshold, scanFrom);
      if (cur === null) break;
      const pick = pickBest(Object.assign({
        cursor: cur.dek, occ, cap: opts.cap,
        famUsed: opts.useRotation ? famUsed : null
      }, opts.pick));
      if (!pick) {
        scanFrom = (cur.dek + 1) % 36;
        if (dekDistance(now, scanFrom) === 0) break;
        continue;
      }
      items.push({ vegId: pick.v.id, planId: pick.p.id, place: opts.place, qty: pick.qty });
      usedVeg[pick.v.id] = true;
      usedCat[pick.v.category] = true;
      famUsed[pick.v.family] = true;
      addOcc(occ, pick.a, pick.e, pick.need);
      added++;
      scanFrom = now;
    }
  }

  // --- 畝 ---
  for (let b = 0; b < lay.count; b++) {
    const bedLen = lay.beds[b].len;
    fill({
      place: 'bed' + b, cap: bedLen, threshold: bedLen * 0.25, maxItems: 6, useRotation: true,
      pick: {
        place: 'plot', skipShade: true,
        qtyOf: (v, freeLen) => qtyForLength(v, freeLen, lay.bedW),
        amountOf: (v, qty) => bedLengthFor(v, qty, lay.bedW)
      }
    });
  }
  return items;
}

/* ---------------------------------------------------------
   割り当ての編集
   --------------------------------------------------------- */

/** 同じ畝の中で、ひとつ前／後ろの作付けと入れ替える（平面図の並び順が変わる） */
function moveItem(idx, dir) {
  const list = APP.sim.items;
  const it = list[idx];
  if (!it) return false;
  let j = idx + dir;
  while (j >= 0 && j < list.length && list[j].place !== it.place) j += dir;
  if (j < 0 || j >= list.length) return false;
  list[idx] = list[j];
  list[j] = it;
  APP.simEdit = j;
  return true;
}

/** 作付けの内容を書き換える */
function updateItem(idx, patch) {
  const it = APP.sim.items[idx];
  if (!it) return;
  Object.assign(it, patch);
  const v = byId(it.vegId);
  if (v && !v.plans.some(p => p.id === it.planId)) it.planId = v.plans[0].id;
  it.qty = Math.max(1, Math.min(999, parseInt(it.qty, 10) || 1));
}

/** 編集フォームの HTML */
function slotEditorHtml(it, idx) {
  const v = byId(it.vegId);
  const p = v.plans.find(x => x.id === it.planId) || v.plans[0];
  const lay = bedLayout(APP.sim);
  const bedLen = bedLenOf(it.place);
  const rows = rowsInBed(v, lay.bedW);
  const len = bedLengthFor(v, it.qty, lay.bedW);
  const max = qtyForLength(v, bedLen, lay.bedW);
  const over = len > bedLen;
  let h = `<div class="slot-edit" data-editor="${idx}">`;
  h += `<div class="field"><label class="f">作型</label>
    <select data-ed="planId">${v.plans.map(x =>
      `<option value="${x.id}"${x.id === p.id ? ' selected' : ''}>${START_TYPE[x.start].icon} ${esc(x.label)}</option>`).join('')}</select></div>`;
  h += `<div class="field"><label class="f">畝</label>
    <select data-ed="place">${lay.beds.map((b, i) =>
      `<option value="bed${i}"${it.place === 'bed' + i ? ' selected' : ''}>畝${i + 1}（${b.len}cm）</option>`).join('')}</select></div>`;
  h += `<div class="field"><label class="f">株数（畝1本に最大 ${max}株）</label>
    <div class="qty">
      <button class="qbtn" data-q="${idx}:-10" aria-label="10減らす">−10</button>
      <button class="qbtn" data-q="${idx}:-1" aria-label="1減らす">−1</button>
      <input type="number" data-ed="qty" value="${it.qty}" min="1" max="999" inputmode="numeric">
      <button class="qbtn" data-q="${idx}:1" aria-label="1増やす">＋1</button>
      <button class="qbtn" data-q="${idx}:10" aria-label="10増やす">＋10</button>
    </div>
    <div class="tiny${over ? ' over' : ''}">${rows}条 × ${Math.ceil(it.qty / rows)}株 ＝ 畝の <b>${len}cm</b>
      ／ この畝の長さ ${bedLen}cm${over ? '　⚠️ 畝からはみ出します' : ''}</div></div>`;
  h += `<div class="row btnrow">
    <button class="btn sm ghost" data-mv="${idx}:-1">↑ 前へ</button>
    <button class="btn sm ghost" data-mv="${idx}:1">↓ 後ろへ</button>
    <button class="btn sm danger" data-rm="${idx}">削除</button>
    <button class="btn sm" data-edclose="1">閉じる</button>
  </div>`;
  h += `</div>`;
  return h;
}

/* ---------------------------------------------------------
   描画
   --------------------------------------------------------- */
const BED_COLORS = ['#4a7c3f', '#8b6f47', '#3f6f9e', '#a3563f', '#6b5b95', '#4d8b83', '#9b7d2f', '#7a8b3f'];

function renderSim() {
  const s = APP.sim;
  const lay = bedLayout(s);
  const warns = validateSim();

  /* ---- 畝の構成 ---- */
  const info = document.getElementById('simLayout');
  if (info) {
    if (!lay.ok) {
      info.innerHTML = '<div class="note red" style="margin:0"><strong>この寸法では四角形になりません</strong>1辺が他の3辺の合計より長くなっているようです。実測値を確認してください。</div>';
    } else if (lay.count === 0) {
      info.innerHTML = `<div class="note red" style="margin:0"><strong>畝が作れません</strong>
        「畝幅＋通路幅」が敷地に収まりません。畝幅か通路幅を小さくするか、畝の向きを変えてみてください。</div>`;
    } else {
      info.innerHTML = `<div class="note green" style="margin:0"><strong>この敷地には 畝 ${lay.count}本</strong>
        ${lay.beds.map((b, i) => `畝${i + 1}: 幅${b.w}cm × 長さ${b.len}cm`).join(' ／ ')}（通路${s.pathW}cm・${s.dir === 'ns' ? '南北' : '東西'}方向）<br>
        栽培面積 ${lay.areaM2.toFixed(2)}m² ／ 敷地 ${lay.plotM2.toFixed(2)}m²（約${lay.tatami.toFixed(1)}畳）
        <span class="tiny">畝の合計の長さ ${lay.totalLen}cm がこのシミュレーションの「容量」です。${
          s.pathW === 0 ? '通路なしの設定です。敷地の外周から手を伸ばして作業し、畝の上には乗らないでください（土が締まって根が入らなくなります）。' : ''
        }</span></div>`;
    }
  }

  /* ---- 畝ボード ---- */
  let h = '<h2 class="sec">③ 畝の割り当て</h2>';
  h += '<div class="tiny" style="margin:-6px 0 10px">各行をタップすると、作型・畝・株数の変更と並び替えができます。並び順は畝の先頭からの配置順です。</div>';
  h += '<div class="beds">';
  for (let b = 0; b < lay.count; b++) {
    const name = '畝' + (b + 1);
    const bedLen = lay.beds[b].len;
    const items = s.items.filter(it => it.place === 'bed' + b);
    // その畝のピーク使用長
    let peak = 0;
    for (let d = 0; d < 36; d++) peak = Math.max(peak, bedPacking(b, d).used);
    h += `<div class="bed"><h4>${name}</h4>
      <div class="bmeta">幅${lay.beds[b].w}cm × 長さ${bedLen}cm ／ 最も混む時期の使用 ${Math.round(peak)}cm（${Math.round(peak / bedLen * 100)}%）</div>`;
    if (!items.length) h += '<div class="tiny">（空き）</div>';
    items.forEach(it => {
      const v = byId(it.vegId);
      const p = v.plans.find(x => x.id === it.planId);
      const [a, e] = planOccupy(p);
      const rows = rowsInBed(v, lay.bedW);
      const len = bedLengthFor(v, it.qty, lay.bedW);
      const idx = s.items.indexOf(it);
      const editing = APP.simEdit === idx;
      const bad = warns.some(w => w.level === 'error' && w.place === name && w.msg.includes(v.name));
      h += `<div class="slot${bad ? ' conflict' : ''}${editing ? ' editing' : ''}"
              data-edopen="${idx}" role="button" tabindex="0">
        <span>${v.emoji} <b>${esc(v.name)}</b> ${it.qty}株<br>
        <span class="tiny">${rows}条 × ${Math.ceil(it.qty / rows)}株（株間${v.spacing.plant}cm）＝ 畝の${len}cm<br>
        ${esc(p.label)}／${dekLabel(a)}〜${dekLabel(e)}</span></span>
        <span class="slot-edit-mark">${editing ? '×' : '編集'}</span></div>`;
      if (editing) h += slotEditorHtml(it, idx);
    });
    h += '</div>';
  }
  h += '</div>';
  renderSuggestions();

  const board = document.getElementById('simBoard');
  board.innerHTML = h;

  board.querySelectorAll('[data-edopen]').forEach(el2 => {
    el2.onclick = () => {
      const i = +el2.dataset.edopen;
      APP.simEdit = (APP.simEdit === i) ? null : i;
      renderSim();
    };
  });
  board.querySelectorAll('[data-rm]').forEach(b => {
    b.onclick = ev => {
      ev.stopPropagation();
      APP.sim.items.splice(+b.dataset.rm, 1);
      APP.simEdit = null;
      simSaveAndRender();
    };
  });
  board.querySelectorAll('[data-mv]').forEach(b => {
    b.onclick = ev => {
      ev.stopPropagation();
      const [i, d] = b.dataset.mv.split(':').map(Number);
      if (moveItem(i, d)) simSaveAndRender();
    };
  });
  board.querySelectorAll('[data-q]').forEach(b => {
    b.onclick = ev => {
      ev.stopPropagation();
      const [i, d] = b.dataset.q.split(':').map(Number);
      updateItem(i, { qty: (APP.sim.items[i] || {}).qty + d });
      simSaveAndRender();
    };
  });
  board.querySelectorAll('[data-editor]').forEach(box2 => {
    const i = +box2.dataset.editor;
    box2.onclick = ev => ev.stopPropagation();
    box2.querySelectorAll('[data-ed]').forEach(f => {
      f.onchange = () => { updateItem(i, { [f.dataset.ed]: f.value }); simSaveAndRender(); };
    });
    const close = box2.querySelector('[data-edclose]');
    if (close) close.onclick = ev => { ev.stopPropagation(); APP.simEdit = null; renderSim(); };
  });

  /* ---- 結果 ---- */
  const box = document.getElementById('simResult');
  if (!s.items.length) {
    box.innerHTML = '<div class="empty">作付けを追加するか、「おまかせ年間プランを作る」を押してください。</div>';
    return;
  }

  let r = '';

  /* 畑の平面図 */
  r += '<h2 class="sec">④ 畑の平面図</h2>';
  r += `<div class="tiny" style="margin:-6px 0 8px">
    畝・通路・株の位置を実寸で表示しています。スライダーで時期を動かすと、その旬の畑の姿になります。
    株は畝の先頭から順に詰めた配置です。</div>`;
  r += '<div id="simPlot"></div>';

  /* 警告 */
  const errs = warns.filter(w => w.level === 'error');
  const infos = warns.filter(w => w.level === 'info');
  r += '<h2 class="sec">⑤ 検証結果</h2>';
  if (!errs.length) {
    r += '<div class="note green"><strong>✅ 成立しています</strong>畝の長さ・連作・日照のいずれにも問題は見つかりませんでした。</div>';
  }
  errs.forEach(w => r += `<div class="note red"><strong>⚠️ ${esc(w.place)}</strong>${esc(w.msg)}</div>`);
  infos.forEach(w => r += `<div class="note blue"><strong>💡 ${esc(w.place)}</strong>${esc(w.msg)}</div>`);

  /* 年間タイムライン */
  r += '<h2 class="sec">⑥ 年間タイムライン</h2>';
  r += '<div class="cal-wrap"><table class="cal"><thead><tr><th class="name" rowspan="2">場所</th>';
  for (let m = 1; m <= 12; m++) r += `<th class="mon" colspan="3">${m}月</th>`;
  r += '</tr><tr>';
  for (let i = 0; i < 36; i++) r += `<th>${['上', '中', '下'][i % 3]}</th>`;
  r += '</tr></thead><tbody>';

  const lanes = [];
  for (let b = 0; b < lay.count; b++) lanes.push({ key: 'bed' + b, label: '畝' + (b + 1) });

  lanes.forEach(lane => {
    const items = s.items.filter(it => it.place === lane.key);
    r += `<tr><th class="name">${lane.label}</th>`;
    const cells = new Array(36).fill(null);
    items.forEach((it, idx) => {
      const v = byId(it.vegId);
      const p = v.plans.find(x => x.id === it.planId);
      if (!p) return;
      const [a, e] = planOccupy(p);
      const hv = harvestStep(p);
      for (let d = 0; d < 36; d++) {
        if (!inRange(d, a, e)) continue;
        const isH = hv && inRange(d, hv.from, hv.to);
        if (!cells[d] || isH) cells[d] = { v, isH, color: BED_COLORS[idx % BED_COLORS.length] };
      }
    });
    for (let d = 0; d < 36; d++) {
      const c = cells[d];
      const cls = 'cell' + (d % 3 === 0 ? ' q1' : '') + (d === APP.nowDek ? ' now' : '');
      if (c) {
        const isStart = !cells[(d + 35) % 36] || cells[(d + 35) % 36].v !== c.v;
        r += `<td class="${cls}" title="${esc(c.v.name)}"><div class="bar" style="background:${c.isH ? STEP_KIND.harvest.color : c.color}">${isStart ? c.v.emoji : (c.isH ? '穫' : '')}</div></td>`;
      } else r += `<td class="${cls}"></td>`;
    }
    r += '</tr>';
  });
  r += '</tbody></table></div>';
  r += '<div class="tiny" style="margin-top:6px">オレンジのマスが収穫期です。空白は畝が空いている期間 — ここを埋めるほど年間の収量が上がります。</div>';

  /* 収穫の見込み（何が・いつ・どれだけ穫れるか） */
  const rows = s.items.map(it => {
    const v = byId(it.vegId);
    const p = v.plans.find(x => x.id === it.planId);
    const hv = harvestStep(p);
    return { v, p, it, hv, at: hv ? dek(hv.from[0], hv.from[1]) : 0 };
  }).sort((a, b) => dekDistance(APP.nowDek, a.at) - dekDistance(APP.nowDek, b.at));

  r += '<h2 class="sec">⑦ 収穫の見込み</h2>';
  r += '<div class="tiny" style="margin:-6px 0 8px">収穫期が近い順に並べています。行をタップすると育て方が開きます。</div>';
  r += '<div class="table-wrap"><table class="data"><thead><tr><th>収穫期</th><th>野菜</th><th class="num">株数</th><th class="hide-sm">場所</th><th>収量の目安</th></tr></thead><tbody>';
  rows.forEach(x => {
    const placeLabel = '畝' + (parseInt(x.it.place.slice(3), 10) + 1);
    r += `<tr data-veg="${x.v.id}">
      <td class="tiny"><b>${x.hv ? rangeLabel(x.hv.from, x.hv.to) : '—'}</b></td>
      <td>${x.v.emoji} ${esc(x.v.name)}</td>
      <td class="num">${x.it.qty}</td>
      <td class="tiny hide-sm">${placeLabel}</td>
      <td class="tiny">${esc(x.v.yieldNote)}</td>
    </tr>`;
  });
  r += '</tbody></table></div>';

  /* 作業カレンダー */
  r += '<h2 class="sec">⑧ このプランの作業カレンダー</h2>';
  const byMonth = {};
  s.items.forEach(it => {
    const v = byId(it.vegId);
    const p = v.plans.find(x => x.id === it.planId);
    if (!p) return;
    const where = '畝' + (parseInt(it.place.slice(3), 10) + 1);
    p.steps.forEach(st => {
      const a = dek(st.from[0], st.from[1]);
      const [mm] = undek(a);
      (byMonth[mm] = byMonth[mm] || []).push(
        `${v.emoji} ${v.name}（${where}）：${st.label}（${dekLabel(a)}〜）`);
    });
  });
  r += '<div class="grid c2">';
  for (let i = 0; i < 12; i++) {
    const mm = ((APP.today.getMonth() + i) % 12) + 1;
    const list = byMonth[mm];
    if (!list || !list.length) continue;
    r += `<div class="card tight"><h3>${mm}月</h3><ul class="clean">`
      + Array.from(new Set(list)).map(x => `<li class="muted">${esc(x)}</li>`).join('')
      + '</ul></div>';
  }
  r += '</div>';

  box.innerHTML = r;
  renderPlotView();
  box.querySelectorAll('tr[data-veg]').forEach(tr => {
    tr.style.cursor = 'pointer';
    tr.setAttribute('role', 'button');
    tr.onclick = () => openVeg(tr.dataset.veg);
  });
}

/* ---------------------------------------------------------
   畑の平面図（上から見た図）
   畝・通路・株の位置を実寸で描く。時期を変えて年間の姿を確認できる。
   --------------------------------------------------------- */
const PLOT_PAD = { l: 40, t: 32, r: 40, b: 28 };
const PLOT_VIEW_W = 360;
const MAX_DOTS = 900;   // これを超えるときは点ではなく条の線で描く

function renderPlotSVG(dekad) {
  const s = APP.sim;
  const lay = bedLayout(s);
  if (!lay.ok) return '<div class="note red" style="margin:0"><strong>この寸法では四角形になりません</strong>4辺の実測値を確認してください。</div>';
  if (!lay.count) return '<div class="note red" style="margin:0"><strong>畝がありません</strong>畝幅か通路幅を小さくするか、畝の向きを変えてください。</div>';

  const poly = lay.poly;                       // 実際の敷地の形（左上が原点）
  const maxX = Math.max.apply(null, poly.map(p => p.x));
  const maxY = Math.max.apply(null, poly.map(p => p.y));
  const k = (PLOT_VIEW_W - PLOT_PAD.l - PLOT_PAD.r) / maxX;
  const W = PLOT_VIEW_W;
  const H = PLOT_PAD.t + maxY * k + PLOT_PAD.b;
  const x0 = PLOT_PAD.l, y0 = PLOT_PAD.t;
  const X = v => x0 + v * k, Y = v => y0 + v * k, cm = v => v * k;

  /* 畝の矩形を、計算した座標系から実際の向きへ戻す */
  function bedRect(bd) {
    return s.dir === 'ew'
      ? { x: bd.top, y: bd.x, w: bd.len, h: bd.w, along: 'x' }   // 東西畝：長さが横方向
      : { x: bd.x, y: bd.top, w: bd.w, h: bd.len, along: 'y' };  // 南北畝：長さが縦方向
  }

  let g = '';
  g += `<pattern id="pathHatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--line)" stroke-width="2"/></pattern>`;

  /* 敷地（＝通路の地色） */
  const pts = poly.map(p => `${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join(' ');
  g += `<polygon points="${pts}" fill="var(--bg-sub)" stroke="var(--line)" stroke-width="1.2"/>`;
  g += `<polygon points="${pts}" fill="url(#pathHatch)" opacity=".5"/>`;

  /* 辺の長さ */
  const e = s.edges;
  const mid = (p, q) => ({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 });
  const lbl = (p, q, t, dx, dy) => {
    const m = mid(p, q);
    return `<text x="${X(m.x) + dx}" y="${Y(m.y) + dy}" text-anchor="middle" font-size="9"
             fill="var(--fg-faint)">${t}</text>`;
  };
  g += lbl(poly[0], poly[1], e.top + 'cm', 0, -6);
  g += lbl(poly[3], poly[2], e.bottom + 'cm', 0, 14);
  g += lbl(poly[0], poly[3], e.left + 'cm', -18, 3);
  g += lbl(poly[1], poly[2], e.right + 'cm', 20, 3);
  g += `<text x="${X(maxX) + PLOT_PAD.r - 4}" y="13" text-anchor="end" font-size="10"
          fill="var(--fg-mute)">↑ 北</text>`;

  /* 各畝 */
  const legend = [];
  let dotBudget = MAX_DOTS;
  lay.beds.forEach((bd, b) => {
    const R = bedRect(bd);
    g += `<rect x="${X(R.x).toFixed(1)}" y="${Y(R.y).toFixed(1)}"
           width="${cm(R.w).toFixed(1)}" height="${cm(R.h).toFixed(1)}"
           fill="var(--bg-card)" stroke="var(--green)" stroke-width="1.2" rx="2"/>`;
    g += `<text x="${X(R.x + R.w / 2).toFixed(1)}" y="${(Y(R.y) - 4).toFixed(1)}" text-anchor="middle"
           font-size="9" font-weight="700" fill="var(--green)">畝${b + 1}</text>`;

    const pk = bedPacking(b, dekad);
    pk.segs.forEach((sg, i) => {
      const color = BED_COLORS[i % BED_COLORS.length];
      const over = sg.start + sg.len > bd.len;
      const drawLen = Math.min(sg.len, Math.max(0, bd.len - sg.start));
      if (drawLen <= 0) return;

      /* 作物の区画（畝の長さ方向に沿って） */
      const sx = R.along === 'y' ? R.x : R.x + sg.start;
      const sy = R.along === 'y' ? R.y + sg.start : R.y;
      const sw = R.along === 'y' ? R.w : drawLen;
      const sh = R.along === 'y' ? drawLen : R.h;
      g += `<rect x="${X(sx).toFixed(1)}" y="${Y(sy).toFixed(1)}"
             width="${cm(sw).toFixed(1)}" height="${cm(sh).toFixed(1)}"
             fill="${color}" opacity="${over ? '.35' : '.18'}"
             stroke="${over ? 'var(--red)' : color}" stroke-width="${over ? 1.5 : 0.8}"
             ${over ? 'stroke-dasharray="4 2"' : ''}/>`;

      /* 株の点 */
      const rowsPos = rowPositions(sg.v, bd.w);
      const perRow = Math.ceil(sg.it.qty / rowsPos.length);
      const total = rowsPos.length * perRow;
      const r = Math.max(1.1, Math.min(cm(sg.v.spacing.plant) / 2.6, cm(sg.v.spacing.row) / 2.6, 5));
      if (total <= dotBudget) {
        dotBudget -= total;
        let n = 0;
        for (let j = 0; j < perRow; j++) {
          const along = sg.start + j * sg.v.spacing.plant + sg.v.spacing.plant / 2;
          if (along > bd.len) break;
          for (let ri = 0; ri < rowsPos.length; ri++) {
            if (n++ >= sg.it.qty) break;
            const px = R.along === 'y' ? R.x + rowsPos[ri] : R.x + along;
            const py = R.along === 'y' ? R.y + along : R.y + rowsPos[ri];
            g += `<circle cx="${X(px).toFixed(1)}" cy="${Y(py).toFixed(1)}" r="${r.toFixed(1)}" fill="${color}"/>`;
          }
        }
      } else {
        rowsPos.forEach(rp => {
          const p1 = R.along === 'y'
            ? { x: R.x + rp, y: R.y + sg.start, x2: R.x + rp, y2: R.y + sg.start + drawLen }
            : { x: R.x + sg.start, y: R.y + rp, x2: R.x + sg.start + drawLen, y2: R.y + rp };
          g += `<line x1="${X(p1.x).toFixed(1)}" y1="${Y(p1.y).toFixed(1)}"
                 x2="${X(p1.x2).toFixed(1)}" y2="${Y(p1.y2).toFixed(1)}"
                 stroke="${color}" stroke-width="${Math.max(1.5, r)}" stroke-linecap="round" opacity=".85"/>`;
        });
      }
      legend.push({ bed: b + 1, v: sg.v, color, seg: sg, over });
    });

    /* 空いている部分 */
    const rest = bd.len - pk.used;
    if (rest > 25) {
      const cx = R.along === 'y' ? R.x + R.w / 2 : R.x + pk.used + rest / 2;
      const cy = R.along === 'y' ? R.y + pk.used + rest / 2 : R.y + R.h / 2;
      g += `<text x="${X(cx).toFixed(1)}" y="${Y(cy).toFixed(1)}" text-anchor="middle"
             font-size="9" fill="var(--fg-faint)">空き ${Math.round(rest)}cm</text>`;
    }
  });

  let html = `<svg viewBox="0 0 ${W} ${H.toFixed(0)}" class="plotsvg" role="img"
     aria-label="畑の平面図">${g}</svg>`;

  if (legend.length) {
    html += '<div class="plot-legend">';
    legend.forEach(L => {
      html += `<span${L.over ? ' class="over"' : ''}><i style="background:${L.color}"></i>
        畝${L.bed} ${esc(L.v.name)} ${L.seg.it.qty}株
        <b>${L.seg.rows}条</b>／${Math.round(L.seg.start)}〜${Math.round(L.seg.start + L.seg.len)}cm${L.over ? '（はみ出し）' : ''}</span>`;
    });
    html += '</div>';
  } else {
    html += '<div class="tiny" style="margin-top:6px">この時期は畝が空いています。</div>';
  }
  return html;
}

function renderPlotView() {
  const box = document.getElementById('simPlot');
  if (!box) return;
  const when = APP.simWhen === undefined ? APP.nowDek : APP.simWhen;
  const [m, j] = undek(when);
  box.innerHTML = `
    <div class="plot-when">
      <div class="pw-head">
        <b>${m}月${JUN_NAME[j - 1]}</b> の畑
        ${when === APP.nowDek ? '<span class="pill green">いま</span>' : '<button class="btn sm ghost" id="plotNow">いまに戻す</button>'}
      </div>
      <input type="range" id="plotWhen" min="0" max="35" value="${when}" step="1" aria-label="時期">
      <div class="pw-scale"><span>1月</span><span>4月</span><span>7月</span><span>10月</span><span>12月</span></div>
    </div>
    <div class="plotwrap">${renderPlotSVG(when)}</div>`;
  const sl = document.getElementById('plotWhen');
  if (sl) sl.oninput = () => { APP.simWhen = parseInt(sl.value, 10); renderPlotView(); };
  const nb = document.getElementById('plotNow');
  if (nb) nb.onclick = () => { APP.simWhen = APP.nowDek; renderPlotView(); };
}
