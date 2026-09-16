import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const frame = document.getElementById('mcc');
let client = null;
let observer = null;
let patchTimer = null;

async function getClient(){
  if (client) return client;
  const res = await fetch('/api/mcc-config', { cache:'no-store' });
  if (!res.ok) throw new Error('MCC Cloud-Konfiguration fehlt.');
  const cfg = await res.json();
  if (!cfg?.supabaseUrl || !cfg?.publishableKey) throw new Error('MCC Cloud-Konfiguration unvollständig.');
  client = createClient(cfg.supabaseUrl, cfg.publishableKey, {
    auth:{ persistSession:true, autoRefreshToken:true, detectSessionInUrl:true }
  });
  return client;
}

function stateText(el, text, cls=''){
  if (!el) return;
  el.className = `mcc-login-state ${cls}`.trim();
  el.textContent = text;
}

async function patchGate(){
  const d = frame?.contentDocument;
  if (!d) return;
  const gate = d.getElementById('mccCloudGate');
  if (!gate || gate.dataset.otpUi === '1') return;

  const supabase = await getClient();
  const { data } = await supabase.auth.getSession();
  if (data?.session) {
    gate.hidden = true;
    return;
  }

  const card = gate.querySelector('.mcc-login-card');
  if (!card) return;
  gate.dataset.otpUi = '1';
  card.innerHTML = `
    <div class="mcc-login-logo" aria-hidden="true"></div>
    <div class="eyebrow">MCC CLOUD · PRIVATE</div>
    <h2>Nur dein Control Center.</h2>
    <p>Kein öffentlicher Account-Bereich. MCC verschickt nur an ein bereits vorhandenes Konto einen Einmalcode. Neue Benutzer werden hier niemals angelegt.</p>
    <form id="mccOtpSendForm">
      <input id="mccOtpEmail" type="email" autocomplete="email" inputmode="email" required placeholder="deine E-Mail-Adresse">
      <button id="mccOtpSend">Einmalcode senden</button>
    </form>
    <form id="mccOtpVerifyForm" hidden>
      <input id="mccOtpCode" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="10" pattern="[0-9]{6,10}" placeholder="Code" aria-label="Einmalcode mit 6 bis 10 Ziffern">
      <button id="mccOtpVerify">Code bestätigen</button>
    </form>
    <p id="mccOtpState" class="mcc-login-state">Die Sitzung bleibt anschließend auf diesem Gerät gespeichert.</p>
  `;

  const emailInput = card.querySelector('#mccOtpEmail');
  const sendForm = card.querySelector('#mccOtpSendForm');
  const sendBtn = card.querySelector('#mccOtpSend');
  const verifyForm = card.querySelector('#mccOtpVerifyForm');
  const codeInput = card.querySelector('#mccOtpCode');
  const verifyBtn = card.querySelector('#mccOtpVerify');
  const status = card.querySelector('#mccOtpState');

  const remembered = localStorage.getItem('mcc-login-email');
  if (remembered && emailInput) emailInput.value = remembered;

  sendForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput?.value?.trim();
    if (!email || !sendBtn) return;
    sendBtn.disabled = true;
    sendBtn.textContent = 'Wird gesendet …';
    stateText(status, 'Code wird angefordert …');
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options:{ shouldCreateUser:false }
      });
      if (error) throw error;
      localStorage.setItem('mcc-login-email', email);
      if (verifyForm) verifyForm.hidden = false;
      stateText(status, 'Code verschickt ✓ Bleib in diesem MCC-Fenster und gib hier den Code aus der Mail ein.', 'ok');
      codeInput?.focus();
    } catch (err) {
      console.error('[MCC OTP] send failed', err);
      const message = String(err?.message || '').toLowerCase();
      if (message.includes('rate') || message.includes('limit') || message.includes('too many')) {
        stateText(status, 'Zu viele Codes angefordert. Bitte kurz warten und dann erneut versuchen.', 'error');
      } else {
        stateText(status, 'Anmeldung nicht möglich. Nur das bereits freigeschaltete MCC-Konto kann einen Code erhalten.', 'error');
      }
    } finally {
      sendBtn.disabled = false;
      sendBtn.textContent = 'Code erneut senden';
    }
  });

  codeInput?.addEventListener('input', () => {
    codeInput.value = codeInput.value.replace(/\D/g,'').slice(0,10);
  });

  verifyForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput?.value?.trim();
    const token = codeInput?.value?.replace(/\D/g,'');
    if (!email || !token || token.length < 6 || token.length > 10 || !verifyBtn) {
      stateText(status, 'Bitte den Code vollständig eingeben (6 bis 10 Ziffern).', 'error');
      return;
    }
    verifyBtn.disabled = true;
    verifyBtn.textContent = 'Prüfe …';
    stateText(status, 'Code wird geprüft …');
    try {
      const { data:verified, error } = await supabase.auth.verifyOtp({ email, token, type:'email' });
      if (error || !verified?.session) throw error || new Error('Keine Sitzung erhalten');
      stateText(status, 'Willkommen zurück ✓ Sitzung gespeichert. MCC startet …', 'ok');
      setTimeout(() => {
        window.location.replace(`${window.location.origin}/preview-shell.html?auth=ok`);
      }, 250);
    } catch (err) {
      console.error('[MCC OTP] verify failed', err);
      stateText(status, 'Der Code ist ungültig oder abgelaufen. Bitte erneut versuchen.', 'error');
      verifyBtn.disabled = false;
      verifyBtn.textContent = 'Code bestätigen';
      codeInput?.select();
    }
  });
}

function attach(){
  const d = frame?.contentDocument;
  if (!d?.documentElement) return;
  observer?.disconnect();
  observer = new MutationObserver(() => { patchGate().catch(console.error); });
  observer.observe(d.documentElement, { childList:true, subtree:true });
  clearInterval(patchTimer);
  patchTimer = setInterval(() => { patchGate().catch(console.error); }, 700);
  patchGate().catch(console.error);
}

frame?.addEventListener('load', () => setTimeout(attach, 80));
if (frame?.contentDocument?.readyState === 'complete') setTimeout(attach, 80);

import '/mcc-moods-v08.js';
import '/mcc-herrmann-compact-v081.js';
