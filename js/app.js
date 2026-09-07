/* =========================================================
   アプリ本体：状態管理・タブ・診断・基礎知識
   ========================================================= */

/** ビルド識別子（キャッシュの確認用。tools/release.sh が書き換える） */
const BUILD = '20260907-2243';

const APP = {
  today: new Date(),
  nowDek: 0,
  crops: [],
  sim: null,
  simWhen: undefined   // 平面図で表示している旬（未設定なら「いま」）
};

/* ---------------- タブ ---------------- */
function goTab(name) {
  document.querySelectorAll('nav.tabs button').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.panel').forEach(p =>
    p.classList.toggle('active', p.id === 'panel-' + name));
  window.scrollTo({ top: 0, behavior: 'auto' });
  if (name === 'now') renderNow();
  if (name === 'grow') renderVegList();
  if (name === 'plan') renderSim();
  if (name === 'log') renderLogTab();
  APP.tab = name;
  Store.set('tab', name);
}

/* ---------------- 症状診断 ---------------- */
const docFilter = { part: 'all' };
function renderDoctor() {
  const parts = ['all'].concat(Array.from(new Set(SYMPTOMS.map(s => s.part))));
  buildChips(document.getElementById('docFilters'), [
    { label: '部位', get: () => docFilter.part, set: v => docFilter.part = v,
      options: parts.map(p => ({ v: p, t: p === 'all' ? 'すべて' : p })) }
  ], renderDoctor);

  const box = document.getElementById('docList');
  box.innerHTML = '';
  SYMPTOMS.filter(s => docFilter.part === 'all' || s.part === docFilter.part).forEach(s => {
    const item = el('div', 'symptom-item');
    item.innerHTML = `<button><span>${esc(s.symptom)}</span><span class="pill">${esc(s.part)}</span></button>
      <div class="symptom-body" hidden>${s.causes.map(c => `
        <div class="cause">
          <div class="cname">${esc(c.name)}</div>
          <div class="muted">${esc(c.detail)}</div>
          <div style="margin-top:3px">→ ${esc(c.fix)}</div>
        </div>`).join('')}</div>`;
    const body = item.querySelector('.symptom-body');
    item.querySelector('button').onclick = () => { body.hidden = !body.hidden; };
    box.appendChild(item);
  });
}

/* ---------------- 基礎知識 ---------------- */
function renderGuide() {
  const box = document.getElementById('guideList');
  box.innerHTML = GUIDES.map(g => `
    <div class="card">
      <h3 style="font-size:16px">${g.icon} ${esc(g.title)}</h3>
      ${g.body.map(b => `<h3 class="sub">${esc(b.h)}</h3><div class="muted">${esc(b.p)}</div>`).join('')}
    </div>`).join('');

  // 立地情報
  box.insertAdjacentHTML('afterbegin', `
    <div class="note green">
      <strong>📍 この菜園の前提（${esc(SITE.name)}）</strong>
      栽培区分：<b>${esc(SITE.zone)}</b>（${esc(SITE.altitude)}）。${esc(SITE.zoneNote)}
      <ul class="clean" style="margin-top:8px">
        ${SITE.corrections.map(c => `<li>${esc(c)}</li>`).join('')}
      </ul>
    </div>`);

  // 科の一覧
  let t = '<thead><tr><th>科</th><th class="num">空ける年数</th><th>主な野菜</th><th>理由・対策</th></tr></thead><tbody>';
  Object.keys(FAMILY_INFO).forEach(k => {
    const f = FAMILY_INFO[k];
    t += `<tr>
      <td><span class="pill" style="background:${f.color};color:#fff;border-color:transparent">${esc(k)}</span></td>
      <td class="num"><b>${f.rest}年</b></td>
      <td class="tiny">${esc(f.members)}</td>
      <td class="tiny">${esc(f.why)}<br><b>${esc(f.tip)}</b></td>
    </tr>`;
  });
  document.getElementById('familyTable').innerHTML = t + '</tbody>';

  // 初期費用
  let c = '<thead><tr><th>品目</th><th class="num">目安価格</th><th>備考</th></tr></thead><tbody>';
  let sum = 0;
  STARTUP_COST.forEach(x => {
    sum += x.price;
    c += `<tr><td>${esc(x.item)}</td><td class="num">${x.price.toLocaleString()}円</td><td class="tiny">${esc(x.note)}</td></tr>`;
  });
  c += `</tbody><tfoot><tr><th>合計</th><th class="num">${sum.toLocaleString()}円</th><th class="tiny">道具は数年使えます</th></tr></tfoot>`;
  document.getElementById('costTable').innerHTML = c;
}

/* ---------------- 記録タブのフォーム ---------------- */
function initLogForm() {
  const vsel = document.getElementById('logVeg');
  const psel = document.getElementById('logPlan');
  fillVegSelect(vsel, psel);
  const d = APP.today;
  document.getElementById('logDate').value =
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  document.getElementById('logAdd').onclick = () => {
    const rec = {
      vegId: vsel.value,
      planId: psel.value,
      date: document.getElementById('logDate').value,
      qty: Math.max(1, parseInt(document.getElementById('logQty').value, 10) || 1),
      place: 'plot'
    };
    if (!rec.date) { alert('開始日を入力してください。'); return; }
    APP.crops.push(ensureCropShape(rec));
    saveCrops();
  };
}

/* ---------------- 起動 ---------------- */
function boot() {
  APP.today = new Date();
  APP.nowDek = dateToDek(APP.today);
  APP.crops = Store.get('crops', []).map(ensureCropShape);   // 旧形式の記録も読めるよう整形
  APP.sim = Store.get('sim', null) || {};
  if (!APP.sim.edges) {
    // 実測の敷地（四角形）を既定にする
    APP.sim.edges = { left: 160, right: 140, top: 110, bottom: 140 };
    APP.sim.bedW = 50;
    APP.sim.pathW = 0;   // 小さな敷地なので、外周から作業する前提で通路を取らない
    // 長方形前提／区画前提の古い割り当ては引き継げないので破棄
    if (APP.sim.plotW !== undefined || APP.sim.beds !== undefined) APP.sim.items = [];
  }
  if (!APP.sim.dir) APP.sim.dir = 'ns';
  if (!Array.isArray(APP.sim.items)) APP.sim.items = [];
  delete APP.sim.areaM2; delete APP.sim.beds; delete APP.sim.planters;
  delete APP.sim.sun; delete APP.sim.plotW; delete APP.sim.plotD;
  {
    const lay = bedLayout(APP.sim);
    APP.sim.items = APP.sim.items.filter(it =>
      it.place !== 'planter' && parseInt(it.place.slice(3), 10) < lay.count);
  }

  const [m, j] = undek(APP.nowDek);
  document.getElementById('todayBadge').textContent =
    `${m}/${APP.today.getDate()}・${m}月${JUN_NAME[j - 1]}`;

  const bv = document.getElementById('buildVer');
  if (bv) bv.textContent = 'build ' + BUILD;

  document.getElementById('tabbar').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (b) goTab(b.dataset.tab);
  });

  document.getElementById('modalBg').addEventListener('click', e => {
    if (e.target.id === 'modalBg') closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  initLogForm();
  initSimForm();
  renderNow();
  renderDoctor();
  renderGuide();

  // <summary> の開閉が効かない環境（一部の iOS Safari）への保険。
  // ネイティブで開閉できた場合は何もしない。
  document.querySelectorAll('details.fold > summary').forEach(sm => {
    sm.addEventListener('click', () => {
      const d = sm.parentElement;
      const before = d.open;
      setTimeout(() => { if (d.open === before) d.open = !before; }, 0);
    });
  });

  // 年間カレンダーは開いたときに初めて描画する（スマホでの初期表示を軽くするため）
  const foldCal = document.getElementById('foldCal');
  if (foldCal) foldCal.addEventListener('toggle', () => { if (foldCal.open) renderCalendar(); });

  // 前回開いていたタブを復元
  const last = Store.get('tab', 'now');
  if (last && last !== 'now') goTab(last);
}

document.addEventListener('DOMContentLoaded', boot);
