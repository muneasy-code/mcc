document.write('<script src="/preview-v07-core.js"><\/script>');

try {
  if (!localStorage.getItem('mcc-cloud-partial-recovery-v1')) {
    localStorage.removeItem('mcc-inventory-v07');
    localStorage.setItem('mcc-cloud-partial-recovery-v1', '1');
  }
} catch {}

document.write('<script type="module" src="/mcc-supabase-preview.js"><\/script>');
document.write('<script type="module" src="/mcc-otp-preview.js"><\/script>');

(() => {
  document.title = 'MCC · muneasy Control Center';

  const ensureLink = (rel, href, extra = {}) => {
    let node = document.head.querySelector(`link[rel="${rel}"][href="${href}"]`);
    if (!node) {
      node = document.createElement('link');
      node.rel = rel;
      node.href = href;
      Object.entries(extra).forEach(([key, value]) => node.setAttribute(key, value));
      document.head.appendChild(node);
    }
    return node;
  };

  ensureLink('manifest', '/manifest.webmanifest');
  ensureLink('icon', '/pwa-512-v4.png', { type:'image/png' });
  ensureLink('apple-touch-icon', '/pwa-512-v4.png');

  const addMeta = (name, content) => {
    if (document.head.querySelector(`meta[name="${name}"]`)) return;
    const meta = document.createElement('meta');
    meta.name = name;
    meta.content = content;
    document.head.appendChild(meta);
  };
  addMeta('mobile-web-app-capable', 'yes');
  addMeta('apple-mobile-web-app-capable', 'yes');
  addMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
  addMeta('apple-mobile-web-app-title', 'MCC');

  const logoPreload = new Image();
  logoPreload.decoding = 'async';
  logoPreload.src = '/pwa-512-v4.png';

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(err => {
        console.warn('[MCC PWA] service worker registration failed', err);
      });
    }, { once: true });
  }
})();

(() => {
  const frame = document.getElementById('mcc');
  if (!frame) return;
  const applyPngLogo = () => {
    const d = frame.contentDocument;
    if (!d?.head) return;
    let style = d.getElementById('mcc-official-png-logo');
    if (!style) {
      style = d.createElement('style');
      style.id = 'mcc-official-png-logo';
      d.head.appendChild(style);
    }
    style.textContent = `
      .brand:before,
      .mcc-login-logo {
        background-image:url('/pwa-512-v4.png')!important;
        background-position:center!important;
        background-repeat:no-repeat!important;
        background-size:contain!important;
      }
      .mcc-login-logo {
        width:72px!important;
        height:72px!important;
        min-width:72px!important;
        min-height:72px!important;
        aspect-ratio:1/1!important;
        display:block!important;
      }
    `;
  };
  frame.addEventListener('load', applyPngLogo);
  if (frame.contentDocument?.readyState === 'complete') applyPngLogo();
  setTimeout(applyPngLogo, 300);
  setTimeout(applyPngLogo, 1000);
})();

setTimeout(() => {
  const frame = document.getElementById('mcc');
  if (!frame || window.__mccPreviewReplayDone) return;
  const ready = frame.contentDocument?.readyState === 'complete';
  const apiReady = Boolean(frame.contentWindow?.MCCV07API);
  if (ready && !apiReady) {
    window.__mccPreviewReplayDone = true;
    frame.dispatchEvent(new Event('load'));
  }
}, 250);

if (!location.hostname.startsWith('preview--')) {
  let attempts = 0;
  const productionLinkTimer = setInterval(() => {
    attempts += 1;
    const frame = document.getElementById('mcc');
    const api = frame?.contentWindow?.MCCV07API;
    if (!api) {
      if (attempts > 40) clearInterval(productionLinkTimer);
      return;
    }
    const project = api.getProjects?.().find(p => /control center|^mcc$/i.test(String(p?.name || '')));
    if (project && project.directUrl !== `${location.origin}/`) {
      project.directUrl = `${location.origin}/`;
      api.refresh?.();
    }
    clearInterval(productionLinkTimer);
  }, 250);
}
