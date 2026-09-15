import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_EMAIL = 'muniselehmann@gmail.com';
const REDIRECT_URL = `${window.location.origin}/preview-shell.html`;
let guardClient = null;
let mounted = false;

async function getClient(){
  if (guardClient) return guardClient;
  const res = await fetch('/api/mcc-config', { cache:'no-store' });
  if (!res.ok) throw new Error('MCC Cloud-Konfiguration fehlt.');
  const cfg = await res.json();
  guardClient = createClient(cfg.supabaseUrl, cfg.publishableKey, {
    auth: { persistSession:true, autoRefreshToken:true, detectSessionInUrl:true, storage:window.localStorage }
  });
  const { data } = await guardClient.auth.getSession();
  const activeEmail = data?.session?.user?.email?.toLowerCase() || '';
  if (activeEmail && activeEmail !== ALLOWED_EMAIL) {
    await guardClient.auth.signOut({ scope:'local' });
  }
  return guardClient;
}

function findDoc(){
  return document.getElementById('mcc')?.contentDocument || null;
}

async function mount(){
  if (mounted) return;
  const d = findDoc();
  if (!d) return;
  const form = d.getElementById('mccMagicForm');
  const input = d.getElementById('mccMagicEmail');
  const btn = d.getElementById('mccMagicSend');
  const state = d.getElementById('mccMagicState');
  if (!form || !input || !btn || !state) return;

  mounted = true;
  input.value = ALLOWED_EMAIL;
  input.readOnly = true;
  input.autocomplete = 'username';
  input.title = 'MCC ist auf dieses Konto beschränkt.';
  btn.textContent = 'Sicheren Magic Link senden';

  const hint = d.createElement('p');
  hint.className = 'mcc-login-state';
  hint.style.marginTop = '8px';
  hint.textContent = 'Privater Einzelzugang · andere Konten haben keinen MCC-Datenzugriff.';
  form.appendChild(hint);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    btn.disabled = true;
    btn.textContent = 'Wird gesendet …';
    state.className = 'mcc-login-state';
    state.textContent = '';
    try {
      const client = await getClient();
      const { error } = await client.auth.signInWithOtp({
        email: ALLOWED_EMAIL,
        options: { shouldCreateUser:false, emailRedirectTo:REDIRECT_URL }
      });
      if (error) throw error;
      state.className = 'mcc-login-state ok';
      state.textContent = 'Mail ist raus ✓ Nur das vorhandene MCC-Konto darf sich anmelden.';
    } catch (err) {
      state.className = 'mcc-login-state error';
      state.textContent = err?.message || 'Login konnte nicht gestartet werden.';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Sicheren Magic Link senden';
    }
  }, true);
}

setInterval(mount, 180);
window.addEventListener('pageshow', mount);
