document.write('<script src="/preview-v07-core.js"><\/script>');
document.write('<script type="module" src="/mcc-supabase-preview.js"><\/script>');

// The iframe can finish loading before the preview enhancement scripts attach
// their load listeners (especially on mobile/cache hits). In that case V0.7
// never mounts, MCCV07API is missing and the cloud import cannot start.
// Replay the iframe load event once, only when needed.
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
