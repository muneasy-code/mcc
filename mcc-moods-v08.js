// MCC v0.8 · mood scenes + Herrmann API cost meter
(() => {
  const frame = document.getElementById('mcc');
  if (!frame) return;

  const BUDGET_KEY = 'mcc-herrmann-budget-usd';
  const monthId = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  };
  const usageKey = () => `mcc-herrmann-usage-${monthId()}`;
  const readBudget = () => {
    const n = Number(localStorage.getItem(BUDGET_KEY));
    return Number.isFinite(n) && n > 0 ? n : 1;
  };
  const readUsage = () => {
    try {
      const v = JSON.parse(localStorage.getItem(usageKey()) || '{}');
      return {
        checks: Number(v.checks || 0),
        estimated_usd: Number(v.estimated_usd || 0),
        input_tokens: Number(v.input_tokens || 0),
        output_tokens: Number(v.output_tokens || 0),
        cached_input_tokens: Number(v.cached_input_tokens || 0)
      };
    } catch {
      return { checks:0, estimated_usd:0, input_tokens:0, output_tokens:0, cached_input_tokens:0 };
    }
  };
  const saveUsage = (u) => localStorage.setItem(usageKey(), JSON.stringify(u));
  const money = (n) => n < 0.01 ? `$${n.toFixed(4)}` : `$${n.toFixed(3)}`;

  const sceneSymbols = {
    happy: ['☀︎','✦','☼','✧','☀︎','✦'],
    okay: ['✦','·','✧','·'],
    tired: ['☾','·','☁︎','☾'],
    sad: ['☁︎','☾','·','☁︎'],
    chaos: ['⚡','✦','⟡','⚡','✷','✦'],
    autumn: ['🍂','🍁','🍂','🍁','🍂','🍁','🍂','🍁','🍂']
  };

  function ensureStyles(d){
    let style = d.getElementById('mcc-v08-mood-style');
    if (style) return;
    style = d.createElement('style');
    style.id = 'mcc-v08-mood-style';
    style.textContent = `
      body{transition:background .55s ease,color .35s ease}
      .mcc-mood-scene{position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:7}
      .mcc-mood-scene span{position:absolute;display:block;user-select:none;opacity:.24;filter:drop-shadow(0 0 10px currentColor);animation:mccMoodFloat 10s ease-in-out infinite}
      .mcc-mood-scene[data-kind="autumn"] span{top:-12vh!important;animation-name:mccLeafFall;animation-timing-function:linear;opacity:.58;filter:drop-shadow(0 5px 8px rgba(0,0,0,.25))}
      @keyframes mccMoodFloat{0%,100%{transform:translate3d(0,0,0) rotate(0deg)}50%{transform:translate3d(10px,-16px,0) rotate(8deg)}}
      @keyframes mccLeafFall{0%{transform:translate3d(0,-10vh,0) rotate(0deg)}45%{transform:translate3d(34px,48vh,0) rotate(160deg)}100%{transform:translate3d(-22px,115vh,0) rotate(350deg)}}
      @media (prefers-reduced-motion:reduce){.mcc-mood-scene span{animation:none!important}}

      body[data-mood="happy"]{
        --mood-accent:#ffd166;
        background:
          radial-gradient(circle at 12% 0%,rgba(255,205,96,.28),transparent 25rem),
          radial-gradient(circle at 88% 8%,rgba(99,215,255,.17),transparent 28rem),
          radial-gradient(circle at 48% 34%,rgba(255,141,116,.11),transparent 30rem),
          linear-gradient(180deg,rgba(255,190,90,.025),rgba(255,255,255,0)),#08090e!important;
      }
      body[data-mood="happy"] .focus-card{background:radial-gradient(circle at 86% 12%,rgba(255,205,96,.24),transparent 30%),radial-gradient(circle at 10% 92%,rgba(99,215,255,.13),transparent 27%),linear-gradient(180deg,rgba(24,23,29,.98),rgba(13,15,22,.98))!important}
      body[data-mood="happy"] .card,body[data-mood="happy"] .project{border-color:rgba(255,205,96,.12)!important}
      body[data-mood="happy"] .mood-btn.active{background:linear-gradient(135deg,rgba(255,205,96,.19),rgba(255,141,116,.12))!important;border-color:rgba(255,205,96,.22)!important;box-shadow:0 0 28px rgba(255,205,96,.12)!important}

      body[data-mood="autumn"]{
        --mood-accent:#d98a45;
        background:
          radial-gradient(circle at 10% -4%,rgba(190,102,47,.24),transparent 27rem),
          radial-gradient(circle at 92% 6%,rgba(117,74,44,.20),transparent 28rem),
          radial-gradient(circle at 50% 34%,rgba(217,138,69,.08),transparent 34rem),
          linear-gradient(180deg,rgba(111,64,35,.05),rgba(255,255,255,0)),#080706!important;
      }
      body[data-mood="autumn"] .topbar,body[data-mood="autumn"] .sidebar{background:rgba(16,11,8,.78)!important;border-color:rgba(202,132,74,.12)!important}
      body[data-mood="autumn"] .card,body[data-mood="autumn"] .project,body[data-mood="autumn"] .mood-pod{border-color:rgba(211,137,76,.14)!important}
      body[data-mood="autumn"] .card{background:radial-gradient(circle at 100% 0%,rgba(175,93,43,.07),transparent 25%),linear-gradient(180deg,rgba(24,19,16,.985),rgba(14,12,11,.985))!important}
      body[data-mood="autumn"] .focus-card{background:radial-gradient(circle at 83% 13%,rgba(202,111,55,.22),transparent 31%),radial-gradient(circle at 12% 92%,rgba(116,73,43,.15),transparent 27%),linear-gradient(180deg,rgba(25,19,15,.99),rgba(13,11,10,.99))!important}
      body[data-mood="autumn"] .gradtext{background:linear-gradient(135deg,#ffb36b,#d77a43,#9f6b45)!important;-webkit-background-clip:text!important;background-clip:text!important;color:transparent!important}
      body[data-mood="autumn"] .mood-btn.active{background:linear-gradient(135deg,rgba(217,138,69,.25),rgba(113,68,38,.27))!important;border-color:rgba(232,155,89,.20)!important}

      .mood-btn{display:inline-flex!important;align-items:center!important;gap:5px!important}
      .herrmann-cost-strip{margin:0 14px 14px;padding:10px 11px;border:1px solid rgba(255,255,255,.08);border-radius:14px;background:rgba(17,20,27,.72);display:grid;grid-template-columns:1fr auto;gap:5px 10px;align-items:center}
      .herrmann-cost-strip .hc-title{font-size:10px;letter-spacing:.11em;text-transform:uppercase;color:#8f96a7;font-weight:900}
      .herrmann-cost-strip .hc-value{font-size:11px;color:#eef1f7;font-weight:800;text-align:right}
      .herrmann-cost-strip .hc-sub{font-size:9px;color:#747b8b}
      .herrmann-cost-strip button{border:0;background:transparent;color:#9ca4b5;font-size:9px;padding:0;text-decoration:underline;text-underline-offset:2px}
      .herrmann-cost-bar{grid-column:1/-1;height:4px;border-radius:999px;background:#242833;overflow:hidden}
      .herrmann-cost-bar i{display:block;height:100%;width:0;border-radius:999px;background:linear-gradient(90deg,#63d7ff,#d865ff,#ff8d74);transition:width .3s ease}
      .herrmann-cost-strip.near{border-color:rgba(255,174,84,.25)}
      .herrmann-cost-strip.hit{border-color:rgba(255,111,127,.35);box-shadow:0 0 24px rgba(255,111,127,.08)}
    `;
    d.head.appendChild(style);
  }

  function ensureScene(d){
    let scene = d.getElementById('mccMoodScene');
    if (!scene) {
      scene = d.createElement('div');
      scene.id = 'mccMoodScene';
      scene.className = 'mcc-mood-scene';
      d.body.appendChild(scene);
    }
    return scene;
  }

  function renderScene(d){
    const mood = d.body.dataset.mood || 'okay';
    const scene = ensureScene(d);
    scene.dataset.kind = mood;
    const symbols = sceneSymbols[mood] || sceneSymbols.okay;
    scene.innerHTML = symbols.map((s,i) => {
      const left = [7,22,39,57,73,88,15,48,81][i % 9];
      const top = mood === 'autumn' ? -12 : [12,24,8,44,18,36,62,68,58][i % 9];
      const size = mood === 'autumn' ? 15 + (i%3)*3 : 13 + (i%3)*4;
      const delay = -(i * 1.65);
      const dur = mood === 'autumn' ? 8 + (i%4)*2.2 : 8 + (i%4)*1.8;
      return `<span style="left:${left}%;top:${top}%;font-size:${size}px;animation-delay:${delay}s;animation-duration:${dur}s">${s}</span>`;
    }).join('');
  }

  function renderCost(d){
    const u = readUsage();
    const budget = readBudget();
    let strip = d.getElementById('mccHerrmannCost');
    const controls = d.getElementById('moodControls');
    if (!controls) return;
    if (!strip) {
      strip = d.createElement('div');
      strip.id = 'mccHerrmannCost';
      strip.className = 'herrmann-cost-strip';
      strip.innerHTML = `<div class="hc-title">◎ Herrmann API · Luna</div><div class="hc-value" id="hcValue"></div><div class="hc-sub">Monat · dieses Gerät</div><button type="button" id="hcLimit">Limit ändern</button><div class="herrmann-cost-bar"><i id="hcBar"></i></div>`;
      controls.insertAdjacentElement('afterend', strip);
      strip.querySelector('#hcLimit')?.addEventListener('click', () => {
        const current = readBudget();
        const raw = frame.contentWindow.prompt('Herrmann-Monatslimit in USD für dieses Gerät:', current.toFixed(2));
        if (raw === null) return;
        const n = Number(String(raw).replace(',','.'));
        if (!Number.isFinite(n) || n < 0.01 || n > 100) return;
        localStorage.setItem(BUDGET_KEY, String(n));
        renderCost(d);
      });
    }
    const ratio = Math.min(1, u.estimated_usd / budget);
    strip.classList.toggle('near', ratio >= .8 && ratio < 1);
    strip.classList.toggle('hit', ratio >= 1);
    const value = strip.querySelector('#hcValue');
    const bar = strip.querySelector('#hcBar');
    const btn = strip.querySelector('#hcLimit');
    if (value) value.textContent = `${u.checks} Checks · ${money(u.estimated_usd)} / $${budget.toFixed(2)}`;
    if (bar) bar.style.width = `${Math.round(ratio*100)}%`;
    if (btn) btn.textContent = `Limit $${budget.toFixed(2)}`;
  }

  function installFetchMeter(w,d){
    if (w.__mccHerrmannMeterInstalled) return;
    w.__mccHerrmannMeterInstalled = true;
    const rawFetch = w.fetch.bind(w);
    w.fetch = async (input, init = {}) => {
      const url = typeof input === 'string' ? input : String(input?.url || '');
      const method = String(init?.method || input?.method || 'GET').toUpperCase();
      const isHerrmann = method === 'POST' && url.includes('/api/herrmann');
      if (isHerrmann) {
        const u = readUsage();
        const budget = readBudget();
        if (u.estimated_usd >= budget) {
          return new w.Response(JSON.stringify({ error:`Herrmanns lokales Monatslimit von $${budget.toFixed(2)} ist erreicht. Unten im Herrmann-Feld kannst du es ändern.` }), {
            status:429,
            headers:{'Content-Type':'application/json; charset=utf-8'}
          });
        }
      }
      const res = await rawFetch(input, init);
      if (isHerrmann && res.ok) {
        res.clone().json().then(data => {
          const meta = data?._usage;
          if (!meta) return;
          const u = readUsage();
          u.checks += 1;
          u.estimated_usd += Number(meta.estimated_usd || 0);
          u.input_tokens += Number(meta.input_tokens || 0);
          u.output_tokens += Number(meta.output_tokens || 0);
          u.cached_input_tokens += Number(meta.cached_input_tokens || 0);
          saveUsage(u);
          renderCost(d);
        }).catch(()=>{});
      }
      return res;
    };
  }

  function setAutumn(d, persist = true){
    d.body.dataset.mood = 'autumn';
    const text = d.getElementById('moodText');
    const quote = d.getElementById('moodQuote');
    if (text) text.textContent = 'Herbstmodus. Warm, ruhig, ein bisschen knusprig.';
    if (quote) quote.textContent = 'Herrmann raschelt professionell durchs Backlog.';
    [...d.querySelectorAll('.mood-btn')].forEach(btn => {
      const active = btn.dataset.mood === 'autumn';
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    if (persist) localStorage.setItem('mcc-mood','autumn');
    renderScene(d);
  }

  function decorateMoodButtons(d){
    const labels = { happy:'☀ Happy', okay:'✦ Okay', tired:'☾ Müde', sad:'☁ Traurig', chaos:'⚡ Chaos' };
    Object.entries(labels).forEach(([m,label]) => {
      const b = d.querySelector(`.mood-btn[data-mood="${m}"]`);
      if (b && b.textContent !== label) b.textContent = label;
    });
    const controls = d.getElementById('moodControls');
    if (controls && !controls.querySelector('[data-mood="autumn"]')) {
      const b = d.createElement('button');
      b.className = 'mood-btn';
      b.dataset.mood = 'autumn';
      b.textContent = '🍂 Herbst';
      b.addEventListener('click', () => setAutumn(d));
      controls.appendChild(b);
    }
  }

  function install(){
    const d = frame.contentDocument;
    const w = frame.contentWindow;
    if (!d?.body || !w) return;
    ensureStyles(d);
    decorateMoodButtons(d);
    installFetchMeter(w,d);
    renderCost(d);

    if (localStorage.getItem('mcc-mood') === 'autumn') setAutumn(d,false);
    else renderScene(d);

    const observer = new MutationObserver((mutations) => {
      if (mutations.some(m => m.type === 'attributes' && m.attributeName === 'data-mood')) renderScene(d);
    });
    observer.observe(d.body,{attributes:true,attributeFilter:['data-mood']});
  }

  frame.addEventListener('load', () => setTimeout(install,120));
  if (frame.contentDocument?.readyState === 'complete') setTimeout(install,120);
})();
