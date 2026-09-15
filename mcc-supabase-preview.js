import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const frame = document.getElementById('mcc');
const REDIRECT_URL = `${window.location.origin}/preview-shell.html`;
let supabase = null;
let session = null;
let frameReady = false;
let booting = false;
let syncing = false;
let queued = false;
let applyingServer = false;
let lastSnapshot = '';
let pollTimer = null;

const sourceCatalog = {
  'MCC · muneasy Control Center': { repo: 'muneasy-code/mcc', branch: 'preview', readme: 'README.txt', netlify: '1b762fb5-ca3b-4d97-90cb-1ef415b44370' },
  'ADM': { repo: 'muneasy-code/asadevicemanager', branch: 'main', readme: 'README.md', netlify: '84a3618c-40a8-4bc4-ad08-b3f156777bed' },
  'ProBeMo': { repo: 'muneasy-code/probemo', branch: 'main', readme: 'README.md', netlify: '6c2ad6cd-9d5e-477f-b193-d97e10ebfd6a' },
  'ProBe Website': { repo: 'muneasy-code/probe-website', branch: 'main', readme: 'README.md', netlify: '51f6e8ca-f237-4c3b-a6a7-ae13eae65cfb' },
  'SpencerHill Bambino Club': { repo: 'muneasy-code/spencerhill-bambino-club', branch: 'main', readme: 'README.md', netlify: '3bb54ff2-384c-42ae-813d-321c028ecc3d' },
  'AsA Monitoring Intelligence': { repo: 'muneasy-code/asa-monitoring-intelligence', branch: 'main', readme: 'README.md', netlify: 'a3a12d8a-c2a8-4dd5-9167-d09fb5d7ebd9' },
  'MOON': { repo: 'muneasy-code/walkthemoon', branch: 'main', readme: 'README.md', netlify: 'e94875bb-ac1f-4da2-a7bf-642b4cb31c25' },
  'muneasy 2.0': { repo: 'muneasy-code/muneasyde', branch: 'main', readme: 'README.md', netlify: 'a9c712e3-f0c1-4751-b140-dc80db9b9414' },
  'muneasy Calendar': { repo: 'muneasy-code/muneasycalendar', branch: 'main', readme: 'README.md', netlify: '494d75b6-ee3a-4739-9cf4-2a13ff548e46' },
  'SCM Ticket Radar': { repo: 'muneasy-code/scm-ticket-radar', branch: 'main', readme: 'README.md', netlify: '3b910dc9-6182-4ea8-b53e-d6f1d9a89edc' },
  'SpencerHill 2027': { netlify: '615c62fb-a742-4b64-976c-33b86c2917a8' },
  'AsA Startklar': { netlify: 'b76fc5b3-fe88-412c-8eb3-7f814e7a209d' },
  'AsA Delivery Planner': { netlify: '4b07dafc-6fe4-47e2-8dbe-6ec0c4f812e1' },
  'muneasy Booking': { netlify: '81702dc4-a3a1-4480-af18-11dd2f1e0189' },
  'muneasy Finance': { netlify: '77f22e1c-8fe5-4718-a935-e3f43e2a5b89' },
  'muneasy Analytics': { netlify: '7a03559a-6a25-4cdd-9f52-3ffc748f4c6a' },
  'muneasy Monitor': { netlify: '037fc74f-539d-4fa5-b41f-e4a3d2df4516' },
  'AOK PH Viewer': { netlify: '76a4a7e9-828f-45ac-9a63-5d722f5bfd34' },
  'Vier Fäuste für ein Festival': { netlify: '089b1a86-5634-4cd0-bcb1-9d296de28789' },
  'Blissful Yoga MD': { netlify: 'e273f1fb-3ea9-4c0c-965d-75c9d3c81cf6' },
  'Werkzettel': { netlify: '83521c87-f8de-46c2-82fc-f4a6e0136502' },
  'DRK Hub ST': { netlify: 'ff8e98e1-4d08-41e1-89b0-f99df7601d11' }
};

function api(){ return frame?.contentWindow?.MCCV07API || null; }
function doc(){ return frame?.contentDocument || null; }
function slugify(value){
  return String(value || 'projekt').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,72) || 'projekt';
}
function iso(value){
  const d = new Date(value || Date.now());
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}
function snapshot(){
  try { return JSON.stringify(api()?.getProjects() || []); } catch { return ''; }
}
function rowFromProject(p, ownerId, sortOrder){
  return {
    owner_id: ownerId,
    name: p.name || 'Projekt',
    slug: p.dbSlug || slugify(p.name),
    type: p.type || 'own',
    status: p.status || 'Planung',
    priority: p.priority || 'Danach',
    progress: Math.max(0, Math.min(100, Number(p.progress) || 0)),
    description: p.desc || '',
    next_step: p.next || '',
    source: p.source || '',
    direct_url: p.directUrl || '',
    notes: p.notes || '',
    grad: p.grad || '',
    tint: p.tint || '',
    auto_sync: p.autoSync !== false,
    sort_order: sortOrder,
    last_activity_at: p.lastActivityAt ? iso(p.lastActivityAt) : null,
    deleted_at: null
  };
}

async function initClient(){
  const res = await fetch('/api/mcc-config', { cache:'no-store' });
  if (!res.ok) throw new Error('MCC Cloud-Konfiguration fehlt.');
  const cfg = await res.json();
  if (!cfg?.supabaseUrl || !cfg?.publishableKey) throw new Error('MCC Cloud-Konfiguration unvollständig.');
  supabase = createClient(cfg.supabaseUrl, cfg.publishableKey, {
    auth: { persistSession:true, autoRefreshToken:true, detectSessionInUrl:true }
  });
  supabase.auth.onAuthStateChange((event, nextSession) => {
    session = nextSession;
    if (!frameReady) return;
    if (session) {
      showGate(false);
      setTimeout(bootSignedIn, 0);
    } else {
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = null;
      showGate(true);
      setCloudState('', 'Cloud', 'Nicht angemeldet');
    }
  });
}

function injectUi(){
  const d = doc();
  if (!d || d.getElementById('mccCloudStyles')) return;
  const style = d.createElement('style');
  style.id = 'mccCloudStyles';
  style.textContent = `
    .mcc-cloud-gate{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:20px;background:radial-gradient(circle at 18% 10%,rgba(216,101,255,.18),transparent 32rem),radial-gradient(circle at 82% 12%,rgba(99,215,255,.15),transparent 30rem),rgba(5,6,10,.96);backdrop-filter:blur(24px)}
    .mcc-cloud-gate[hidden]{display:none!important}.mcc-login-card{width:min(430px,100%);border:1px solid rgba(255,255,255,.11);border-radius:26px;padding:24px;background:linear-gradient(180deg,rgba(20,23,32,.98),rgba(12,14,20,.98));box-shadow:0 35px 120px rgba(0,0,0,.5)}
    .mcc-login-logo{width:52px;height:52px;background:url('/muneasy-logo.svg') center/contain no-repeat;margin-bottom:18px}.mcc-login-card h2{margin:4px 0 8px;font-size:25px;letter-spacing:-.035em}.mcc-login-card p{margin:0 0 17px;color:#9ca3b3;font-size:12px;line-height:1.55}
    .mcc-login-card input{width:100%;height:46px;border:1px solid rgba(255,255,255,.10);border-radius:13px;background:#0c0f15;color:#fff;padding:0 13px;font-size:16px;outline:none}.mcc-login-card input:focus{border-color:rgba(182,108,255,.5);box-shadow:0 0 0 4px rgba(182,108,255,.08)}
    .mcc-login-card button{width:100%;height:46px;border:0;border-radius:13px;margin-top:9px;background:linear-gradient(135deg,#ff8d74,#d865ff 48%,#63d7ff);color:#08090d;font-weight:900}.mcc-login-state{min-height:18px;margin-top:10px!important;margin-bottom:0!important;font-size:10px!important;color:#8e95a5!important}.mcc-login-state.error{color:#ff91a0!important}.mcc-login-state.ok{color:#7ee6ad!important}
    .mcc-cloud-chip{border:1px solid rgba(255,255,255,.09);height:38px;min-width:38px;padding:0 10px;border-radius:12px;background:#141820;color:#aeb5c4;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;gap:6px}.mcc-cloud-chip[data-state='syncing']{color:#8ddfff}.mcc-cloud-chip[data-state='ok']{color:#7ee6ad}.mcc-cloud-chip[data-state='error']{color:#ff91a0}.mcc-cloud-dot{width:6px;height:6px;border-radius:50%;background:currentColor;box-shadow:0 0 10px currentColor}
    @media(max-width:640px){.mcc-login-card{padding:20px;border-radius:22px}.mcc-login-card h2{font-size:22px}.mcc-cloud-chip{width:38px;padding:0;font-size:0}.mcc-cloud-chip:after{content:'☁';font-size:15px}.mcc-cloud-chip .mcc-cloud-dot{display:none}}
  `;
  d.head.appendChild(style);

  const gate = d.createElement('div');
  gate.id = 'mccCloudGate';
  gate.className = 'mcc-cloud-gate';
  gate.innerHTML = `<div class="mcc-login-card">
    <div class="mcc-login-logo" aria-hidden="true"></div>
    <div class="eyebrow">MCC CLOUD</div>
    <h2>Dein Control Center.</h2>
    <p>Ein Login, ein Stand auf Handy, Tablet und PC. Beim ersten Login übernimmt MCC automatisch deine bisherigen lokalen Projekte.</p>
    <form id="mccMagicForm">
      <input id="mccMagicEmail" type="email" autocomplete="email" inputmode="email" required placeholder="deine E-Mail-Adresse">
      <button id="mccMagicSend">Magic Link senden</button>
    </form>
    <p id="mccMagicState" class="mcc-login-state"></p>
  </div>`;
  d.body.appendChild(gate);

  gate.querySelector('#mccMagicForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = gate.querySelector('#mccMagicEmail')?.value?.trim();
    const state = gate.querySelector('#mccMagicState');
    const btn = gate.querySelector('#mccMagicSend');
    if (!email || !state || !btn || !supabase) return;
    btn.disabled = true;
    btn.textContent = 'Wird gesendet …';
    state.className = 'mcc-login-state';
    state.textContent = '';
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser:true, emailRedirectTo:REDIRECT_URL }
    });
    btn.disabled = false;
    btn.textContent = 'Magic Link senden';
    if (error) {
      state.className = 'mcc-login-state error';
      state.textContent = error.message;
      return;
    }
    localStorage.setItem('mcc-login-email', email);
    state.className = 'mcc-login-state ok';
    state.textContent = 'Mail ist raus ✓ Link öffnen – danach landest du wieder im MCC.';
  });

  const remembered = localStorage.getItem('mcc-login-email');
  if (remembered) gate.querySelector('#mccMagicEmail').value = remembered;

  const actions = d.querySelector('.top-actions');
  if (actions && !d.getElementById('mccCloudChip')) {
    const chip = d.createElement('button');
    chip.type = 'button';
    chip.id = 'mccCloudChip';
    chip.className = 'mcc-cloud-chip';
    chip.innerHTML = '<span class="mcc-cloud-dot"></span><span class="mcc-cloud-label">Cloud</span>';
    chip.addEventListener('click', async () => {
      if (!session) return showGate(true);
      const mail = session.user?.email || 'MCC';
      if (frame.contentWindow.confirm(`${mail}\n\nVon MCC Cloud abmelden?`)) await supabase.auth.signOut();
    });
    actions.insertBefore(chip, d.getElementById('newProject'));
  }
}

function setCloudState(state, label, title){
  const chip = doc()?.getElementById('mccCloudChip');
  if (!chip) return;
  chip.dataset.state = state;
  const text = chip.querySelector('.mcc-cloud-label');
  if (text) text.textContent = label || 'Cloud';
  chip.title = title || label || 'MCC Cloud';
}
function showGate(show){
  const gate = doc()?.getElementById('mccCloudGate');
  if (gate) gate.hidden = !show;
}

async function ensureProfile(){
  if (!session?.user?.id) return;
  await supabase.from('mcc_profiles').upsert({ user_id:session.user.id }, { onConflict:'user_id' });
}

async function loadRows(ownerId){
  const { data:projects, error:pError } = await supabase.from('mcc_projects').select('*')
    .eq('owner_id',ownerId).is('deleted_at',null).order('sort_order',{ascending:true});
  if (pError) throw pError;
  if (!projects?.length) return { projects:[], items:[], links:[] };
  const ids = projects.map(p => p.id);
  const [itemsRes, linksRes] = await Promise.all([
    supabase.from('mcc_project_items').select('*').eq('owner_id',ownerId).in('project_id',ids),
    supabase.from('mcc_project_links').select('*').eq('owner_id',ownerId).in('project_id',ids).order('sort_order',{ascending:true})
  ]);
  if (itemsRes.error) throw itemsRes.error;
  if (linksRes.error) throw linksRes.error;
  return { projects, items:itemsRes.data || [], links:linksRes.data || [] };
}

function mapProject(row, items, links){
  return {
    dbId:row.id, dbSlug:row.slug, name:row.name, type:row.type, status:row.status, priority:row.priority,
    progress:row.progress, desc:row.description || '', next:row.next_step || '', source:row.source || '',
    directUrl:row.direct_url || '', notes:row.notes || '', grad:row.grad || undefined, tint:row.tint || undefined,
    autoSync:row.auto_sync !== false, lastActivityAt:row.last_activity_at || null,
    items:items.filter(x => x.project_id === row.id).sort((a,b) => new Date(a.created_at)-new Date(b.created_at)).map(x => ({
      dbId:x.id, text:x.text, type:x.kind, stage:x.stage, created:new Date(x.created_at).getTime(), completedAt:x.completed_at,
      autoMatched:x.auto_matched, confidence:x.confidence, sourceKind:x.source_kind, sourceRepo:x.source_repo,
      sourceBranch:x.source_branch, sourceRef:x.source_ref, sourceUrl:x.source_url,
      aiReview:x.meta?.aiReview, aiError:x.meta?.aiError || ''
    })),
    links:links.filter(x => x.project_id === row.id).map(x => ({
      dbId:x.id, label:x.label, url:x.url, kind:x.kind, isPrimary:x.is_primary
    }))
  };
}

async function syncSource(p, projectId, ownerId){
  const cfg = sourceCatalog[p.name];
  if (!cfg) return;
  const sources = [];
  if (cfg.repo) sources.push({
    owner_id:ownerId, project_id:projectId, provider:'github', source_key:`github:${cfg.repo}:${cfg.branch || 'main'}`,
    repo_full_name:cfg.repo, branch:cfg.branch || 'main', readme_path:cfg.readme || 'README.md', enabled:true,
    metadata:{ project_name:p.name }
  });
  if (cfg.netlify) sources.push({
    owner_id:ownerId, project_id:projectId, provider:'netlify', source_key:`netlify:${cfg.netlify}`,
    netlify_site_id:cfg.netlify, enabled:true, metadata:{ project_name:p.name }
  });
  for (const source of sources) {
    const { data:existing, error:findError } = await supabase.from('mcc_sync_sources').select('id')
      .eq('owner_id',ownerId).eq('source_key',source.source_key).maybeSingle();
    if (findError) throw findError;
    if (existing?.id) {
      const { error } = await supabase.from('mcc_sync_sources').update(source).eq('id',existing.id).eq('owner_id',ownerId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('mcc_sync_sources').insert(source);
      if (error) throw error;
    }
  }
}

async function syncLocal(reason='MCC geändert'){
  if (!session?.user?.id || applyingServer) return;
  if (syncing) { queued = true; return; }
  const a = api();
  if (!a) return;
  syncing = true;
  queued = false;
  setCloudState('syncing','Sync …',reason);
  try {
    const ownerId = session.user.id;
    const localProjects = a.getProjects();
    const { data:existingProjects, error:existingError } = await supabase.from('mcc_projects').select('id,slug,deleted_at').eq('owner_id',ownerId);
    if (existingError) throw existingError;
    const existing = existingProjects || [];
    const liveIds = new Set();

    for (let index=0; index<localProjects.length; index++) {
      const p = localProjects[index];
      p.items = Array.isArray(p.items) ? p.items : [];
      p.links = Array.isArray(p.links) ? p.links : [];
      p.dbSlug = p.dbSlug || slugify(p.name);
      const row = rowFromProject(p, ownerId, index);
      let dbId = p.dbId || existing.find(x => x.slug === p.dbSlug)?.id || null;
      let saved;
      if (dbId) {
        const res = await supabase.from('mcc_projects').update(row).eq('id',dbId).eq('owner_id',ownerId).select('*').single();
        if (res.error) throw res.error;
        saved = res.data;
      } else {
        const res = await supabase.from('mcc_projects').insert(row).select('*').single();
        if (res.error) throw res.error;
        saved = res.data;
      }
      p.dbId = saved.id;
      p.dbSlug = saved.slug;
      liveIds.add(saved.id);

      const itemExisting = await supabase.from('mcc_project_items').select('id').eq('owner_id',ownerId).eq('project_id',saved.id);
      if (itemExisting.error) throw itemExisting.error;
      const oldItemIds = new Set((itemExisting.data || []).map(x => x.id));
      const newItemIds = new Set();
      const itemRows = p.items.map(item => {
        item.dbId = item.dbId || crypto.randomUUID();
        newItemIds.add(item.dbId);
        return {
          id:item.dbId, owner_id:ownerId, project_id:saved.id, text:item.text || '', kind:item.type || 'idea',
          stage:item.stage || (item.type === 'feature' ? 'backlog' : 'inbox'), created_at:iso(item.created || Date.now()),
          completed_at:item.completedAt ? iso(item.completedAt) : (item.type === 'implemented' ? iso(item.created || Date.now()) : null),
          auto_matched:Boolean(item.autoMatched), confidence:item.confidence ?? null, source_kind:item.sourceKind || 'manual',
          source_repo:item.sourceRepo || null, source_branch:item.sourceBranch || null, source_ref:item.sourceRef || null,
          source_url:item.sourceUrl || null, meta:{ aiReview:item.aiReview || null, aiError:item.aiError || '' }
        };
      });
      if (itemRows.length) {
        const res = await supabase.from('mcc_project_items').upsert(itemRows,{onConflict:'id'});
        if (res.error) throw res.error;
      }
      for (const id of oldItemIds) if (!newItemIds.has(id)) {
        const res = await supabase.from('mcc_project_items').delete().eq('id',id).eq('owner_id',ownerId);
        if (res.error) throw res.error;
      }

      const linkExisting = await supabase.from('mcc_project_links').select('id').eq('owner_id',ownerId).eq('project_id',saved.id);
      if (linkExisting.error) throw linkExisting.error;
      const oldLinkIds = new Set((linkExisting.data || []).map(x => x.id));
      const newLinkIds = new Set();
      const linkRows = p.links.filter(x => x.url).map((lnk, sortOrder) => {
        lnk.dbId = lnk.dbId || crypto.randomUUID();
        newLinkIds.add(lnk.dbId);
        return { id:lnk.dbId, owner_id:ownerId, project_id:saved.id, label:lnk.label || 'Link', url:lnk.url, kind:lnk.kind || 'link', is_primary:Boolean(lnk.isPrimary), sort_order:sortOrder };
      });
      if (linkRows.length) {
        const res = await supabase.from('mcc_project_links').upsert(linkRows,{onConflict:'id'});
        if (res.error) throw res.error;
      }
      for (const id of oldLinkIds) if (!newLinkIds.has(id)) {
        const res = await supabase.from('mcc_project_links').delete().eq('id',id).eq('owner_id',ownerId);
        if (res.error) throw res.error;
      }

      await syncSource(p, saved.id, ownerId);
    }

    for (const serverProject of existing) {
      if (!serverProject.deleted_at && !liveIds.has(serverProject.id)) {
        const res = await supabase.from('mcc_projects').update({deleted_at:new Date().toISOString()}).eq('id',serverProject.id).eq('owner_id',ownerId);
        if (res.error) throw res.error;
      }
    }

    applyingServer = true;
    a.refresh();
    applyingServer = false;
    lastSnapshot = snapshot();
    setCloudState('ok','Cloud ✓',`Gespeichert · ${session.user.email || ''}`);
  } catch (error) {
    console.error('[MCC Cloud] sync failed', error);
    setCloudState('error','Sync-Fehler',error?.message || 'Synchronisierung fehlgeschlagen');
  } finally {
    syncing = false;
    if (queued) setTimeout(() => syncLocal('nachgelagerte Änderung'),150);
  }
}

function watchChanges(){
  if (pollTimer) clearInterval(pollTimer);
  lastSnapshot = snapshot();
  pollTimer = setInterval(() => {
    if (!session || applyingServer || syncing) return;
    const now = snapshot();
    if (now && now !== lastSnapshot) {
      lastSnapshot = now;
      clearTimeout(window.__mccCloudDebounce);
      window.__mccCloudDebounce = setTimeout(() => syncLocal(),700);
    }
  },1200);
}

async function bootSignedIn(){
  if (booting || !frameReady || !session || !supabase) return;
  const a = api();
  if (!a) { setTimeout(bootSignedIn,80); return; }
  booting = true;
  try {
    injectUi();
    showGate(false);
    setCloudState('syncing','Laden …','MCC Cloud lädt');
    await ensureProfile();
    const rows = await loadRows(session.user.id);
    if (rows.projects.length) {
      applyingServer = true;
      const mapped = rows.projects.map(p => mapProject(p,rows.items,rows.links));
      const local = a.getProjects();
      local.splice(0,local.length,...mapped);
      a.refresh();
      applyingServer = false;
      lastSnapshot = snapshot();
      setCloudState('ok','Cloud ✓',`Synchronisiert · ${session.user.email || ''}`);
    } else {
      await syncLocal('Erstimport vom Gerät');
    }
    watchChanges();
  } catch (error) {
    console.error('[MCC Cloud] boot failed', error);
    setCloudState('error','Cloud-Fehler',error?.message || 'MCC Cloud konnte nicht geladen werden');
    showGate(false);
  } finally {
    booting = false;
  }
}

async function boot(){
  if (!frameReady || !supabase) return;
  injectUi();
  const { data, error } = await supabase.auth.getSession();
  if (error) console.warn('[MCC Cloud] session',error);
  session = data?.session || null;
  if (session) await bootSignedIn();
  else {
    showGate(true);
    setCloudState('','Cloud','Nicht angemeldet');
  }
}

frame.addEventListener('load',() => {
  frameReady = true;
  setTimeout(boot,120);
});

(async () => {
  try {
    await initClient();
    if (frame.contentDocument?.readyState === 'complete') {
      frameReady = true;
      setTimeout(boot,120);
    }
  } catch (error) {
    console.error('[MCC Cloud] init failed', error);
    frame.addEventListener('load',() => {
      injectUi();
      showGate(false);
      setCloudState('error','Cloud-Fehler',error?.message || 'Cloud-Konfiguration fehlt');
    },{once:true});
  }
})();
