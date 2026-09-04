/* =========================================================
   年間カレンダー（ガントチャート）／野菜図鑑／詳細モーダル
   ========================================================= */

const KIND_PRIORITY = { harvest: 5, sow: 4, plant: 4, nursery: 3, grow: 2, store: 1 };

/** プランを36旬の配列（各旬の代表ステップ種別）に展開 */
function planToTrack(plan) {
  const track = new Array(36).fill(null);
  plan.steps.forEach(s => {
    for (let i = 0; i < 36; i++) {
      if (inRange(i, s.from, s.to)) {
        const cur = track[i];
        if (!cur || KIND_PRIORITY[s.kind] > KIND_PRIORITY[cur.kind]) {
          track[i] = { kind: s.kind, label: s.label };
        }
      }
    }
  });
  return track;
}

/** 1年（36旬）をコンパクトな帯で表す。スマホで年間の流れを掴むためのもの */
function yearStripHtml(plan) {
  const track = planToTrack(plan);
  let bars = '';
  for (let i = 0; i < 36; i++) {
    const c = track[i];
    const isNow = i === APP.nowDek;
    bars += `<i class="${isNow ? 'now' : ''}"${c ? ` style="background:${STEP_KIND[c.kind].color}"` : ''} title="${dekLabel(i)}${c ? '：' + esc(c.label) : ''}"></i>`;
  }
  let mons = '';
  for (let m = 1; m <= 12; m++) mons += `<span>${m}</span>`;
  const kinds = [];
  plan.steps.forEach(st => { if (kinds.indexOf(st.kind) < 0) kinds.push(st.kind); });
  const legend = kinds.map(k =>
    `<span><i style="background:${STEP_KIND[k].color}"></i>${STEP_KIND[k].label}</span>`).join('');
  return `<div class="yearstrip">
    <div class="bars">${bars}</div>
    <div class="mon">${mons}</div>
    <div class="legend-mini">${legend}<span style="color:var(--accent)">□ 今</span></div>
  </div>`;
}

/* ---------------- フィルタ状態 ---------------- */
const calFilter = { start: 'all', place: 'all', level: 'all', season: 'all' };
const vegFilter = { cat: 'all', place: 'all', level: 'all', now: false, q: '' };

function buildChips(container, groups, onChange) {
  container.innerHTML = '';
  groups.forEach(g => {
    const wrap = el('div', 'fg');
    wrap.appendChild(el('span', 'muted', g.label + '：'));
    g.options.forEach(o => {
      const b = el('button', 'chip' + (g.get() === o.v ? ' on' : ''), o.t);
      b.onclick = () => { g.set(o.v); onChange(); };
      wrap.appendChild(b);
    });
    container.appendChild(wrap);
  });
}

/* ---------------- 年間カレンダー ---------------- */
function renderCalendar() {
  const fBox = document.getElementById('calFilters');
  buildChips(fBox, [
    { label: '始め方', get: () => calFilter.start, set: v => calFilter.start = v,
      options: [{ v: 'all', t: 'すべて' }, { v: 'seed', t: '種から' }, { v: 'seedling', t: '苗・株から' }] },
    { label: '場所', get: () => calFilter.place, set: v => calFilter.place = v,
      options: [{ v: 'all', t: 'すべて' }, { v: 'plot', t: '地植え' }, { v: 'planter', t: 'プランター可' }] },
    { label: '難易度', get: () => calFilter.level, set: v => calFilter.level = v,
      options: [{ v: 'all', t: 'すべて' }, { v: 'easy', t: '初心者向けのみ' }] }
  ], renderCalendar);

  // 凡例
  const leg = document.getElementById('calLegend');
  leg.innerHTML = '';
  Object.keys(STEP_KIND).forEach(k => {
    const s = el('span', '', `<i style="background:${STEP_KIND[k].color}"></i>${STEP_KIND[k].label}`);
    leg.appendChild(s);
  });

  const rows = [];
  VEG_DB.forEach(v => {
    if (calFilter.place !== 'all' && !v.place.includes(calFilter.place)) return;
    if (calFilter.level === 'easy' && v.beginner < 4) return;
    v.plans.forEach(p => {
      const isSeed = p.start === 'seed';
      if (calFilter.start === 'seed' && !isSeed) return;
      if (calFilter.start === 'seedling' && isSeed) return;
      rows.push({ v, p });
    });
  });

  const now = APP.nowDek;
  const t = document.getElementById('calTable');
  let h = '<thead><tr><th class="name" rowspan="2">野菜／作型</th>';
  for (let m = 1; m <= 12; m++) h += `<th class="mon" colspan="3">${m}月</th>`;
  h += '</tr><tr>';
  for (let i = 0; i < 36; i++) h += `<th>${['上', '中', '下'][i % 3]}</th>`;
  h += '</tr></thead><tbody>';

  rows.forEach((r, ri) => {
    const track = planToTrack(r.p);
    const rec = /推奨/.test(r.p.label);
    h += `<tr data-veg="${r.v.id}">`;
    h += `<th class="name">${r.v.emoji} ${esc(r.v.name)}`
       + `<span class="plan-label"><br>${START_TYPE[r.p.start].icon} ${esc(r.p.label)}${rec ? '' : ''}</span></th>`;
    for (let i = 0; i < 36; i++) {
      const c = track[i];
      const cls = 'cell' + (i % 3 === 0 ? ' q1' : '') + (i === now ? ' now' : '');
      if (c) {
        const isStart = !track[(i + 35) % 36] || track[(i + 35) % 36].kind !== c.kind;
        const label = isStart ? STEP_KIND[c.kind].short : '';
        h += `<td class="${cls}" title="${esc(r.v.name)}／${esc(c.label)}">`
           + `<div class="bar" style="background:${STEP_KIND[c.kind].color}">${label}</div></td>`;
      } else {
        h += `<td class="${cls}"></td>`;
      }
    }
    h += '</tr>';
  });
  h += '</tbody>';
  t.innerHTML = h;
  t.querySelectorAll('tbody tr').forEach(tr => {
    tr.style.cursor = 'pointer';
    tr.onclick = () => openVeg(tr.dataset.veg);
  });
}

/* ---------------- 野菜図鑑 ---------------- */
function renderVegList() {
  const fBox = document.getElementById('vegFilters');
  const cats = ['all'].concat(Array.from(new Set(VEG_DB.map(v => v.category))));
  buildChips(fBox, [
    { label: '分類', get: () => vegFilter.cat, set: v => vegFilter.cat = v,
      options: cats.map(c => ({ v: c, t: c === 'all' ? 'すべて' : c })) },
    { label: '場所', get: () => vegFilter.place, set: v => vegFilter.place = v,
      options: [{ v: 'all', t: 'すべて' }, { v: 'plot', t: '地植え' }, { v: 'planter', t: 'プランター可' }] },
    { label: '難易度', get: () => vegFilter.level, set: v => vegFilter.level = v,
      options: [{ v: 'all', t: 'すべて' }, { v: 'easy', t: '★初心者向け' }] },
    { label: '時期', get: () => (vegFilter.now ? 'now' : 'all'), set: v => vegFilter.now = (v === 'now'),
      options: [{ v: 'all', t: 'すべて' }, { v: 'now', t: '今まける・植えられる' }] }
  ], renderVegList);

  const list = document.getElementById('vegList');
  list.innerHTML = '';
  const now = APP.nowDek;
  let n = 0;
  const total = VEG_DB.reduce((a, v) => a + v.plans.length, 0);
  VEG_DB.forEach(v => {
    if (vegFilter.cat !== 'all' && v.category !== vegFilter.cat) return;
    if (vegFilter.place !== 'all' && !v.place.includes(vegFilter.place)) return;
    if (vegFilter.level === 'easy' && v.beginner < 4) return;
    const startable = v.plans.filter(p => canStartNow(p, now));
    if (vegFilter.now && startable.length === 0) return;
    n++;
    const c = el('div', 'veg-card');
    c.innerHTML =
      (startable.length ? '<div class="badge-now">いま植え時</div>' : '') +
      `<div class="vh"><span class="emoji">${v.emoji}</span><span class="vname">${esc(v.name)}</span></div>` +
      `<div class="vsum">${esc(v.summary)}</div>` +
      `<div class="vmeta">` +
        `<span class="pill">${esc(v.family)}</span>` +
        `<span class="pill ${v.beginner >= 4 ? 'green' : ''}">やさしさ ${stars(v.beginner)}</span>` +
        `<span class="pill ${v.cost >= 4 ? 'accent' : ''}">おトク度 ${stars(v.cost)}</span>` +
        (v.place.includes('planter') ? '<span class="pill blue">プランター可</span>' : '') +
        (v.sun === 'shade' ? '<span class="pill">半日陰OK</span>' : (v.sun === 'half' ? '<span class="pill">半日陰でも可</span>' : '')) +
      `</div>`;
    c.onclick = () => openVeg(v.id);
    list.appendChild(c);
  });
  if (!n) list.innerHTML = '<div class="empty">条件に合う野菜がありません。フィルタを緩めてください。</div>';
  const cnt = document.getElementById('vegCount');
  if (cnt) cnt.textContent = `${n}種を表示中（収録 ${VEG_DB.length}種 ／ 作型 ${total}パターン）`;
}

/* ---------------- 詳細モーダル ---------------- */
function openVeg(id) {
  const v = byId(id);
  if (!v) return;
  const now = APP.nowDek;
  const fam = FAMILY_INFO[v.family] || {};

  let h = `<button class="close" id="mClose">×</button>`;
  h += `<h2>${v.emoji} ${esc(v.name)}</h2>`;
  h += `<div class="muted" style="margin-bottom:10px">${esc(v.summary)}</div>`;

  h += `<div style="margin-bottom:14px">
    <span class="pill">${esc(v.family)}</span>
    <span class="pill ${v.beginner >= 4 ? 'green' : ''}">失敗しにくさ ${stars(v.beginner)}</span>
    <span class="pill ${v.cost >= 4 ? 'accent' : ''}">食費への貢献 ${stars(v.cost)}</span>
    <span class="pill">鮮度の価値 ${stars(v.freshness)}</span>
    <span class="pill">連作を空ける年数 ${fam.rest || 1}年</span>
    <span class="pill">${v.sun === 'full' ? '日なた必須' : v.sun === 'half' ? '半日陰でも可' : '半日陰向き'}</span>
  </div>`;

  h += `<div class="note green"><strong>この野菜を選ぶ理由</strong>${esc(v.whyGood)}</div>`;

  /* 作型 */
  h += `<h3 class="sub">作型（始め方の選択肢）</h3>`;
  v.plans.forEach(p => {
    const rec = /推奨/.test(p.label);
    const startable = canStartNow(p, now);
    h += `<div class="plan-box${rec ? ' rec' : ''}">`;
    h += `<div class="ph"><span class="pname">${START_TYPE[p.start].icon} ${esc(p.label)}</span>`;
    h += `<span class="pill">${START_TYPE[p.start].label}</span>`;
    h += `<span class="pill">難易度 ${'●'.repeat(p.difficulty)}${'○'.repeat(5 - p.difficulty)}</span>`;
    h += `<span class="pill">${p.days}日で収穫</span>`;
    if (startable) h += `<span class="pill accent">いま始められます</span>`;
    h += `</div>`;
    if (p.note) h += `<div class="muted" style="margin-bottom:6px">${esc(p.note)}</div>`;
    h += yearStripHtml(p);
    h += `<div class="tiny">目安コスト：${START_TYPE[p.start].cost}</div>`;
    h += `<div class="steps">`;
    p.steps.forEach(s => {
      h += `<div class="step-line">
        <span class="dot" style="background:${STEP_KIND[s.kind].color}"></span>
        <span class="when">${rangeLabel(s.from, s.to)}</span>
        <span>${esc(s.label)}</span></div>`;
    });
    h += `</div></div>`;
  });

  /* 育て方 */
  h += `<h3 class="sub">育て方のポイント</h3><ul class="clean">`;
  v.keys.forEach(k => h += `<li>${esc(k)}</li>`);
  h += `</ul>`;

  h += `<div class="grid c2" style="margin:14px 0">
    <div class="card tight"><h3>💧 水やり</h3><div class="muted">${esc(v.water)}</div></div>
    <div class="card tight"><h3>🧪 肥料</h3><div class="muted">${esc(v.fert)}</div></div>
  </div>`;

  /* 栽培条件 */
  h += `<h3 class="sub">栽培スペース</h3>`;
  h += `<div class="table-wrap"><table class="data">
    <tr><th style="width:34%">株間 × 条間</th><td>${v.spacing.plant}cm × ${v.spacing.row}cm</td></tr>
    <tr><th>必要な土の深さ</th><td>${v.depth}cm 以上</td></tr>
    <tr><th>プランターの目安</th><td>${esc(v.container)}</td></tr>
    <tr><th>1m²あたりの株数</th><td>約 ${v.perM2} 株</td></tr>
    <tr><th>収量の目安</th><td>${esc(v.yieldNote)}</td></tr>
    <tr><th>金額の目安</th><td>約 ${v.marketValue.toLocaleString()}円 ／ ${esc(v.valueUnit)}</td></tr>
  </table></div>`;

  /* トラブル */
  if (v.troubles && v.troubles.length) {
    h += `<h3 class="sub">よくあるトラブル</h3>`;
    v.troubles.forEach(t => {
      h += `<div class="cause"><div class="cname">${esc(t.name)}</div>
        <div class="tiny">症状：${esc(t.sign)}${t.cause ? '　／　原因：' + esc(t.cause) : ''}</div>
        <div class="muted">→ ${esc(t.fix)}</div></div>`;
    });
  }

  /* 連作 */
  h += `<h3 class="sub">連作・相性</h3>`;
  h += `<div class="note blue"><strong>${esc(v.family)}：${fam.rest || 1}年空ける</strong>
    ${esc(fam.why || '')}<br><span class="tiny">同じ科：${esc(fam.members || '')}</span></div>`;
  if (v.companions && v.companions.length) {
    h += `<div class="muted">相性の良い組み合わせ：${v.companions.map(esc).join('、')}</div>`;
  }

  h += `<div class="note" style="margin-top:16px"><strong>ひとこと</strong>${esc(v.tip)}</div>`;

  h += `<div class="row" style="margin-top:18px">
    <button class="btn" id="mAddLog">この野菜を記録に登録する</button>
    <button class="btn ghost" id="mAddSim">作付けプランに追加</button>
  </div>`;

  const modal = document.getElementById('modal');
  modal.innerHTML = h;
  const bg = document.getElementById('modalBg');
  bg.hidden = false;
  bg.scrollTop = 0;
  if (document.body && document.body.classList) document.body.classList.add('modal-open');
  document.getElementById('mClose').onclick = closeModal;
  document.getElementById('mAddLog').onclick = () => { closeModal(); goTab('log'); presetLog(v.id); };
  document.getElementById('mAddSim').onclick = () => { closeModal(); goTab('plan'); presetSim(v.id); };
}

function closeModal() {
  document.getElementById('modalBg').hidden = true;
  if (document.body && document.body.classList) document.body.classList.remove('modal-open');
}
