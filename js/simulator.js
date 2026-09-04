/* =========================================================
   作付けシミュレーター
   区画へ作物を配置し、面積・時期・連作・日照を検証して
   年間の収穫量と節約額を試算する
   ========================================================= */

const PLANTER_M2 = 0.16;   // 65cmプランター1つの実効面積
const SEED_COST = { seed: 300, seedling: 180, bulb: 70, tuber: 110, slip: 55, root: 320 };

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

/** その作型が畑を占有する期間 [開始dek, 終了dek]（貯蔵は除く） */
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

/** 1株あたりの金額換算 */
function valuePerPlant(v) {
  const u = v.valueUnit;
  if (/1m²/.test(u)) return Math.round(v.marketValue / v.perM2);
  if (/プランター/.test(u)) return Math.round(v.marketValue / plantsPerPlanter(v));
  return v.marketValue; // 1株 / 苗1本 など
}
function plantsPerPlanter(v) {
  return Math.max(1, Math.round(v.perM2 * PLANTER_M2));
}
function areaOfPlants(v, qty) { return qty / v.perM2; }

/* ---------------------------------------------------------
   状態
   --------------------------------------------------------- */
function simState() { return APP.sim; }

function simSaveAndRender() {
  Store.set('sim', APP.sim);
  renderSim();
}

/* ---------------------------------------------------------
   入力フォーム
   --------------------------------------------------------- */
function initSimForm() {
  const s = APP.sim;
  document.getElementById('simArea').value = String(s.areaM2);
  document.getElementById('simBeds').value = String(s.beds);
  document.getElementById('simPlanters').value = String(s.planters);
  document.getElementById('simSun').value = s.sun;

  ['simArea', 'simBeds', 'simPlanters', 'simSun'].forEach(id => {
    document.getElementById(id).onchange = () => {
      s.areaM2 = parseFloat(document.getElementById('simArea').value);
      s.beds = parseInt(document.getElementById('simBeds').value, 10);
      s.planters = parseInt(document.getElementById('simPlanters').value, 10);
      s.sun = document.getElementById('simSun').value;
      // 存在しなくなった区画の割り当てを整理
      s.items = s.items.filter(it => it.place === 'planter' || parseInt(it.place.slice(3), 10) < s.beds);
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
  let h = '';
  for (let i = 0; i < APP.sim.beds; i++) h += `<option value="bed${i}">地植え 区画${String.fromCharCode(65 + i)}</option>`;
  if (APP.sim.planters > 0) h += '<option value="planter">ベランダのプランター</option>';
  sel.innerHTML = h || '<option value="planter">ベランダのプランター</option>';
}

function updateSimHint() {
  const v = byId(document.getElementById('simVeg').value);
  const p = v.plans.find(x => x.id === document.getElementById('simPlan').value) || v.plans[0];
  const place = document.getElementById('simPlace').value;
  const [a, b] = planOccupy(p);
  const bedArea = APP.sim.beds ? APP.sim.areaM2 / APP.sim.beds : 0;
  const cap = place === 'planter' ? plantsPerPlanter(v) * APP.sim.planters : Math.floor(bedArea * v.perM2);
  document.getElementById('simQty').value = Math.max(1, Math.min(cap, place === 'planter' ? plantsPerPlanter(v) : cap));
  document.getElementById('simHint').innerHTML =
    `占有期間：<b>${dekLabel(a)}〜${dekLabel(b)}</b>（約${Math.round(rangeLen(a, b) * DEK_DAYS)}日）　`
    + `／ 株間${v.spacing.plant}cm・1m²あたり${v.perM2}株　`
    + `／ この場所の収容目安：<b>${cap}株</b>`
    + (place === 'planter' ? `（65cmプランター1つあたり${plantsPerPlanter(v)}株 × ${APP.sim.planters}個）` : `（区画${bedArea.toFixed(2)}m²）`);
}

function presetSim(vegId) {
  const sel = document.getElementById('simVeg');
  sel.value = vegId; sel.onchange();
}

/* ---------------------------------------------------------
   検証
   --------------------------------------------------------- */
function validateSim() {
  const s = APP.sim;
  const warns = [];
  const bedArea = s.beds ? s.areaM2 / s.beds : 0;

  // --- 区画ごと ---
  for (let b = 0; b < s.beds; b++) {
    const items = s.items.filter(it => it.place === 'bed' + b);
    const name = '区画' + String.fromCharCode(65 + b);

    // 面積：各旬の占有面積
    for (let d = 0; d < 36; d++) {
      let used = 0;
      items.forEach(it => {
        const v = byId(it.vegId);
        const p = v.plans.find(x => x.id === it.planId);
        if (!p) return;
        const [a, e] = planOccupy(p);
        if (inRange(d, a, e)) used += areaOfPlants(v, it.qty);
      });
      if (used > bedArea * 1.02) {
        warns.push({ level: 'error', place: name, dek: d,
          msg: `${name}は${dekLabel(d)}に面積オーバーです（必要 ${used.toFixed(2)}m² / 区画 ${bedArea.toFixed(2)}m²）。株数を減らすか、別の区画へ移してください。` });
        break;
      }
    }

    // 連作：同じ区画に同じ科
    const famSeen = {};
    items.forEach(it => {
      const v = byId(it.vegId);
      const fam = FAMILY_INFO[v.family];
      if (!fam || fam.rest <= 1) return;
      if (famSeen[v.family]) {
        warns.push({ level: 'error', place: name,
          msg: `${name}に${v.family}が重複しています（${famSeen[v.family]} と ${v.name}）。${v.family}は${fam.rest}年空けるのが原則です。別の区画へ移してください。` });
      } else famSeen[v.family] = v.name;
    });

    // 時期の重なり（同一区画・同時期に別作物が何種入るか）
    let maxConcurrent = 0, concurrentAt = 0;
    for (let d = 0; d < 36; d++) {
      let n = 0;
      items.forEach(it => {
        const v = byId(it.vegId);
        const p = v.plans.find(x => x.id === it.planId);
        if (!p) return;
        const [a, e] = planOccupy(p);
        if (inRange(d, a, e)) n++;
      });
      if (n > maxConcurrent) { maxConcurrent = n; concurrentAt = d; }
    }
    if (maxConcurrent >= 3) {
      warns.push({ level: 'info', place: name,
        msg: `${name}は${dekLabel(concurrentAt)}に${maxConcurrent}種が同時に育つ計画です。面積は足りていますが、背の高い作物が低い作物に影を作らないよう、南側に低いものを配置してください。` });
    }
  }

  // --- プランター ---
  const pl = s.items.filter(it => it.place === 'planter');
  pl.forEach(it => {
    const v = byId(it.vegId);
    // 日照
    const need = v.sun;
    const have = s.sun;
    const rank = SUN_RANK;
    if (rank[need] > rank[have]) {
      warns.push({ level: 'error', place: 'ベランダ',
        msg: `${v.name}は${need === 'full' ? '日なた（1日6時間以上）' : '半日陰以上'}が必要ですが、設定した日照は${have === 'full' ? '6時間以上' : have === 'half' ? '3〜6時間' : '3時間未満'}です。徒長して収穫できない可能性が高いです。` });
    }
    // 深さ
    if (v.depth > 30) {
      warns.push({ level: 'info', place: 'ベランダ',
        msg: `${v.name}は深さ${v.depth}cm以上の容器が必要です。標準プランター（深さ18cm前後）では不足します。` });
    }
  });
  // プランター数：同時期に必要になる数で判定する
  let peak = 0, peakDek = 0;
  for (let d = 0; d < 36; d++) {
    let u = 0;
    pl.forEach(it => {
      const v = byId(it.vegId);
      const p = v.plans.find(x => x.id === it.planId);
      if (!p) return;
      const [a, e] = planOccupy(p);
      if (inRange(d, a, e)) u += it.qty / plantsPerPlanter(v);
    });
    if (u > peak) { peak = u; peakDek = d; }
  }
  if (peak > s.planters + 0.02) {
    warns.push({ level: 'error', place: 'ベランダ',
      msg: `${dekLabel(peakDek)}にプランターが不足します（必要 約${Math.ceil(peak)}個 / 保有 ${s.planters}個）。株数を減らすか、時期をずらしてください。` });
  }

  // --- 全体：畑が空く期間 ---
  if (s.beds) {
    for (let b = 0; b < s.beds; b++) {
      const items = s.items.filter(it => it.place === 'bed' + b);
      if (!items.length) continue;
      let empty = 0;
      for (let d = 0; d < 36; d++) {
        const busy = items.some(it => {
          const v = byId(it.vegId);
          const p = v.plans.find(x => x.id === it.planId);
          if (!p) return false;
          const [a, e] = planOccupy(p);
          return inRange(d, a, e);
        });
        if (!busy) empty++;
      }
      if (empty >= 12) {
        warns.push({ level: 'info', place: '区画' + String.fromCharCode(65 + b),
          msg: `区画${String.fromCharCode(65 + b)}は年間で約${Math.round(empty * DEK_DAYS)}日空いています。空き期間は堆肥を入れて休ませるか、コマツナ・ラディッシュ・インゲンなど短期作物を挟むと効率が上がります。` });
      }
    }
  }

  return warns;
}

/* ---------------------------------------------------------
   自動プラン生成
   --------------------------------------------------------- */
const SUN_RANK = { shade: 0, half: 1, full: 2 };

/** cursor から見た待ち時間。適期の窓の中にいるなら 0 */
function waitFrom(cursor, plan) {
  const st = startStep(plan);
  const a = dek(st.from[0], st.from[1]);
  const b = dek(st.to[0], st.to[1]);
  if (inRange(cursor, a, b)) return 0;
  return dekDistance(cursor, a);
}

/** 占有期間中の最小空き容量（面積 or プランター数） */
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
  const items = [];
  const now = APP.nowDek;
  const bedArea = s.beds ? s.areaM2 / s.beds : 0;
  const usedVeg = {};    // 同じ野菜を全体で重複させない
  const usedCat = {};    // 分類の偏りを抑える

  /** from 以降で、空き容量が threshold 以上になる最初の時点 */
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
      if (opts.sunLimit && SUN_RANK[v.sun] > SUN_RANK[opts.sunLimit]) return;
      if (opts.skipShade && v.sun === 'shade') return;
      if (opts.maxDepth && v.depth > opts.maxDepth) return;
      if (opts.famUsed && FAMILY_INFO[v.family] && FAMILY_INFO[v.family].rest > 1
          && opts.famUsed[v.family]) return;
      v.plans.forEach(p => {
        const [a, e] = planOccupy(p);
        const wait = waitFrom(opts.cursor, p);
        if (wait > 9) return;                            // 3ヶ月以上先の作型は待たない
        const free = minFree(opts.occ, opts.cap, a, e);
        const qty = capQty(v, opts.qtyOf(v, free));
        const need = opts.amountOf(v, qty);
        if (need > free + 1e-6) return;                  // 空きが足りない
        if (need < opts.cap * 0.12) return;              // 細切れの端数には植えない
        if (v.perM2 >= 20 && qty < 4) return;            // すじまき作物を数株だけ作らない
        const value = valuePerPlant(v) * qty;
        const score = planScore(v, p)
          - wait * 0.8                                   // 畑を遊ばせないことを重視
          + Math.min(value / 1200, 4)
          - (usedCat[v.category] ? 2.5 : 0);             // 同じ分類ばかりにしない
        cands.push({ v, p, a, e, wait, qty, need, score });
      });
    });
    if (!cands.length) return null;
    cands.sort((x, y) => y.score - x.score);
    return cands[0];
  }

  /**
   * ひとつの器（区画 or ベランダ全体）を、空き時間を探しながら順に埋める。
   * ある時点で植えられるものが無ければ、探索位置を進めて次の空きを試す。
   */
  function fill(opts) {
    const occ = new Array(36).fill(0);
    const famUsed = {};
    let scanFrom = now, guard = 0, added = 0;
    while (guard++ < 40 && added < opts.maxItems) {
      const cur = nextCursor(occ, opts.cap, opts.threshold, scanFrom);
      if (cur === null) break;
      const pick = pickBest(Object.assign({
        cursor: cur.dek, occ, cap: opts.cap,
        famUsed: opts.useRotation ? famUsed : null   // プランターは土を替えられるので輪作制約なし
      }, opts.pick));
      if (!pick) {
        scanFrom = (cur.dek + 1) % 36;                 // その時期は諦めて先へ
        if (dekDistance(now, scanFrom) === 0) break;   // 1年一周した
        continue;
      }
      items.push({ vegId: pick.v.id, planId: pick.p.id, place: opts.place, qty: pick.qty });
      usedVeg[pick.v.id] = true;
      usedCat[pick.v.category] = true;
      famUsed[pick.v.family] = true;
      addOcc(occ, pick.a, pick.e, pick.need);
      added++;
      scanFrom = now;                                  // また最初の空きから探し直す
    }
  }

  // --- ベランダ（制約が厳しいので先に確保する） ---
  if (s.planters > 0) {
    fill({
      place: 'planter', cap: s.planters, threshold: 1, maxItems: 10,
      pick: {
        place: 'planter', sunLimit: s.sun, maxDepth: 35,
        qtyOf: v => plantsPerPlanter(v),
        amountOf: () => 1                              // 1作物につきプランター1つ
      }
    });
  }

  // --- 地植え ---
  for (let b = 0; b < s.beds; b++) {
    fill({
      place: 'bed' + b, cap: bedArea, threshold: bedArea * 0.25, maxItems: 6, useRotation: true,
      pick: {
        place: 'plot',
        skipShade: true,     // 日なたの畝に半日陰向きの多年草は入れない
        qtyOf: (v, free) => Math.max(1, Math.floor(free * v.perM2)),
        amountOf: (v, qty) => areaOfPlants(v, qty)
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
  const bedArea = s.beds ? s.areaM2 / s.beds : 0;
  const warns = validateSim();

  /* ---- 区画ボード ---- */
  let h = '<h2 class="sec">③ 区画の割り当て</h2>';
  h += '<div class="beds">';
  for (let b = 0; b < s.beds; b++) {
    const name = '区画' + String.fromCharCode(65 + b);
    const items = s.items.filter(it => it.place === 'bed' + b);
    h += `<div class="bed"><h4>${name}</h4>
      <div class="bmeta">${bedArea.toFixed(2)}m²（約${(bedArea / 1.62).toFixed(1)}畳分）</div>`;
    if (!items.length) h += '<div class="tiny">（空き）</div>';
    items.forEach(it => {
      const v = byId(it.vegId);
      const p = v.plans.find(x => x.id === it.planId);
      const [a, e] = planOccupy(p);
      const bad = warns.some(w => w.level === 'error' && w.place === name && w.msg.includes(v.name));
      h += `<div class="slot${bad ? ' conflict' : ''}">
        <span>${v.emoji} <b>${esc(v.name)}</b> ${it.qty}株<br>
        <span class="tiny">${esc(p.label)}／${dekLabel(a)}〜${dekLabel(e)}</span></span>
        <button class="sx" data-rm="${s.items.indexOf(it)}">×</button></div>`;
    });
    h += '</div>';
  }
  if (s.planters > 0) {
    const items = s.items.filter(it => it.place === 'planter');
    h += `<div class="bed" style="border-style:solid"><h4>ベランダ</h4>
      <div class="bmeta">65cmプランター ${s.planters}個 ／ 日照 ${s.sun === 'full' ? '6時間以上' : s.sun === 'half' ? '3〜6時間' : '3時間未満'}</div>`;
    if (!items.length) h += '<div class="tiny">（空き）</div>';
    items.forEach(it => {
      const v = byId(it.vegId);
      const p = v.plans.find(x => x.id === it.planId);
      const [a, e] = planOccupy(p);
      const bad = warns.some(w => w.level === 'error' && w.place === 'ベランダ' && w.msg.includes(v.name));
      h += `<div class="slot${bad ? ' conflict' : ''}">
        <span>${v.emoji} <b>${esc(v.name)}</b> ${it.qty}株<br>
        <span class="tiny">${esc(p.label)}／${dekLabel(a)}〜${dekLabel(e)}</span></span>
        <button class="sx" data-rm="${s.items.indexOf(it)}">×</button></div>`;
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

  /* 警告 */
  const errs = warns.filter(w => w.level === 'error');
  const infos = warns.filter(w => w.level === 'info');
  r += '<h2 class="sec">④ 検証結果</h2>';
  if (!errs.length) {
    r += '<div class="note green"><strong>✅ 成立しています</strong>面積・連作・日照のいずれにも問題は見つかりませんでした。</div>';
  }
  errs.forEach(w => r += `<div class="note red"><strong>⚠️ ${esc(w.place)}</strong>${esc(w.msg)}</div>`);
  infos.forEach(w => r += `<div class="note blue"><strong>💡 ${esc(w.place)}</strong>${esc(w.msg)}</div>`);

  /* 年間タイムライン */
  r += '<h2 class="sec">⑤ 年間タイムライン</h2>';
  r += '<div class="cal-wrap"><table class="cal"><thead><tr><th class="name" rowspan="2">場所</th>';
  for (let m = 1; m <= 12; m++) r += `<th class="mon" colspan="3">${m}月</th>`;
  r += '</tr><tr>';
  for (let i = 0; i < 36; i++) r += `<th>${['上', '中', '下'][i % 3]}</th>`;
  r += '</tr></thead><tbody>';

  const lanes = [];
  for (let b = 0; b < s.beds; b++) lanes.push({ key: 'bed' + b, label: '区画' + String.fromCharCode(65 + b) });
  if (s.planters > 0) lanes.push({ key: 'planter', label: 'ベランダ' });

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
  r += '<div class="tiny" style="margin-top:6px">オレンジのマスが収穫期です。空白は畑が空いている期間 — ここを埋めるほど年間の収量が上がります。</div>';

  /* 収支 */
  let value = 0, cost = 0;
  const rows = s.items.map(it => {
    const v = byId(it.vegId);
    const p = v.plans.find(x => x.id === it.planId);
    const val = valuePerPlant(v) * it.qty;
    const c = p.start === 'seed' ? SEED_COST.seed : (SEED_COST[p.start] || 150) * it.qty;
    value += val; cost += c;
    const hv = harvestStep(p);
    return { v, p, it, val, c, hv };
  }).sort((a, b) => b.val - a.val);

  r += '<h2 class="sec">⑥ 年間の収穫と収支の試算</h2>';
  r += '<div class="grid c3" style="margin-bottom:14px">';
  r += `<div class="card center"><div class="tiny">収穫の金額換算</div><div style="font-size:26px;font-weight:700;color:var(--green)">${value.toLocaleString()}<span style="font-size:14px">円</span></div></div>`;
  r += `<div class="card center"><div class="tiny">種苗・資材（種苗のみ）</div><div style="font-size:26px;font-weight:700;color:var(--earth)">${cost.toLocaleString()}<span style="font-size:14px">円</span></div></div>`;
  r += `<div class="card center"><div class="tiny">差引</div><div style="font-size:26px;font-weight:700;color:var(--accent)">${(value - cost).toLocaleString()}<span style="font-size:14px">円</span></div></div>`;
  r += '</div>';

  r += '<div class="table-wrap"><table class="data"><thead><tr><th>場所</th><th>野菜</th><th>作型</th><th class="num">株数</th><th>収穫期</th><th class="num">種苗費</th><th class="num">金額換算</th></tr></thead><tbody>';
  rows.forEach(x => {
    const placeLabel = x.it.place === 'planter' ? 'ベランダ' : '区画' + String.fromCharCode(65 + parseInt(x.it.place.slice(3), 10));
    r += `<tr style="cursor:pointer" data-veg="${x.v.id}">
      <td class="tiny">${placeLabel}</td>
      <td>${x.v.emoji} ${esc(x.v.name)}</td>
      <td class="tiny">${START_TYPE[x.p.start].icon} ${esc(x.p.label)}</td>
      <td class="num">${x.it.qty}</td>
      <td class="tiny">${x.hv ? rangeLabel(x.hv.from, x.hv.to) : '—'}</td>
      <td class="num">${x.c.toLocaleString()}</td>
      <td class="num">${x.val.toLocaleString()}</td>
    </tr>`;
  });
  r += '</tbody></table></div>';
  r += `<div class="tiny" style="margin-top:8px">
    ※金額換算はスーパーでの一般的な小売価格に基づく概算で、栽培が順調にいった場合の目安です。
    土・肥料・プランター等の初期費用（1〜2万円）は含みません。初年度は差引がマイナスになることも普通ですが、資材は翌年以降も使えます。</div>`;

  /* 作業カレンダー */
  r += '<h2 class="sec">⑦ このプランの作業カレンダー</h2>';
  const byMonth = {};
  s.items.forEach(it => {
    const v = byId(it.vegId);
    const p = v.plans.find(x => x.id === it.planId);
    if (!p) return;
    p.steps.forEach(st => {
      const a = dek(st.from[0], st.from[1]);
      const [mm] = undek(a);
      (byMonth[mm] = byMonth[mm] || []).push(
        `${v.emoji} ${v.name}：${st.label}（${dekLabel(a)}〜）`);
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
  box.querySelectorAll('tr[data-veg]').forEach(tr => tr.onclick = () => openVeg(tr.dataset.veg));
}
