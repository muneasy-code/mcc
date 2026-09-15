const f = document.getElementById('mcc');

f.addEventListener('load', () => {
  const d = f.contentDocument;
  const w = f.contentWindow;
  if (!d || !w) return;

  /* =========================================================
     MCC V0.7 PREVIEW PATCH
     - stronger mood identity
     - slimmer mobile Herrmann strip
     - full project editor
     - real project archaeology inventory
     - implemented/history item type
     ========================================================= */

  const st = d.createElement('style');
  st.textContent = `
    .brandmark{display:none!important}
    .brand:before{content:'';width:38px;height:38px;flex:0 0 38px;background:url('/muneasy-logo.svg') center/contain no-repeat;filter:drop-shadow(0 0 18px rgba(216,101,255,.22))}

    .mood-scene-v06{position:fixed;inset:0;pointer-events:none;z-index:1;overflow:hidden}
    .mood-scene-v06 i{position:absolute;font-style:normal;opacity:0;transition:.45s;color:#c39cff;text-shadow:0 0 18px currentColor}
    .mood-scene-v06 .a{left:17%;top:11%}.mood-scene-v06 .b{right:15%;top:18%}.mood-scene-v06 .c{left:9%;top:60%}.mood-scene-v06 .d{right:22%;bottom:16%}.mood-scene-v06 .e{right:8%;top:44%}
    body[data-mood='happy'] .mood-scene-v06 i{opacity:.42;color:#8fe8ff}
    body[data-mood='happy'] .focus-card{background:radial-gradient(circle at 82% 18%,rgba(99,215,255,.22),transparent 32%),radial-gradient(circle at 12% 92%,rgba(216,101,255,.16),transparent 28%),linear-gradient(180deg,rgba(22,24,35,.98),rgba(13,15,23,.98))}
    body[data-mood='happy'] .card{border-color:rgba(99,215,255,.14)}
    body[data-mood='tired'] .mood-scene-v06 i{opacity:.2;color:#9caac6}
    body[data-mood='tired'] .mood-scene-v06 .a,body[data-mood='tired'] .mood-scene-v06 .c,body[data-mood='tired'] .mood-scene-v06 .e{display:none}
    body[data-mood='tired'] .main{filter:saturate(.72) brightness(.94)}body[data-mood='tired'] .mood-pod{filter:none}
    body[data-mood='chaos'] .mood-scene-v06 i{opacity:.48;color:#ff9b82;transform:rotate(8deg) scale(1.08)}
    body[data-mood='chaos'] .project{border-color:rgba(255,141,116,.14)}
    body[data-mood='chaos'] .orbit-center{box-shadow:0 0 72px rgba(216,101,255,.28),0 0 110px rgba(99,215,255,.13)}
    body[data-mood='sad'] .mood-scene-v06 i{opacity:.13;color:#8f86b1}
    body[data-mood='sad'] .main{filter:saturate(.45) contrast(1.03)}body[data-mood='sad'] .mood-pod{filter:none}
    body[data-mood='sad'] .card{border-color:rgba(141,113,166,.18);background:radial-gradient(circle at 100% 0%,rgba(110,83,140,.07),transparent 24%),linear-gradient(180deg,rgba(15,15,21,.99),rgba(8,9,13,.99))}
    body[data-mood='sad'] .focus-card{background:radial-gradient(circle at 78% 12%,rgba(105,73,128,.17),transparent 30%),linear-gradient(180deg,rgba(15,15,21,.99),rgba(7,8,12,.99))}
    .mood-btn.active{box-shadow:0 0 22px rgba(216,101,255,.10)}
    body[data-mood='happy'] .mood-btn[data-mood='happy']::after{content:' ✦'}
    body[data-mood='okay'] .mood-btn[data-mood='okay']::after{content:' ·'}
    body[data-mood='tired'] .mood-btn[data-mood='tired']::after{content:' ☾'}
    body[data-mood='sad'] .mood-btn[data-mood='sad']::after{content:' ☁'}
    body[data-mood='chaos'] .mood-btn[data-mood='chaos']::after{content:' ⚡'}

    .mcc-edit-project{border:1px solid rgba(255,255,255,.10);background:#151922;color:#d8dce5;border-radius:11px;padding:8px 10px;font-size:10px;font-weight:800;letter-spacing:.02em}
    .mcc-edit-project:hover{border-color:rgba(216,101,255,.30);color:#fff;background:rgba(216,101,255,.08)}
    .mcc-ws-actions{display:flex;gap:7px;align-items:center}
    .idea-type.implemented{background:rgba(90,224,160,.10)!important;color:#8df0bc!important;border-color:rgba(90,224,160,.18)!important}
    .idea-item[data-implemented='true']{background:linear-gradient(90deg,rgba(90,224,160,.035),rgba(255,255,255,.012))}
    .mcc-source-pill{display:inline-flex;align-items:center;gap:5px;margin-top:8px;padding:5px 7px;border:1px solid rgba(255,255,255,.07);border-radius:999px;color:#767e8e;font-size:8px;text-transform:uppercase;letter-spacing:.08em;font-weight:900}

    #modal .modal-card{max-width:760px!important}
    .mcc-editor-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .mcc-editor-grid .full{grid-column:1/-1}
    .mcc-editor-grid textarea{width:100%;min-height:88px;resize:vertical;border:1px solid rgba(255,255,255,.08);background:#0f1219;color:#fff;border-radius:13px;padding:11px 12px;outline:none}
    .mcc-editor-grid textarea:focus{border-color:rgba(182,108,255,.42);box-shadow:0 0 0 4px rgba(182,108,255,.08)}
    .mcc-delete{margin-right:auto!important;border-color:rgba(255,111,127,.16)!important;color:#ff98a4!important;background:rgba(255,111,127,.05)!important}
    .mcc-editor-note{font-size:9px;color:#747c8c;line-height:1.45;margin-top:4px}

    @media(max-width:920px){
      .mood-pod{left:8px!important;right:8px!important;bottom:8px!important;padding:8px 10px!important;border-radius:18px!important;max-width:none!important}
      .mood-top{gap:9px!important;align-items:center!important}
      .mood-copy strong{font-size:11px!important}
      .mood-copy p{display:none!important}
      .mood-quote{font-size:8px!important;line-height:1.25!important;margin-top:2px!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:72vw}
      .mood-controls{gap:5px!important;margin-top:6px!important;flex-wrap:nowrap!important;overflow-x:auto!important;padding-bottom:1px}
      .mood-btn{padding:6px 8px!important;font-size:9px!important;min-width:auto!important;white-space:nowrap!important}
      .sarg-banner{padding:7px 9px!important;margin-top:6px!important}
      .sarg-banner p{display:none!important}
      .sarg-banner strong{font-size:9px!important;line-height:1.35!important}
      .mcc-editor-grid{grid-template-columns:1fr}
      .mcc-editor-grid .full{grid-column:auto}
    }
  `;
  d.head.appendChild(st);

  const scene = d.createElement('div');
  scene.className = 'mood-scene-v06';
  scene.innerHTML = '<i class="a">✦</i><i class="b">✷</i><i class="c">☾</i><i class="d">☁</i><i class="e">⚡</i>';
  d.body.appendChild(scene);

  const texts = {
    happy:['YES. Heute wird MCC bunt, glowy und ein bisschen celebraty.','Herrmann verteilt imaginäre Goldsterne.'],
    okay:['Stabil. Der cleane muneasy-Basismodus.','Ruhig, klar, signaturmäßig.'],
    tired:['Heute wird MCC weicher, ruhiger und ein kleines bisschen mondiger.','Eine Sache. Dann gucken wir weiter.'],
    sad:['Herr Simon Sarg wurde informiert. Jetzt wird es dunkler, dramatischer und leicht albern.','Im Tal der Tränen blinkt dennoch ein tapferes Dashboard.'],
    chaos:['Chaos-Modus: mehr Energie, mehr Farbe, mehr kleine Warnblitze — aber kontrolliert.','Herrmann zieht den Raumanzug an.']
  };
  d.querySelectorAll('.mood-btn').forEach(b => b.addEventListener('click', () => {
    setTimeout(() => {
      const m = d.body.dataset.mood || 'okay';
      if (!texts[m]) return;
      const t = d.getElementById('moodText');
      const q = d.getElementById('moodQuote');
      if (t) t.textContent = texts[m][0];
      if (q) q.textContent = texts[m][1];
    }, 0);
  }));

  const bridge = d.createElement('script');
  bridge.textContent = `
    window.MCCV07API = {
      getProjects(){ return projects; },
      getCurrentIndex(){ return currentProjectIndex; },
      refresh(){ projects.forEach(p=>ensureProjectData(p)); saveProjects(); render(); if(currentProjectIndex!==null) renderWorkspace(); },
      addProject(p){ ensureProjectData(p); projects.unshift(p); saveProjects(); render(); return 0; },
      updateProject(index, patch){ if(!projects[index]) return false; Object.assign(projects[index], patch); ensureProjectData(projects[index]); saveProjects(); render(); if(currentProjectIndex===index) renderWorkspace(); return true; },
      deleteProject(index){ if(!projects[index]) return false; if(currentProjectIndex===index) closeWorkspace(); projects.splice(index,1); saveProjects(); render(); return true; },
      openProject(index){ openWorkspace(index); },
      refreshWorkspace(){ if(currentProjectIndex!==null) renderWorkspace(); }
    };

    itemHTML = function(item, idx){
      const labels={idea:'Idee',feature:'Feature',task:'Aufgabe',decision:'Entscheidung',implemented:'Umgesetzt'};
      return \`<div class="idea-item" data-implemented="\${item.type==='implemented'}">
        <span class="idea-type \${escapeHTML(item.type)}">\${labels[item.type]||escapeHTML(item.type)}</span>
        <div class="idea-copy"><strong>\${escapeHTML(item.text)}</strong><small>\${formatStamp(item.created)}</small></div>
        <div class="idea-actions">
          <button class="herrmann-ask" data-herrmann="\${idx}" title="Herrmann fragen"><span class="herrmann-dot"></span>Herrmann?</button>
          <button data-edit-item="\${idx}" title="Bearbeiten">✎</button>
          \${item.type==='idea' ? \`<button data-convert="\${idx}" title="Als Feature planen">→F</button>\`:''}
          <button data-delete="\${idx}" title="Löschen">×</button>
        </div>
        \${item.aiError ? \`<div class="herrmann-error">\${escapeHTML(item.aiError)}</div>\` : ''}
        \${herrmannReviewHTML(item.aiReview)}
      </div>\`;
    };
  `;
  d.body.appendChild(bridge);

  const api = w.MCCV07API;
  if (!api) return;

  const now = Date.now();
  const day = 86400000;
  const c = (text, type='implemented', stage='done', daysAgo=0) => ({ text, type, stage, created: now - daysAgo * day });
  const link = (label, url) => ({ label, url });

  const inventory = [
    {name:'MCC · muneasy Control Center',type:'own',status:'Aktiv',priority:'Jetzt',progress:78,desc:'Zentrale Steuerzentrale für Projekte, Ideen, Historie, Prioritäten und muneasy-Wissen.',next:'Projektinventur und vollständigen Editor im Preview testen',grad:'linear-gradient(90deg,#ff8d74,#d865ff,#63d7ff)',tint:'linear-gradient(180deg,rgba(216,101,255,.12),rgba(13,15,21,.98) 38%,rgba(13,15,21,.98))',source:'GitHub + Netlify',links:[link('Live','https://muneasycontrolcentrum.netlify.app'),link('GitHub','https://github.com/muneasy-code/mcc')],items:[c('Mood-System mit Pixel Herrmann und Herr-Simon-Sarg-Modus','implemented','done',1),c('Herrmann-Ideencheck über OpenAI / Netlify Function','implemented','done',1),c('Preview-Branch als einziger Test-Deploy vor main','decision','inbox',0),c('Alle Projekte aus Netlify, GitHub und alten Ideen als Inventar führen','feature','doing',0),c('Projekt komplett anlegen, bearbeiten und löschen können','feature','doing',0),c('MCC später als echte Wissensbasis statt nur Todo-App nutzen','idea','inbox',0)]},
    {name:'ADM',type:'internal',status:'Aktiv',priority:'Jetzt',progress:92,desc:'AsA Device Manager · Geräte, Klassen, Ausgabe, Dokumente, Lernportal und operative Ausgabeworkflows.',next:'Netzwerkstellen-Ausgabe im Praxistest weiter härten',grad:'linear-gradient(90deg,#ff8d74,#ffd3c7)',tint:'linear-gradient(180deg,rgba(255,141,116,.10),rgba(13,15,21,.98) 38%,rgba(13,15,21,.98))',source:'GitHub + Netlify',links:[link('Live','https://asadevicemanager.netlify.app'),link('GitHub','https://github.com/muneasy-code/asadevicemanager')],items:[c('MEGAINDEX sicher in HTML, CSS und JS entflechtet','implemented','done',12),c('Dokumentengine für Einzel-, Klassen- und Batch-Verträge modularisiert','implemented','done',11),c('Ausgabepaket mit 3 Nutzungsverträgen, Rückgabeprotokoll und Übereignungsvertrag','implemented','done',10),c('Original-DRK-Rückgabeprotokoll templatisiert und IMEI sauber getrennt gemappt','implemented','done',9),c('Direkte Ordnerspeicherung für Ausgabepakete mit ZIP-Fallback','implemented','done',9),c('Intelligenter Meldelistenimport inkl. Schulvarianten, Geburtsdaten und Dublettenauflösung','implemented','done',8),c('Automatische Tablet-Zuordnung je Klasse samt Historieneintrag','implemented','done',2),c('Dokumentarchiv und Unterschriftenstatus','implemented','done',2),c('Vorbereitung/Nachbereitung inkl. Druckstatus und Upload unterschriebener Dokumente','implemented','done',2),c('Delivery-Planner-Sync über sichere Backend-Brücke','implemented','done',2),c('Netzwerkstellen-Assistent: Schule → Klasse → Meldeliste → Tablets → Druck → Lernportal','implemented','done',0),c('Handout und Datenschutz druckfertig in Klassendruck integriert','implemented','done',0),c('Dringende Terminbestätigung mit Mailvorlage und Planner-Status','implemented','done',0),c('Tablet Radar und Freischaltung/Lizenzverwaltung als eigene Arbeitsbereiche','implemented','done',2),c('BBI-Listen weiterhin robust auf bestehende Schul-/Klassennamen mappen','feature','doing',0),c('PH26* = Klassenbezeichnung; PH123A-artige Kennungen = interne Gerätekennung','decision','inbox',0),c('Alten Branch feature/class-printing-redesign gegen main prüfen, bevor er archiviert wird','task','inbox',0),c('Divergierten Branch feature/netzwerkstelle-ausgabe-assistent prüfen und danach archivieren','task','inbox',0)]},
    {name:'ProBeMo',type:'client',status:'Aktiv',priority:'Jetzt',progress:91,desc:'Fall-, Verlaufs-, Reporting- und Ministeriumsmonitoring für ProBe mit Viewer und Intelligence.',next:'Audit-/Löschhistorie vollständig nachvollziehbar absichern',grad:'linear-gradient(90deg,#46d8c7,#5e8cff)',tint:'linear-gradient(180deg,rgba(70,216,199,.09),rgba(13,15,21,.98) 38%,rgba(13,15,21,.98))',source:'GitHub + Netlify',links:[link('Live','https://probemonitor.netlify.app'),link('GitHub','https://github.com/muneasy-code/probemo')],items:[c('Ministeriums-Viewer V3 mit Cockpit, Diagrammen und Monitoring','implemented','done',12),c('Frage ProBeMo V2/V2.2 mit Trends, Folgefragen und Kontextsteuerung','implemented','done',11),c('Verlaufsakte nachträglich bearbeitbar, Änderungen im Audit protokolliert','implemented','done',12),c('Teilnehmendenarchiv und Berufsbegleitung','implemented','done',11),c('Newsfeed-Sync als Netlify Function und zeitgesteuerte Aktualisierung','implemented','done',21),c('Archivierte TN aus Einrichtungsbestand ausblenden','implemented','done',11),c('TN-Name statt ID in relevanten Ansichten','feature','planned',0),c('Klarnamen Begleiteransicht','feature','doing',0),c('Notizfeld ergänzen','feature','backlog',0),c('Teilnehmerkarten vollständig klickbar machen','feature','backlog',0),c('Viewer darf keine internen Notizen sehen','decision','inbox',0),c('Löschvorgänge und Audit-Log vollständig nachvollziehbar machen','task','inbox',0)]},
    {name:'ProBe Website',type:'client',status:'Aktiv',priority:'Danach',progress:86,desc:'Öffentliche ProBe-Webseite mit CMS, Mehrsprachigkeit, Datenschutz und geplantem Redesign.',next:'Cinematischen Redesign-Branch konsolidieren und freigabefertig machen',grad:'linear-gradient(90deg,#38d7c9,#72b6ff)',tint:'linear-gradient(180deg,rgba(56,215,201,.08),rgba(13,15,21,.98) 38%,rgba(13,15,21,.98))',source:'GitHub + Netlify',links:[link('Live','https://probe-sachsen-anhalt.de'),link('GitHub','https://github.com/muneasy-code/probe-website')],items:[c('Website mit CMS und mehrsprachigen Inhalten produktiv','implemented','done',68),c('Datenschutzlink direkt im Kontaktformular ergänzt','implemented','done',7),c('Datenschutzhinweise nach Rückmeldung des Datenschutzbeauftragten aktualisiert','implemented','done',7),c('Team-/News-Inhalte über Website-pflegen-Workflow aktualisierbar','implemented','done',5),c('Redesign dunkler, cinematischer und mit authentischen Bildern','feature','doing',0)]},
    {name:'ProBe Kampagne',type:'client',status:'Planung',priority:'Jetzt',progress:73,desc:'Wissenschaftlich abgeleitete Kampagne für internationale Azubis und Einrichtungen.',next:'Master-Hintergründe und Produktionssystem finalisieren',grad:'linear-gradient(90deg,#ff8d74,#e3b45a)',tint:'linear-gradient(180deg,rgba(255,141,116,.10),rgba(13,15,21,.98) 38%,rgba(13,15,21,.98))',source:'Konzept + Canva',items:[c('Kampagnenlinie „Gemeinsam gelingt’s!“ festgelegt','implemented','done',8),c('Empowerment-Linie „Du bist nicht das Problem…“ entwickelt','implemented','done',8),c('Motive zu Wohnung, Behördensprache, Abkürzungen, Hilfe, Team, Übersetzung und Feierabend entwickelt','implemented','done',7),c('Einrichtungsflyer als 6-seitige DIN-lang-Dramaturgie konzipiert','implemented','done',7),c('Azubi-Flyer bewusst kleiner und mehrsprachig denken','decision','inbox',6),c('Master ProBe Hintergründe vor Einzelmotiven festlegen','task','doing',0)]},
    {name:'SpencerHill 2027',type:'client',status:'Aktiv',priority:'Jetzt',progress:82,desc:'Festival-App / Relaunch 2027 · PWA, CMS, Jahreswechsel, Inhalte und langfristige Partnerschaft.',next:'CMS-Übersetzung reparieren und 2027-Bereiche weiter konsolidieren',grad:'linear-gradient(90deg,#4fc99e,#7fd18b)',tint:'linear-gradient(180deg,rgba(79,201,158,.10),rgba(13,15,21,.98) 38%,rgba(13,15,21,.98))',source:'Netlify + Server + laufende Partnerschaft',links:[link('Preview/Legacy','https://spencerhillofficial.netlify.app')],items:[c('PWA mit Push, Erinnerungen und Live-Daten','implemented','done',18),c('Serverumzug von Netlify auf trinity-festival.org','implemented','done',17),c('CMS für Programm, Hinweise und Infos inkl. Löschen','implemented','done',17),c('2026-Rückblick in 2027-App integriert','implemented','done',9),c('Jahresauswahl 2026/2027 und 2027 Theme dunkelgrün','implemented','done',8),c('Cache-Strategie so auslegen, dass Updates nach Deploy sofort sichtbar werden','decision','inbox',4),c('Automatische Übersetzung im CMS reparieren','task','doing',0),c('Sprachversionen IT / EN','feature','backlog',0),c('Area-Bereich weiter ausbauen','feature','backlog',0),c('Push-Sound-Idee mit Zitaten nur bei geklärten Rechten','idea','inbox',0)]},
    {name:'SpencerHill Bambino Club',type:'client',status:'Aktiv',priority:'Jetzt',progress:84,desc:'Interaktive Kinderwelt für Familiensonntag 2027 mit 360-Welt, Clubhouse, Rallye und Fan-Pass.',next:'Clubhouse-Räume, Rallye-Flow und Hotspots in eine klare Spielschleife bringen',grad:'linear-gradient(90deg,#f15f4a,#4b86e8)',tint:'linear-gradient(180deg,rgba(241,95,74,.09),rgba(13,15,21,.98) 38%,rgba(13,15,21,.98))',source:'GitHub + Netlify',links:[link('Live','https://spencerhillbambinoclub.netlify.app'),link('GitHub','https://github.com/muneasy-code/spencerhill-bambino-club')],items:[c('Interaktive 360° Bambino-Welt als Prototyp umgesetzt','implemented','done',1),c('Bulldozer & Slim Map-Handoff mit Animationen und Preload','implemented','done',1),c('Cinematisches Karten-Aufrollen und Discovery Progress','implemented','done',1),c('Clubhouse-Räume und Rallye Pass gestartet','implemented','done',1),c('Rallye-Stationen Bulldozer = Bewegung/Mut/Kraft/Teamwork; Slim = Rätsel/Suchen/Beobachten','decision','inbox',2),c('Malwettbewerb mit Online-Malvorlage und Ausstellung am Familiensonntag','feature','planned',2),c('Halstücher Team BULLDOZER rot / Team SLIM staubblau','idea','inbox',2),c('Weitere Giveaways: Lineal, Schlüsselanhänger, später kleine Plüschfiguren','idea','inbox',2)]},
    {name:'AsA Monitoring Intelligence',type:'internal',status:'Aktiv',priority:'Danach',progress:88,desc:'Intelligente Import-, Monitoring- und Evidenzpipeline für AsA-Auswertungen und Massenuploads.',next:'Smart-ZIP-Pipeline stabil halten und nächste Datenquellen sauber anschließen',grad:'linear-gradient(90deg,#63d7ff,#8f73ff)',tint:'linear-gradient(180deg,rgba(99,215,255,.09),rgba(13,15,21,.98) 38%,rgba(13,15,21,.98))',source:'GitHub + Netlify',links:[link('Live','https://asa-monitoring-intelligence.netlify.app'),link('GitHub','https://github.com/muneasy-code/asa-monitoring-intelligence')],items:[c('Smart-ZIP-Klassifizierung für Monitoring- und Austrittsunterlagen','implemented','done',7),c('Routing von ZIPs über Monitoring- und Exit-Importe','implemented','done',7),c('Semantische Dublettenerkennung für Massenuploads','implemented','done',7),c('Regressionstests für Klassifizierung und Dedup','implemented','done',7),c('Quellenbasierte monatliche Maßnahmeabbruch-Evidenz','implemented','done',7),c('Dropout-Enrichment auf monatliche Primär-Workbooks begrenzt','implemented','done',7)]},
    {name:'AsA Delivery Planner',type:'internal',status:'Aktiv',priority:'Danach',progress:90,desc:'Planungs- und Auslieferungswerkzeug für AsA-Termine; inzwischen eng mit ADM verzahnt.',next:'Planner-/ADM-Sync beobachten und nur bei echtem Bedarf weiterbauen',grad:'linear-gradient(90deg,#4cc9f0,#58d68d)',tint:'linear-gradient(180deg,rgba(76,201,240,.08),rgba(13,15,21,.98) 38%,rgba(13,15,21,.98))',source:'Netlify + ADM Integration',links:[link('Live','https://asadeliveryplanner.netlify.app')],items:[c('Delivery Planner produktiv und extern sehr positiv rückgemeldet','implemented','done',34),c('Termin-/Statusdaten werden in ADM-Vorbereitung synchronisiert','implemented','done',0),c('Manuelle Terminänderungen in ADM vor Sync geschützt','implemented','done',2)]},
    {name:'AsA Startklar',type:'internal',status:'Planung',priority:'Danach',progress:58,desc:'Interaktive Tablet-Einweisung mit Chat, Fortschritt, Hilfestatus, Evaluation und einfacher Sprache.',next:'Intelligence-Flow und realistischen 2027/28-Rollout weiter definieren',grad:'linear-gradient(90deg,#4cc9f0,#7209b7)',tint:'linear-gradient(180deg,rgba(76,201,240,.08),rgba(13,15,21,.98) 38%,rgba(13,15,21,.98))',source:'Netlify + Konzept',links:[link('Live','https://asastartklar.netlify.app')],items:[c('Grundkonzept für interaktive Tablet-Einweisung steht','implemented','done',61),c('Chat, Fortschritt, Hilfestatus, Evaluation, Übersetzung und leichte Sprache','feature','planned',60),c('LearnMatch 100: 80 BBI + 33 Region Nord resetbar als Logikidee','idea','inbox',60)]},
    {name:'muneasy 2.0',type:'own',status:'Aktiv',priority:'Jetzt',progress:76,desc:'muneasy.de als Produktwelt mit echten Demos, Cases und klarer Leistungsdarstellung.',next:'Produktwelt-Gerüst und echte Demos konsolidieren',grad:'linear-gradient(90deg,#ff8d74,#d865ff,#63d7ff)',tint:'linear-gradient(180deg,rgba(216,101,255,.10),rgba(13,15,21,.98) 38%,rgba(13,15,21,.98))',source:'Website + GitHub',links:[link('Live','https://muneasy.de'),link('GitHub Demo Suite','https://github.com/muneasy-code/muneasyde')],items:[c('muneasy.de Demo Suite initialisiert','implemented','done',10),c('Produktwelt mit echten interaktiven Demos','feature','doing',0),c('MCC als zentrale muneasy-Steuerzentrale','feature','doing',0),c('Demos erst nach Ende der Story öffnen','decision','inbox',0)]},
    {name:'muneasy Business & Brand',type:'own',status:'Aktiv',priority:'Danach',progress:70,desc:'Kleingewerbe, Sales, Wartungsverträge, Marke, Social Media und physische muneasy-Welt.',next:'Wiederkehrende Einnahmen und konkrete Kundengewinnung strukturieren',grad:'linear-gradient(90deg,#ff8d74,#d865ff)',tint:'linear-gradient(180deg,rgba(255,141,116,.08),rgba(13,15,21,.98) 38%,rgba(13,15,21,.98))',source:'Business',items:[c('Kleingewerbe gestartet','implemented','done',55),c('Erste ProBe-Rechnung 4.999 € fakturiert und bezahlt','implemented','done',38),c('Offizielles muneasy Masterlogo festgelegt','implemented','done',41),c('Visitenkarten und erste Merch-Produkte umgesetzt','implemented','done',40),c('Wartungsverträge als wiederkehrende Einnahme aufbauen','feature','planned',0),c('SpencerHill langfristige Partnerschaft und Vergütung klären','task','inbox',0),c('muneasy Core als kleines USB-C/Leuchtlogo-Objekt','idea','inbox',35)]},
    {name:'MOON',type:'own',status:'Wartet',priority:'Irgendwann',progress:48,desc:'Point-and-Click-Welt mit Moon, Oliver und einer tiefen, eigenständigen Spielwelt.',next:'Nach Pause mit genau einem kleinen Welt-/Gameplay-Deliverable weitergehen',grad:'linear-gradient(90deg,#8e78ff,#4b65df)',tint:'linear-gradient(180deg,rgba(142,120,255,.10),rgba(13,15,21,.98) 38%,rgba(13,15,21,.98))',source:'GitHub + Netlify',links:[link('Live','https://walkthemoon.netlify.app'),link('GitHub','https://github.com/muneasy-code/walkthemoon')],items:[c('V7.4.1 Deep Field WOW deployed','implemented','done',7),c('Deep-Field-Sichtbarkeit nach Live-QA nachjustiert','implemented','done',7),c('Star floor für mehr kosmische Tiefe verstärkt','implemented','done',7),c('Oberstadt/Unterstadt, zwei Brücken und Kanalisation als Weltkanon','decision','inbox',40),c('Moon + Hund Oliver + Hermann Frogger als Figurenkanon','decision','inbox',40),c('Café Luminaris, Spelunke, Schnittenmann, Moosbert, Lieferratto und Saucy','idea','inbox',40),c('Wöchentlicher MOON-Impuls Sonntag 19 Uhr ohne Scope Creep','decision','inbox',14)]},
    {name:'muneasy Calendar',type:'own',status:'Pausiert',priority:'Irgendwann',progress:62,desc:'Persönlicher Kalender-MVP mit auswählbaren Quellen, Sport, Ferien, Feiertagen und ICS-Export.',next:'Entscheiden, ob V1.1 mit persistentem Kalender-Link wieder aufgenommen wird',grad:'linear-gradient(90deg,#63d7ff,#6ee7c8)',tint:'linear-gradient(180deg,rgba(99,215,255,.08),rgba(13,15,21,.98) 38%,rgba(13,15,21,.98))',source:'GitHub + Netlify',links:[link('Live','https://muneasycalendar.netlify.app'),link('GitHub','https://github.com/muneasy-code/muneasycalendar')],items:[c('V1 MVP mit Werder, Gladbach, SCM, Ferien, Feiertagen und Geburtstagen','implemented','done',34),c('Lokale Speicherung und ICS-Export für Samsung/Google/Apple/Outlook','implemented','done',34),c('V1.1: persistenter persönlicher Kalender-Link mit automatischen Terminupdates','feature','backlog',34)]},
    {name:'SCM Ticket Radar',type:'own',status:'Pausiert',priority:'Irgendwann',progress:55,desc:'Kleiner Eventim-Radar für SC-Magdeburg-Ticketverfügbarkeit.',next:'Nur bei Bedarf reaktivieren und Benachrichtigungsweg ergänzen',grad:'linear-gradient(90deg,#55a9ff,#6f86ff)',tint:'linear-gradient(180deg,rgba(85,169,255,.08),rgba(13,15,21,.98) 38%,rgba(13,15,21,.98))',source:'GitHub + Netlify',links:[link('Live','https://scmticketradar.netlify.app'),link('GitHub','https://github.com/muneasy-code/scm-ticket-radar')],items:[c('Netlify Function prüft Eventim-Signale und erkennt TICKETS_AVAILABLE / NO_TICKETS / UNKNOWN','implemented','done',30),c('Benachrichtigung ergänzen, sobald Tickets verfügbar sind','feature','backlog',30)]},
    {name:'muneasy Booking',type:'own',status:'Wiederentdeckt',priority:'Irgendwann',progress:20,desc:'Netlify-Projekt wiedergefunden · Zweck/Stand im MCC noch zu verifizieren.',next:'Alten Stand öffnen und Zweck dokumentieren',source:'Netlify-Fund',links:[link('Live','https://muneasybooking.netlify.app')],items:[c('Projektzweck und aktuellen Stand prüfen','task','inbox',0)]},
    {name:'muneasy Monitor',type:'own',status:'Wiederentdeckt',priority:'Irgendwann',progress:20,desc:'Netlify-Projekt wiedergefunden · alter Monitor/Prototyp, Inhalt noch zu verifizieren.',next:'Deploy sichten und entscheiden: archivieren oder reaktivieren',source:'Netlify-Fund',links:[link('Live','https://muneasymonitor.netlify.app')],items:[c('Deploy-Inhalt sichten','task','inbox',0)]},
    {name:'muneasy Finance',type:'own',status:'Wiederentdeckt',priority:'Irgendwann',progress:20,desc:'Netlify-Projekt wiedergefunden · Finance-Prototyp, genauer Stand noch zu prüfen.',next:'Alten Finance-Stand dokumentieren',source:'Netlify-Fund',links:[link('Live','https://muneasyfinance.netlify.app')],items:[c('Finance-Prototyp prüfen','task','inbox',0)]},
    {name:'muneasy Analytics',type:'own',status:'Wiederentdeckt',priority:'Irgendwann',progress:20,desc:'Netlify-Projekt wiedergefunden · Analytics-Prototyp, genauer Stand noch zu prüfen.',next:'Alten Analytics-Stand dokumentieren',source:'Netlify-Fund',links:[link('Live','https://muneasyanalytics.netlify.app')],items:[c('Analytics-Prototyp prüfen','task','inbox',0)]},
    {name:'Vier Fäuste für ein Festival',type:'own',status:'Archiv / Experiment',priority:'Irgendwann',progress:30,desc:'Älterer SpencerHill/Festival-Prototyp auf Netlify.',next:'Nur behalten, wenn Inhalte noch Referenzwert haben',source:'Netlify-Fund',links:[link('Live','https://vierfaeustefuereeinfestival.netlify.app')],items:[c('Gegen aktuelle SpencerHill-App prüfen und ggf. archivieren','task','inbox',0)]},
    {name:'AOK PH Viewer',type:'internal',status:'Wiederentdeckt',priority:'Irgendwann',progress:25,desc:'Netlify-Projekt aus dem Pflegehilfe-/Viewer-Umfeld · Zweck und aktueller Nutzen noch zu verifizieren.',next:'Deploy sichten und fachliche Zuordnung dokumentieren',source:'Netlify-Fund',links:[link('Live','https://aok-ph-viewer.netlify.app')],items:[c('Zweck und Datenstand prüfen','task','inbox',0)]},
    {name:'DRK Hub ST',type:'internal',status:'Wiederentdeckt',priority:'Irgendwann',progress:20,desc:'Älteres DRK-Hub-Projekt auf Netlify · aktueller Zweck noch zu verifizieren.',next:'Deploy öffnen und einordnen',source:'Netlify-Fund',links:[link('Live','https://drkhubst.netlify.app')],items:[c('Projekt einordnen','task','inbox',0)]},
    {name:'Werkzettel',type:'own',status:'Wiederentdeckt',priority:'Irgendwann',progress:20,desc:'Älteres Netlify-Projekt · Zweck und Nutzerkreis im MCC noch nicht rekonstruiert.',next:'Deploy sichten und archivieren oder beschreiben',source:'Netlify-Fund',links:[link('Live','https://werkzettel.netlify.app')],items:[c('Altprojekt prüfen','task','inbox',0)]},
    {name:'Blissful Yoga MD',type:'client',status:'Wiederentdeckt',priority:'Irgendwann',progress:20,desc:'Älteres Netlify-Kunden-/Demo-Projekt · genauer Stand noch zu verifizieren.',next:'Deploy sichten und Status festlegen',source:'Netlify-Fund',links:[link('Live','https://blissfulyogamd.netlify.app')],items:[c('Kunden-/Demo-Status prüfen','task','inbox',0)]},
    {name:'Kaputt, aber geht noch',type:'own',status:'Pausiert',priority:'Irgendwann',progress:10,desc:'Schreibprojekt.',next:'Nächsten klaren Text-/Kapitelanker definieren',source:'Creative',items:[c('Schreibprojekt wieder aufnehmen, wenn kreativer Slot frei ist','task','inbox',0)]},
    {name:'Mein Leben als Romcom',type:'own',status:'Pausiert',priority:'Irgendwann',progress:8,desc:'Schreib-/Buchidee.',next:'Grundidee und Ton in einem One-Pager festhalten',source:'Creative',items:[c('One-Pager für Konzept und Ton anlegen','task','inbox',0)]}
  ];

  function norm(s){ return String(s || '').toLowerCase().replace(/[^a-z0-9äöüß]+/g,' ').trim(); }
  function mergeItems(target, incoming){ target.items = Array.isArray(target.items) ? target.items : []; const seen = new Set(target.items.map(x => norm(x.text))); (incoming || []).forEach(item => { if (!seen.has(norm(item.text))) { target.items.push(item); seen.add(norm(item.text)); } }); }
  function mergeLinks(target, incoming){ target.links = Array.isArray(target.links) ? target.links : []; const seen = new Set(target.links.map(x => norm(x.url || x.label))); (incoming || []).forEach(item => { if (!seen.has(norm(item.url || item.label))) { target.links.push(item); seen.add(norm(item.url || item.label)); } }); }

  if (!w.localStorage.getItem('mcc-inventory-v07')) {
    const projects = api.getProjects();
    const aliases = new Map([[norm('MCC · muneasy Control Center'),[norm('MCC'),norm('muneasy Control Center')]],[norm('SpencerHill Bambino Club'),[norm('Bambino Club')]],[norm('AsA Delivery Planner'),[norm('Delivery Planner')]]]);
    inventory.forEach(entry => {
      const names = [norm(entry.name), ...(aliases.get(norm(entry.name)) || [])];
      let target = projects.find(p => names.includes(norm(p.name)));
      if (!target) {
        target = JSON.parse(JSON.stringify(entry));
        target.notes = target.notes || '';
        target.items = target.items || [];
        target.links = target.links || [];
        projects.push(target);
      } else {
        target.desc = target.desc && target.desc !== 'Neu im MCC angelegt' ? target.desc : entry.desc;
        target.next = target.next || entry.next;
        target.source = target.source || entry.source;
        if (!target.grad && entry.grad) target.grad = entry.grad;
        if (!target.tint && entry.tint) target.tint = entry.tint;
        mergeItems(target, entry.items);
        mergeLinks(target, entry.links);
      }
    });
    api.refresh();
    w.localStorage.setItem('mcc-inventory-v07','1');
  }

  ['quickType','ideaType'].forEach(id => {
    const select = d.getElementById(id);
    if (select && !select.querySelector('option[value="implemented"]')) {
      const opt = d.createElement('option');
      opt.value = 'implemented';
      opt.textContent = 'Umgesetzt';
      select.appendChild(opt);
    }
  });

  const headRow = d.querySelector('.ws-headrow');
  if (headRow && !d.getElementById('mccEditProject')) {
    const close = d.getElementById('wsClose');
    const actions = d.createElement('div');
    actions.className = 'mcc-ws-actions';
    const edit = d.createElement('button');
    edit.type = 'button';
    edit.id = 'mccEditProject';
    edit.className = 'mcc-edit-project';
    edit.textContent = '✎ Projekt bearbeiten';
    actions.appendChild(edit);
    if (close) actions.appendChild(close);
    headRow.appendChild(actions);
  }

  const modal = d.getElementById('modal');
  let editIndex = null;

  function editorHTML(){
    return `<div class="modal-card"><div class="modal-head"><div><div class="eyebrow">MCC project</div><h3 id="mccEditorTitle">Neues Projekt</h3></div><button class="close" id="mccEditorClose">×</button></div><form id="mccProjectEditor"><div class="mcc-editor-grid"><div class="field full"><label>Projektname</label><input id="mccName" required placeholder="Projektname"></div><div class="field"><label>Bereich</label><select id="mccType"><option value="client">Kunde</option><option value="internal">DRK / intern</option><option value="own">muneasy lab</option></select></div><div class="field"><label>Status</label><select id="mccStatus"><option>Aktiv</option><option>Planung</option><option>Wartet</option><option>Review</option><option>Wartung</option><option>Pausiert</option><option>Wiederentdeckt</option><option>Archiv / Experiment</option><option>Umgesetzt</option></select></div><div class="field"><label>Priorität</label><select id="mccPriority"><option>Jetzt</option><option>Danach</option><option>Irgendwann</option></select></div><div class="field"><label>Fortschritt %</label><input id="mccProgress" type="number" min="0" max="100" value="20"></div><div class="field full"><label>Kurzbeschreibung</label><textarea id="mccDesc" placeholder="Was ist dieses Projekt?"></textarea></div><div class="field full"><label>Nächster konkreter Schritt</label><input id="mccNext" placeholder="Genau eine Sache"></div><div class="field full"><label>Herkunft / Einordnung</label><input id="mccSource" placeholder="z. B. GitHub + Netlify, Kunde, Creative"><div class="mcc-editor-note">Notizen, Links, Ideen, Features, Entscheidungen und Umsetzungen bearbeitest du weiterhin direkt in der Projektakte.</div></div></div><div class="modal-actions"><button type="button" class="btn mcc-delete" id="mccDelete">Projekt löschen</button><button type="button" class="btn" id="mccEditorCancel">Abbrechen</button><button class="btn primary" id="mccSave">Projekt speichern</button></div></form></div>`;
  }

  function ensureEditor(){ if (!modal) return; modal.innerHTML = editorHTML(); d.getElementById('mccEditorClose').onclick = closeEditor; d.getElementById('mccEditorCancel').onclick = closeEditor; modal.onclick = e => { if (e.target === modal) closeEditor(); }; d.getElementById('mccProjectEditor').addEventListener('submit', saveEditor); d.getElementById('mccDelete').onclick = deleteEditorProject; }
  function val(id){ return d.getElementById(id); }
  function setValue(id, value){ const el = val(id); if (el) el.value = value ?? ''; }

  function openEditor(index = null){
    ensureEditor();
    editIndex = Number.isInteger(index) ? index : null;
    const p = editIndex === null ? null : api.getProjects()[editIndex];
    val('mccEditorTitle').textContent = p ? 'Projekt bearbeiten' : 'Neues Projekt';
    val('mccDelete').style.display = p ? '' : 'none';
    setValue('mccName', p?.name || ''); setValue('mccType', p?.type || 'own'); setValue('mccStatus', p?.status || 'Planung'); setValue('mccPriority', p?.priority || 'Danach'); setValue('mccProgress', p?.progress ?? 20); setValue('mccDesc', p?.desc || ''); setValue('mccNext', p?.next || ''); setValue('mccSource', p?.source || '');
    modal.classList.add('show'); setTimeout(() => val('mccName')?.focus(), 20);
  }
  function closeEditor(){ modal?.classList.remove('show'); editIndex = null; }
  function projectVisual(type){ if (type === 'client') return {grad:'linear-gradient(90deg,#46d8c7,#5e8cff)',tint:'linear-gradient(180deg,rgba(70,216,199,.09),rgba(13,15,21,.98) 38%,rgba(13,15,21,.98))'}; if (type === 'internal') return {grad:'linear-gradient(90deg,#ff8d74,#63d7ff)',tint:'linear-gradient(180deg,rgba(255,141,116,.08),rgba(13,15,21,.98) 38%,rgba(13,15,21,.98))'}; return {grad:'linear-gradient(90deg,#ff8d74,#d865ff,#63d7ff)',tint:'linear-gradient(180deg,rgba(216,101,255,.10),rgba(13,15,21,.98) 38%,rgba(13,15,21,.98))'}; }

  function saveEditor(e){
    e.preventDefault();
    const type = val('mccType').value; const visual = projectVisual(type);
    const patch = {name:val('mccName').value.trim(),type,status:val('mccStatus').value,priority:val('mccPriority').value,progress:Math.max(0,Math.min(100,Number(val('mccProgress').value)||0)),desc:val('mccDesc').value.trim(),next:val('mccNext').value.trim(),source:val('mccSource').value.trim(),grad:visual.grad,tint:visual.tint};
    if (!patch.name) return;
    if (editIndex === null) { patch.items = []; patch.links = []; patch.notes = ''; const idx = api.addProject(patch); closeEditor(); api.openProject(idx); }
    else { api.updateProject(editIndex, patch); closeEditor(); }
  }

  function deleteEditorProject(){ if (editIndex === null) return; const p = api.getProjects()[editIndex]; if (!p) return; if (!w.confirm(`„${p.name}“ wirklich aus dem MCC löschen?`)) return; api.deleteProject(editIndex); closeEditor(); }

  const newButton = d.getElementById('newProject');
  if (newButton) newButton.onclick = () => openEditor(null);
  const editButton = d.getElementById('mccEditProject');
  if (editButton) editButton.onclick = () => openEditor(api.getCurrentIndex());

  ['recentItems','allItems'].forEach(id => {
    const list = d.getElementById(id);
    if (!list) return;
    list.addEventListener('click', e => {
      const btn = e.target.closest('[data-edit-item]');
      if (!btn) return;
      e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
      const projectIndex = api.getCurrentIndex(); const p = api.getProjects()[projectIndex]; const item = p?.items?.[Number(btn.dataset.editItem)]; if (!item) return;
      const next = w.prompt('Eintrag bearbeiten', item.text); if (next === null) return; const text = next.trim(); if (!text) return; item.text = text; api.refresh();
    }, true);
  });

  function updateSourcePill(){ const idx = api.getCurrentIndex(); const p = api.getProjects()[idx]; const wrap = d.querySelector('.ws-titlewrap > div:last-child'); if (!wrap || !p?.source) return; let pill = d.getElementById('mccSourcePill'); if (!pill) { pill = d.createElement('div'); pill.id = 'mccSourcePill'; pill.className = 'mcc-source-pill'; wrap.appendChild(pill); } pill.textContent = '⌁ ' + p.source; }
  d.getElementById('projectGrid')?.addEventListener('click', () => setTimeout(updateSourcePill, 0), true);
  api.refresh();
});
