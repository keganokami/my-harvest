/* =========================================================
   ダッシュボード（今月やること）／おすすめ算出／わが家の記録
   ========================================================= */

/* ---------------------------------------------------------
   おすすめスコア
   優先方針：① 失敗しにくさ最優先 ② 収量・食費の足し ③ 継続性（畑を空けない・土を育てる）
   --------------------------------------------------------- */
function planScore(v, p) {
  let s = 0;
  s += v.beginner * 3.0;              // 失敗しにくさ（最重視）
  s += (6 - p.difficulty) * 2.0;      // その作型自体の難しさ
  s += v.cost * 2.0;                  // 食費への貢献
  s += v.freshness * 1.0;             // 採れたての価値
  // 継続性：収穫期間が長いものを評価
  const hs = p.steps.filter(x => x.kind === 'harvest');
  const hlen = hs.reduce((a, x) => a + rangeLen(x.from, x.to), 0);
  s += Math.min(hlen, 12) * 0.4;
  // 土を育てる作物（マメ科）はボーナス
  if (v.family === 'マメ科') s += 2;
  // 連作制約がきついものは微減
  const fam = FAMILY_INFO[v.family];
  if (fam && fam.rest >= 4) s -= 1;
  // 面積効率（1m²あたりの金額換算）
  s += Math.min(valuePerPlant(v) * v.perM2 / 2000, 3);
  return s;
}

/** 今始められる作型を、スコア順で返す */
function startableNow(slack) {
  const now = APP.nowDek;
  const out = [];
  VEG_DB.forEach(v => v.plans.forEach(p => {
    if (canStartNow(p, now, slack || 0)) out.push({ v, p, score: planScore(v, p) });
  }));
  return out.sort((a, b) => b.score - a.score);
}

/** これから n 旬以内に始まる作型 */
function upcoming(fromDek, withinDek) {
  const out = [];
  VEG_DB.forEach(v => v.plans.forEach(p => {
    const s = startStep(p);
    const a = dek(s.from[0], s.from[1]);
    const d = dekDistance(fromDek, a);
    if (d > 0 && d <= withinDek) out.push({ v, p, at: a, d, score: planScore(v, p) });
  }));
  return out.sort((a, b) => a.d - b.d || b.score - a.score);
}

/* ---------------------------------------------------------
   ダッシュボード
   --------------------------------------------------------- */
/* ---------------------------------------------------------
   今週やること：登録した栽培の作業＋適期が終わりそうな種まきを
   ひとつのチェックリストにまとめる
   --------------------------------------------------------- */
function todoKey(text) { return APP.nowDek + ':' + text; }
function todoDone(text) { return !!Store.get('todoDone', {})[todoKey(text)]; }
function toggleTodo(text) {
  const m = Store.get('todoDone', {});
  const k = todoKey(text);
  if (m[k]) delete m[k]; else m[k] = 1;
  Store.set('todoDone', m);
}

function weeklyTodos() {
  const now = APP.nowDek;
  const out = [];

  /* 育てているものへの作業 */
  APP.crops.filter(c => !c.ended).forEach(c => {
    const d = diagnose(c);
    if (!d.v) return;
    d.msgs.filter(m => m.level === 'red' || m.level === 'blue').slice(0, 3).forEach(m => {
      out.push({ u: m.level === 'red' ? 0 : 1, veg: d.v, text: `${d.v.name}：${m.title}`, detail: m.body });
    });
  });

  /* 適期の終わりが近い種まき・植付け */
  const seen = {};
  startableNow(0).forEach(x => {
    const st = startStep(x.p);
    const end = dek(st.to[0], st.to[1]);
    const left = dekDistance(now, end);
    if (left > 3) return;                      // 1ヶ月以上余裕があるものは急がない
    if (seen[x.v.id]) return; seen[x.v.id] = 1;
    const growing = APP.crops.some(c => c.vegId === x.v.id && !c.ended);
    if (growing) return;                       // すでに育てているものは出さない
    out.push({
      u: left <= 1 ? 0 : 2, veg: x.v, vegId: x.v.id,
      text: `${x.v.name}の${st.label}は${dekLabel(end)}まで`,
      detail: `${x.p.label}／適期の終わりまであと約${Math.round((left + 1) * DEK_DAYS)}日。${esc(x.v.summary)}`
    });
  });

  /* 今月の買い物 */
  const [m] = undek(now);
  const mt = MONTH_TASKS[m - 1];
  if (mt.buy && mt.buy.length) {
    out.push({ u: 2, text: `買っておくもの：${mt.buy.join('、')}`, detail: `${m}月に必要になります。人気の苗と種は売り切れます。` });
  }

  out.sort((a, b) => a.u - b.u);
  return out.slice(0, 12);
}

function renderTodos() {
  const box = document.getElementById('nowTodo');
  const list = weeklyTodos();
  if (!list.length) {
    box.innerHTML = '<div class="empty">今すぐ急いでやることはありません。<br>「育てる」タブから次に植えるものを選んでみてください。</div>';
    return;
  }
  let h = '';
  list.forEach((t, i) => {
    const done = todoDone(t.text);
    h += `<div class="todo u${t.u}${done ? ' done' : ''}" data-i="${i}">
      <button class="tk" data-todo="${esc(t.text)}" aria-label="完了にする">✓</button>
      <div class="tb">
        <div class="tt">${esc(t.text)}</div>
        <div class="td">${t.detail}</div>
      </div>
    </div>`;
  });
  box.innerHTML = h;
  box.querySelectorAll('[data-todo]').forEach(b => {
    b.onclick = () => { toggleTodo(b.dataset.todo); renderTodos(); };
  });
  box.querySelectorAll('.todo').forEach((el2, i) => {
    const t = list[i];
    if (!t.vegId) return;
    el2.querySelector('.tb').onclick = () => openVeg(t.vegId);
    el2.querySelector('.tb').style.cursor = 'pointer';
  });
}

/* ---------------------------------------------------------
   「いま」タブ
   --------------------------------------------------------- */
function renderNow() {
  const now = APP.nowDek;
  const [m, j] = undek(now);
  const mt = MONTH_TASKS[m - 1];

  /* 見出し */
  document.getElementById('nowHead').innerHTML = `<div class="card">
    <h3 style="font-size:16px">${m}月${JUN_NAME[j - 1]} ・ ${esc(mt.season)}</h3>
    <div class="muted">${esc(mt.climate)}</div>
    ${mt.watch && mt.watch.length ? `<div class="note red" style="margin-bottom:0"><strong>この時期の注意</strong>${mt.watch.map(esc).join('／')}</div>` : ''}
  </div>`;

  renderTodos();
  renderCropAdvice();

  /* いま植えられるもの */
  const list = document.getElementById('nowStart');
  const s = startableNow(1).slice(0, 10);
  list.innerHTML = '';
  if (!s.length) {
    list.innerHTML = '<div class="empty">この時期に新しく始められる作型はありません。下の「これから3ヶ月」で次の適期を確認してください。</div>';
  }
  s.forEach(x => {
    const c = el('div', 'veg-card');
    const st = startStep(x.p);
    const hv = harvestStep(x.p);
    const end = dek(st.to[0], st.to[1]);
    const left = dekDistance(now, end);
    c.innerHTML =
      (left <= 3 ? `<div class="badge-now">あと約${Math.round((left + 1) * DEK_DAYS)}日</div>` : '') +
      `<div class="vh"><span class="emoji">${x.v.emoji}</span><span class="vname">${esc(x.v.name)}</span></div>` +
      `<div class="tiny" style="margin-bottom:4px">${START_TYPE[x.p.start].icon} ${esc(x.p.label)}</div>` +
      `<div class="vsum">${esc(st.label)}：<b>${rangeLabel(st.from, st.to)}</b>` +
      (hv ? `<br>収穫：${rangeLabel(hv.from, hv.to)}` : '') + `</div>` +
      `<div class="vmeta">
        <span class="pill green">やさしさ ${stars(x.v.beginner)}</span>
        <span class="pill accent">${x.v.marketValue.toLocaleString()}円/${esc(x.v.valueUnit)}</span>
      </div>`;
    c.onclick = () => openVeg(x.v.id);
    list.appendChild(c);
  });

  /* 今月の作業（折りたたみ） */
  document.getElementById('nowMonth').innerHTML = `
    <h3 class="sub">今月やること</h3>
    <ul class="clean">${mt.todo.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
    <h3 class="sub">注意すること</h3>
    <ul class="clean">${mt.watch.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
    <h3 class="sub">買っておくもの</h3>
    <div>${mt.buy.map(b => `<span class="pill accent">${esc(b)}</span>`).join('')}</div>
    <div class="note" style="margin-top:12px"><strong>📍 この立地の補正</strong>${esc(SITE.corrections[1])}</div>`;

  /* これから3ヶ月 */
  const up = upcoming(now, 9);
  const seen = {};
  const rows = [];
  up.forEach(x => {
    const k = x.v.id + ':' + x.p.id;
    if (seen[k]) return; seen[k] = 1;
    rows.push(x);
  });
  let ah = '<div class="table-wrap"><table class="data"><thead><tr><th>時期</th><th>野菜</th><th class="hide-sm">作型</th><th>やること</th></tr></thead><tbody>';
  rows.slice(0, 18).forEach(x => {
    const st = startStep(x.p);
    ah += `<tr data-veg="${x.v.id}">
      <td><b>${dekLabel(x.at)}</b></td>
      <td>${x.v.emoji} ${esc(x.v.name)}</td>
      <td class="tiny hide-sm">${START_TYPE[x.p.start].icon} ${esc(x.p.label)}</td>
      <td class="tiny">${esc(st.label)}<br>${esc(START_TYPE[x.p.start].label)}</td>
    </tr>`;
  });
  ah += '</tbody></table></div>';
  const ae = document.getElementById('nowAhead');
  ae.innerHTML = ah;
  ae.querySelectorAll('tr[data-veg]').forEach(tr => {
    tr.style.cursor = 'pointer';
    tr.onclick = () => openVeg(tr.dataset.veg);
  });
}

function currentStepOf(plan, nowDek) {
  let best = null;
  plan.steps.forEach((s, i) => {
    if (inRange(nowDek, s.from, s.to)) {
      if (!best || KIND_PRIORITY[s.kind] > KIND_PRIORITY[best.s.kind]) best = { s, i };
    }
  });
  return best;
}

function nextStepOf(plan, nowDek) {
  let best = null;
  plan.steps.forEach(s => {
    const a = dek(s.from[0], s.from[1]);
    const d = dekDistance(nowDek, a);
    if (d > 0 && (!best || d < best.d)) best = { s, d, at: a };
  });
  return best;
}

/* ---------------------------------------------------------
   ダッシュボードに出す、登録中の栽培へのアドバイス
   （診断エンジン本体は js/journal.js の diagnose()）
   --------------------------------------------------------- */
function renderCropAdvice() {
  const box = document.getElementById('nowCrops');
  const recs = APP.crops.filter(c => !c.ended);
  if (!APP.crops.length) {
    box.innerHTML = `<div class="card"><div class="empty">
      まだ登録がありません。「記録」タブで、いま育てているもの（これから植えるもの）を登録すると、
      ここに状態に応じたアドバイスが出ます。</div></div>`;
    return;
  }
  if (!recs.length) {
    box.innerHTML = '<div class="card"><div class="empty">進行中の栽培はありません（すべて終了済み）。</div></div>';
    return;
  }
  let h = '<div class="card">';
  recs.forEach(c => {
    const d = diagnose(c);
    if (!d.v) return;
    const top = d.msgs.filter(m => m.level === 'red')[0] || d.msgs[0];
    h += `<div class="crop-row" data-crop="${c.id}" style="cursor:pointer">
      <div class="cicon">${d.v.emoji}</div>
      <div class="cbody">
        <div class="ctitle">${esc(d.v.name)}
          <span class="tiny">／ ${c.qty}株 ／ ${c.place === 'plot' ? '地植え' : 'プランター'}</span></div>
        <div class="tiny">${d.days}日目 ・ ${d.actIdx >= 0 ? esc(d.stages[d.actIdx].label) : '状態は未記録'}</div>
        <div class="progress"><i style="width:${d.progress}%"></i></div>
        ${top ? `<div class="note ${top.level}" style="margin:6px 0 0"><strong>${esc(top.title)}</strong>${top.body}</div>` : ''}
        ${d.msgs.length > 1 ? `<div class="tiny" style="margin-top:5px">ほか${d.msgs.length - 1}件 ▸ タップで「記録」タブへ</div>` : ''}
      </div>
    </div>`;
  });
  h += '</div>';
  box.innerHTML = h;
  box.querySelectorAll('[data-crop]').forEach(elm => {
    elm.onclick = () => { goTab('log'); };
  });
}

function fillVegSelect(sel, planSel) {
  sel.innerHTML = VEG_DB.map(v => `<option value="${v.id}">${v.emoji} ${v.name}</option>`).join('');
  const upd = () => {
    const v = byId(sel.value);
    planSel.innerHTML = v.plans.map(p =>
      `<option value="${p.id}">${START_TYPE[p.start].icon} ${p.label}</option>`).join('');
  };
  sel.onchange = upd;
  upd();
}

function presetLog(vegId) {
  const fold = document.getElementById('foldAdd');
  if (fold) fold.open = true;
  const sel = document.getElementById('logVeg');
  sel.value = vegId;
  if (sel.onchange) sel.onchange();
}
