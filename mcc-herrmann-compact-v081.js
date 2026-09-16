// MCC v0.8.1 · compact collapsible Pixel Herrmann
(() => {
  const frame = document.getElementById('mcc');
  if (!frame) return;

  const OPEN_KEY = 'mcc-herrmann-open';
  const moodLabels = {
    happy:'☀ Happy', okay:'✦ Okay', tired:'☾ Müde', sad:'☁ Traurig', chaos:'⚡ Chaos', autumn:'🍂 Herbst'
  };

  function install(){
    const d = frame.contentDocument;
    if (!d?.body) return;
    const pod = d.getElementById('moodPod');
    if (!pod || pod.dataset.compactReady === '1') return;
    pod.dataset.compactReady = '1';

    let style = d.getElementById('mcc-herrmann-compact-style');
    if (!style) {
      style = d.createElement('style');
      style.id = 'mcc-herrmann-compact-style';
      style.textContent = `
        .mood-pod{transition:width .25s ease,border-radius .25s ease,transform .25s ease,background .25s ease!important}
        .mcc-herrmann-toggle{position:absolute;top:10px;right:10px;z-index:5;width:30px;height:30px;border-radius:10px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.035);color:#b8bfce;display:grid;place-items:center;font-size:14px;line-height:1;padding:0}
        .mcc-herrmann-toggle:hover{color:#fff;border-color:rgba(255,255,255,.18)}
        .mcc-herrmann-mini-copy{display:none;min-width:0;align-self:center;padding-right:34px}
        .mcc-herrmann-mini-copy strong{display:block;font-size:11px;letter-spacing:.10em;text-transform:uppercase;color:#dce2eb;white-space:nowrap}
        .mcc-herrmann-mini-copy span{display:block;margin-top:3px;font-size:10px;color:#8d95a5;white-space:nowrap}
        .mood-pod.mcc-herrmann-collapsed{width:226px!important;border-radius:18px!important}
        .mood-pod.mcc-herrmann-collapsed .mood-top{padding:8px 9px!important;gap:9px!important;align-items:center!important}
        .mood-pod.mcc-herrmann-collapsed .pixel-wrap{width:46px!important;height:46px!important;border-radius:13px!important}
        .mood-pod.mcc-herrmann-collapsed .pixel-wrap svg{width:34px!important;height:34px!important}
        .mood-pod.mcc-herrmann-collapsed .mood-copy,
        .mood-pod.mcc-herrmann-collapsed .mood-controls,
        .mood-pod.mcc-herrmann-collapsed .sarg-banner,
        .mood-pod.mcc-herrmann-collapsed .herrmann-cost-strip{display:none!important}
        .mood-pod.mcc-herrmann-collapsed .mcc-herrmann-mini-copy{display:block!important}
        .mood-pod.mcc-herrmann-collapsed .mcc-herrmann-toggle{top:16px;right:11px;width:28px;height:28px}
        @media(max-width:640px){
          .mood-pod.mcc-herrmann-collapsed{left:auto!important;right:8px!important;bottom:calc(8px + env(safe-area-inset-bottom))!important;width:218px!important}
          .mood-pod:not(.mcc-herrmann-collapsed){left:7px!important;right:7px!important;width:auto!important}
        }
      `;
      d.head.appendChild(style);
    }

    const top = pod.querySelector('.mood-top');
    if (!top) return;

    const mini = d.createElement('div');
    mini.className = 'mcc-herrmann-mini-copy';
    mini.innerHTML = `<strong>Pixel Herrmann</strong><span id="mccHerrmannMiniMood"></span>`;
    top.appendChild(mini);

    const toggle = d.createElement('button');
    toggle.type = 'button';
    toggle.className = 'mcc-herrmann-toggle';
    toggle.setAttribute('aria-label','Pixel Herrmann ein- oder ausklappen');
    pod.appendChild(toggle);

    const updateMood = () => {
      const mood = d.body.dataset.mood || 'okay';
      const label = d.getElementById('mccHerrmannMiniMood');
      if (label) label.textContent = moodLabels[mood] || moodLabels.okay;
    };

    const setOpen = (open, persist = true) => {
      pod.classList.toggle('mcc-herrmann-collapsed', !open);
      toggle.textContent = open ? '⌄' : '⌃';
      toggle.title = open ? 'Herrmann einklappen' : 'Herrmann aufklappen';
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (persist) localStorage.setItem(OPEN_KEY, open ? '1' : '0');
    };

    const saved = localStorage.getItem(OPEN_KEY);
    setOpen(saved === '1', false);
    updateMood();

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      setOpen(pod.classList.contains('mcc-herrmann-collapsed'));
    });

    pod.addEventListener('dblclick', () => {
      if (pod.classList.contains('mcc-herrmann-collapsed')) setOpen(true);
    });

    const observer = new MutationObserver(updateMood);
    observer.observe(d.body,{attributes:true,attributeFilter:['data-mood']});
  }

  frame.addEventListener('load', () => setTimeout(install,180));
  if (frame.contentDocument?.readyState === 'complete') setTimeout(install,180);
  setTimeout(install,700);
})();
