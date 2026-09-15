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
