/* =========================================================
   作付けシミュレーター（畝単位）

   敷地の寸法から畝の本数と長さを割り出し、
   「株間 × 条数」で畝を何cm使うかを計算して作付けを検証する。
   ========================================================= */

const SEED_COST = { seed: 300, seedling: 180, bulb: 70, tuber: 110, slip: 55, root: 320 };
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

/** 敷地の寸法から畝の本数と長さを割り出す */
function bedLayout(s) {
  const unit = s.bedW + s.pathW;
  // 畝は奥行き方向に伸ばし、幅方向に「畝＋通路」で並べる（最後の通路は不要）
  const count = s.plotW > 0 ? Math.max(0, Math.floor((s.plotW + s.pathW) / unit)) : 0;
  return {
    count: count,
    len: s.plotD,                                   // 畝1本の長さ(cm)
    bedW: s.bedW,
    areaM2: count * s.bedW * s.plotD / 10000,       // 畝の合計面積
    plotM2: s.plotW * s.plotD / 10000,              // 通路を含む敷地面積
    tatami: (s.plotW * s.plotD / 10000) / 1.62
  };
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
  const ids = ['simPlotW', 'simPlotD', 'simBedW', 'simPathW'];
  document.getElementById('simPlotW').value = String(s.plotW);
  document.getElementById('simPlotD').value = String(s.plotD);
  document.getElementById('simBedW').value = String(s.bedW);
  document.getElementById('simPathW').value = String(s.pathW);

  ids.forEach(id => {
    document.getElementById(id).onchange = () => {
      s.plotW = parseInt(document.getElementById('simPlotW').value, 10) || 0;
      s.plotD = parseInt(document.getElementById('simPlotD').value, 10) || 0;
      s.bedW = parseInt(document.getElementById('simBedW').value, 10) || 70;
      s.pathW = parseInt(document.getElementById('simPathW').value, 10) || 40;
      // 無くなった畝の割り当てを整理
      const lay = bedLayout(s);
      s.items = s.items.filter(it => parseInt(it.place.slice(3), 10) < lay.count);
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
  for (let i = 0; i < lay.count; i++) h += `<option value="bed${i}">畝${i + 1}（幅${lay.bedW}cm × 長さ${lay.len}cm）</option>`;
  sel.innerHTML = h || '<option value="">（畝がありません）</option>';
}

function updateSimHint() {
  const v = byId(document.getElementById('simVeg').value);
  const p = v.plans.find(x => x.id === document.getElementById('simPlan').value) || v.plans[0];
  const place = document.getElementById('simPlace').value;
  const s = APP.sim;
  const lay = bedLayout(s);
  const [a, b] = planOccupy(p);

  let hint = `占有期間：<b>${dekLabel(a)}〜${dekLabel(b)}</b>（約${Math.round(rangeLen(a, b) * DEK_DAYS)}日）`;
  const rows = rowsInBed(v, lay.bedW);
  const cap = qtyForLength(v, lay.len, lay.bedW);
  hint += `<br>畝幅${lay.bedW}cmに <b>${rows}条</b>（条間${v.spacing.row}cm）／ 株間${v.spacing.plant}cm`
        + `<br>畝1本（${lay.len}cm）を使い切ると <b>${cap}株</b>`;
  document.getElementById('simQty').value = Math.max(1, Math.min(cap, capQty(v, cap)));
  const qty = parseInt(document.getElementById('simQty').value, 10) || 1;
  hint += ` ／ この株数なら畝の <b>${bedLengthFor(v, qty, lay.bedW)}cm</b> を使います`;

  // 畝幅を変えると何条・何株になるか
  hint += `<div class="wcmp"><div class="wcmp-t">${esc(v.name)}は畝幅でこう変わります</div><table>
    <tr><th>畝幅</th>${widthComparison(v, lay.len).map(c =>
      `<th class="${c.bedW === lay.bedW ? 'cur' : ''}">${c.bedW}cm</th>`).join('')}</tr>
    <tr><th>条数</th>${widthComparison(v, lay.len).map(c =>
      `<td class="${c.bedW === lay.bedW ? 'cur' : ''}">${c.rows}条</td>`).join('')}</tr>
    <tr><th>畝1本(${lay.len}cm)</th>${widthComparison(v, lay.len).map(c =>
      `<td class="${c.bedW === lay.bedW ? 'cur' : ''}">${c.perBed}株</td>`).join('')}</tr>
    </table><div class="tiny">条間${v.spacing.row}cm・株間${v.spacing.plant}cm から算出。畝幅は「① 敷地と畝の設定」で変えられます。</div></div>`;
  document.getElementById('simHint').innerHTML = hint;
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

  for (let b = 0; b < lay.count; b++) {
    const items = s.items.filter(it => it.place === 'bed' + b);
    const name = '畝' + (b + 1);

    // 長さ：各旬に必要な畝の長さ
    let peak = 0, peakDek = 0;
    for (let d = 0; d < 36; d++) {
      const used = bedPacking(b, d).used;
      if (used > peak) { peak = used; peakDek = d; }
    }
    if (peak > lay.len + 1) {
      warns.push({ level: 'error', place: name,
        msg: `${name}は${dekLabel(peakDek)}に長さが足りません（必要 ${Math.round(peak)}cm / 畝の長さ ${lay.len}cm）。株数を減らすか、別の畝・別の時期にずらしてください。` });
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
    fill({
      place: 'bed' + b, cap: lay.len, threshold: lay.len * 0.25, maxItems: 6, useRotation: true,
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
    info.innerHTML = lay.count === 0
      ? '<div class="note red" style="margin:0"><strong>畝が作れません</strong>敷地の幅が「畝幅＋通路幅」より狭くなっています。畝幅か通路幅を小さくしてください。</div>'
      : `<div class="note green" style="margin:0"><strong>この敷地には 畝 ${lay.count}本</strong>
          幅${lay.bedW}cm × 長さ${lay.len}cm の畝が${lay.count}本（通路${s.pathW}cm）。
          栽培面積 ${lay.areaM2.toFixed(2)}m² ／ 敷地 ${lay.plotM2.toFixed(2)}m²（約${lay.tatami.toFixed(1)}畳）。
          <span class="tiny">畝の合計の長さ ${lay.count * lay.len}cm がこのシミュレーションの「容量」です。</span></div>`;
  }

  /* ---- 畝ボード ---- */
  let h = '<h2 class="sec">③ 畝の割り当て</h2>';
  h += '<div class="beds">';
  for (let b = 0; b < lay.count; b++) {
    const name = '畝' + (b + 1);
    const items = s.items.filter(it => it.place === 'bed' + b);
    // その畝のピーク使用長
    let peak = 0;
    for (let d = 0; d < 36; d++) peak = Math.max(peak, bedPacking(b, d).used);
    h += `<div class="bed"><h4>${name}</h4>
      <div class="bmeta">幅${lay.bedW}cm × 長さ${lay.len}cm ／ 最も混む時期の使用 ${Math.round(peak)}cm（${Math.round(peak / lay.len * 100)}%）</div>`;
    if (!items.length) h += '<div class="tiny">（空き）</div>';
    items.forEach(it => {
      const v = byId(it.vegId);
      const p = v.plans.find(x => x.id === it.planId);
      const [a, e] = planOccupy(p);
      const rows = rowsInBed(v, lay.bedW);
      const len = bedLengthFor(v, it.qty, lay.bedW);
      const bad = warns.some(w => w.level === 'error' && w.place === name && w.msg.includes(v.name));
      h += `<div class="slot${bad ? ' conflict' : ''}">
        <span>${v.emoji} <b>${esc(v.name)}</b> ${it.qty}株<br>
        <span class="tiny">${rows}条 × ${Math.ceil(it.qty / rows)}株（株間${v.spacing.plant}cm）＝ 畝の${len}cm<br>
        ${esc(p.label)}／${dekLabel(a)}〜${dekLabel(e)}</span></span>
        <button class="sx" data-rm="${s.items.indexOf(it)}" aria-label="削除">×</button></div>`;
    });
    h += '</div>';
  }
  h += '</div>';
  document.getElementById('simBoard').innerHTML = h;
  document.getElementById('simBoard').querySelectorAll('[data-rm]').forEach(b => {
    b.onclick = () => { APP.sim.items.splice(+b.dataset.rm, 1); simSaveAndRender(); };
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

  /* 収支 */
  let value = 0, cost = 0;
  const rows = s.items.map(it => {
    const v = byId(it.vegId);
    const p = v.plans.find(x => x.id === it.planId);
    const val = valuePerPlant(v) * it.qty;
    const c = p.start === 'seed' ? SEED_COST.seed : (SEED_COST[p.start] || 150) * it.qty;
    value += val; cost += c;
    return { v, p, it, val, c, hv: harvestStep(p) };
  }).sort((a, b) => b.val - a.val);

  r += '<h2 class="sec">⑦ 年間の収穫と収支の試算</h2>';
  r += '<div class="grid c3" style="margin-bottom:14px">';
  r += `<div class="card center"><div class="tiny">収穫の金額換算</div><div style="font-size:26px;font-weight:700;color:var(--green)">${value.toLocaleString()}<span style="font-size:14px">円</span></div></div>`;
  r += `<div class="card center"><div class="tiny">種苗費</div><div style="font-size:26px;font-weight:700;color:var(--earth)">${cost.toLocaleString()}<span style="font-size:14px">円</span></div></div>`;
  r += `<div class="card center"><div class="tiny">差引</div><div style="font-size:26px;font-weight:700;color:var(--accent)">${(value - cost).toLocaleString()}<span style="font-size:14px">円</span></div></div>`;
  r += '</div>';

  r += '<div class="table-wrap"><table class="data"><thead><tr><th>場所</th><th>野菜</th><th class="hide-sm">作型</th><th class="num">株数</th><th class="num">畝の使用</th><th class="hide-sm">収穫期</th><th class="num">金額換算</th></tr></thead><tbody>';
  rows.forEach(x => {
    const placeLabel = '畝' + (parseInt(x.it.place.slice(3), 10) + 1);
    const useLabel = bedLengthFor(x.v, x.it.qty, lay.bedW) + 'cm';
    r += `<tr data-veg="${x.v.id}">
      <td class="tiny">${placeLabel}</td>
      <td>${x.v.emoji} ${esc(x.v.name)}</td>
      <td class="tiny hide-sm">${START_TYPE[x.p.start].icon} ${esc(x.p.label)}</td>
      <td class="num">${x.it.qty}</td>
      <td class="num tiny">${useLabel}</td>
      <td class="tiny hide-sm">${x.hv ? rangeLabel(x.hv.from, x.hv.to) : '—'}</td>
      <td class="num">${x.val.toLocaleString()}</td>
    </tr>`;
  });
  r += '</tbody></table></div>';
  r += `<div class="tiny" style="margin-top:8px">
    ※金額換算はスーパーでの一般的な小売価格に基づく概算で、栽培が順調にいった場合の目安です。
    土づくりの資材や道具などの初期費用（1〜2万円）は含みません。</div>`;

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
const PLOT_PAD = { l: 30, t: 30, r: 10, b: 24 };
const PLOT_VIEW_W = 360;
const MAX_DOTS = 900;   // これを超えるときは点ではなく条の線で描く

function plotScale(lay) {
  const s = APP.sim;
  const usable = PLOT_VIEW_W - PLOT_PAD.l - PLOT_PAD.r;
  return s.plotW > 0 ? usable / s.plotW : 1;
}

function renderPlotSVG(dekad) {
  const s = APP.sim;
  const lay = bedLayout(s);
  if (!lay.count) return '<div class="note red" style="margin:0"><strong>畝がありません</strong>敷地の幅を広げるか、畝幅・通路幅を小さくしてください。</div>';

  const k = plotScale(lay);
  const W = PLOT_VIEW_W;
  const H = PLOT_PAD.t + s.plotD * k + PLOT_PAD.b;
  const x0 = PLOT_PAD.l, y0 = PLOT_PAD.t;
  const cm = v => v * k;

  let g = '';

  /* 敷地全体（＝通路の地色） */
  g += `<rect x="${x0}" y="${y0}" width="${cm(s.plotW)}" height="${cm(s.plotD)}"
         fill="var(--bg-sub)" stroke="var(--line)" stroke-width="1"/>`;
  g += `<pattern id="pathHatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--line)" stroke-width="2"/></pattern>`;
  g += `<rect x="${x0}" y="${y0}" width="${cm(s.plotW)}" height="${cm(s.plotD)}" fill="url(#pathHatch)" opacity=".5"/>`;

  /* 方位と寸法 */
  g += `<text x="${x0 + cm(s.plotW) / 2}" y="14" text-anchor="middle" font-size="10" fill="var(--fg-mute)">↑ 北</text>`;
  g += `<text x="${x0 + cm(s.plotW) / 2}" y="${H - 8}" text-anchor="middle" font-size="9" fill="var(--fg-faint)">敷地の幅 ${s.plotW}cm</text>`;
  g += `<text x="10" y="${y0 + cm(s.plotD) / 2}" text-anchor="middle" font-size="9" fill="var(--fg-faint)"
          transform="rotate(-90 10 ${y0 + cm(s.plotD) / 2})">奥行き ${s.plotD}cm</text>`;

  /* 目盛り（50cmごと） */
  for (let d = 0; d <= s.plotD; d += 50) {
    const y = y0 + cm(d);
    g += `<line x1="${x0 - 4}" y1="${y}" x2="${x0}" y2="${y}" stroke="var(--fg-faint)" stroke-width="1"/>`;
    if (d % 100 === 0) g += `<text x="${x0 - 6}" y="${y + 3}" text-anchor="end" font-size="8" fill="var(--fg-faint)">${d}</text>`;
  }

  /* 各畝 */
  let legend = [];
  let dotBudget = MAX_DOTS;
  for (let b = 0; b < lay.count; b++) {
    const bx = x0 + cm(b * (s.bedW + s.pathW));
    const bw = cm(s.bedW);
    g += `<rect x="${bx}" y="${y0}" width="${bw}" height="${cm(s.plotD)}"
           fill="var(--bg-card)" stroke="var(--green)" stroke-width="1.2" rx="2"/>`;
    g += `<text x="${bx + bw / 2}" y="${y0 - 5}" text-anchor="middle" font-size="9" font-weight="700" fill="var(--green)">畝${b + 1}</text>`;

    const pk = bedPacking(b, dekad);
    pk.segs.forEach((sg, i) => {
      const color = BED_COLORS[i % BED_COLORS.length];
      const over = sg.start + sg.len > s.plotD;
      const drawLen = Math.min(sg.len, Math.max(0, s.plotD - sg.start));
      if (drawLen <= 0) return;
      g += `<rect x="${bx}" y="${y0 + cm(sg.start)}" width="${bw}" height="${cm(drawLen)}"
             fill="${color}" opacity="${over ? '.35' : '.18'}"
             stroke="${over ? 'var(--red)' : color}" stroke-width="${over ? 1.5 : 0.8}"
             ${over ? 'stroke-dasharray="4 2"' : ''}/>`;

      /* 株の点 */
      const rows = rowPositions(sg.v, s.bedW);
      const perRow = Math.ceil(sg.it.qty / rows.length);
      const total = rows.length * perRow;
      const r = Math.max(1.1, Math.min(cm(sg.v.spacing.plant) / 2.6, cm(sg.v.spacing.row) / 2.6, 5));
      if (total <= dotBudget) {
        dotBudget -= total;
        let n = 0;
        for (let j = 0; j < perRow; j++) {
          const py = sg.start + j * sg.v.spacing.plant + sg.v.spacing.plant / 2;
          if (py > s.plotD) break;
          rows.forEach(rx => {
            if (n++ >= sg.it.qty) return;
            g += `<circle cx="${(bx + cm(rx)).toFixed(1)}" cy="${(y0 + cm(py)).toFixed(1)}" r="${r.toFixed(1)}" fill="${color}"/>`;
          });
        }
      } else {
        /* 株が多すぎるときは条の線で表す */
        rows.forEach(rx => {
          g += `<line x1="${(bx + cm(rx)).toFixed(1)}" y1="${y0 + cm(sg.start)}"
                 x2="${(bx + cm(rx)).toFixed(1)}" y2="${y0 + cm(sg.start + drawLen)}"
                 stroke="${color}" stroke-width="${Math.max(1.5, r)}" stroke-linecap="round" opacity=".85"/>`;
        });
      }

      legend.push({ bed: b + 1, v: sg.v, color, seg: sg, over });
    });

    /* 空いている部分に「空き」と入れる */
    const rest = s.plotD - pk.used;
    if (rest > 25) {
      const ry = y0 + cm(pk.used) + cm(rest) / 2;
      g += `<text x="${bx + bw / 2}" y="${ry}" text-anchor="middle" font-size="9"
             fill="var(--fg-faint)">空き ${Math.round(rest)}cm</text>`;
    }
  }

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
