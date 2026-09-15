document.write('<script src="/preview-v07-core.js"><\/script>');

// One-time recovery for the interrupted first cloud import: re-run the V0.7 inventory merge
// before MCC Cloud decides whether local or server data is authoritative.
try {
  if (!localStorage.getItem('mcc-cloud-partial-recovery-v1')) {
    localStorage.removeItem('mcc-inventory-v07');
    localStorage.setItem('mcc-cloud-partial-recovery-v1', '1');
  }
} catch {}

document.write('<script type="module" src="/mcc-supabase-preview.js"><\/script>');
document.write('<script type="module" src="/mcc-otp-preview.js"><\/script>');

// PWA shell. App code itself is deliberately not cached by the service worker,
// so a new deploy becomes visible immediately instead of getting stuck behind an old PWA cache.
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
  ensureLink('apple-touch-icon', '/pwa-192.png');

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

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(err => {
        console.warn('[MCC PWA] service worker registration failed', err);
      });
    }, { once: true });
  }
})();

// Mobile/cache hits can finish the iframe before preview-v07-core attaches its load listener.
// Replay once only when MCCV07API is still missing, otherwise the first cloud import cannot start.
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

// On production, MCC's own direct link must point back to production, not the preview branch.
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
