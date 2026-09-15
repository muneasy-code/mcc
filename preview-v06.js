document.write('<script src="/preview-v07-core.js"><\/script>');
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
