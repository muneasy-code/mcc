const ALLOWED_HOSTS = new Set([
  "muneasycontrolcentrum.netlify.app",
  "www.muneasycontrolcentrum.netlify.app",
  "localhost",
  "127.0.0.1"
]);

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}

function hostAllowed(request) {
  try {
    const origin = request.headers.get("origin");
    if (!origin) return true;
    const host = new URL(origin).hostname;
    if (ALLOWED_HOSTS.has(host)) return true;
    if (host.endsWith("--muneasycontrolcentrum.netlify.app")) return true;
    return false;
  } catch {
    return false;
  }
}

function extractOutputText(data) {
  if (typeof data?.output_text === "string" && data.output_text) return data.output_text;
  const output = Array.isArray(data?.output) ? data.output : [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const part of content) {
      if (part?.type === "output_text" && typeof part.text === "string") return part.text;
    }
  }
  return "";
}

export default async (request) => {
  if (request.method !== "POST") return json({ error: "Nur POST ist erlaubt." }, 405);
  if (!hostAllowed(request)) return json({ error: "Diese Anfrage gehört nicht zum MCC." }, 403);

  const apiKey = Netlify.env.get("OPENAI_API_KEY");
  if (!apiKey) return json({ error: "OPENAI_API_KEY fehlt in Netlify." }, 500);

  let payload;
  try { payload = await request.json(); }
  catch { return json({ error: "Ungültige Anfrage." }, 400); }

  const itemText = String(payload?.item?.text || "").trim();
  if (!itemText) return json({ error: "Herrmann braucht erst eine Idee zum Anschauen." }, 400);
  if (itemText.length > 3000) return json({ error: "Die Idee ist für den Kurzcheck zu lang." }, 400);

  const project = payload?.project || {};
  const safeContext = {
    project: {
      name: String(project.name || "").slice(0, 180),
      description: String(project.description || "").slice(0, 1200),
      status: String(project.status || "").slice(0, 100),
      priority: String(project.priority || "").slice(0, 100),
      progress: Number(project.progress || 0),
      next_step: String(project.next_step || "").slice(0, 1200),
      notes: String(project.notes || "").slice(0, 3000),
      existing_items: Array.isArray(project.existing_items)
        ? project.existing_items.slice(0, 24).map((x) => ({
            text: String(x?.text || "").slice(0, 600),
            type: String(x?.type || "").slice(0, 80),
            stage: String(x?.stage || "").slice(0, 80)
          }))
        : []
    },
    item: {
      text: itemText,
      type: String(payload?.item?.type || "idea").slice(0, 80),
      stage: String(payload?.item?.stage || "").slice(0, 80)
    },
    mood: String(payload?.mood || "okay").slice(0, 40)
  };

  const instructions = `
Du bist Pixel Herrmann, ein kleiner alienartiger Co-Pilot im persönlichen muneasy Control Center (MCC).
Deine Aufgabe ist NICHT, jede Idee zu loben. Prüfe sie ehrlich, praktisch und kurz im Kontext des konkreten Projekts.
Schreibe auf Deutsch.
Ton: freundlich, trocken, direkt, leicht charmant – aber kein künstliches Dauerlob.
Beurteile nur anhand des gelieferten Projektkontexts. Erfinde keine Fakten.
Wenn etwas gut klingt, sage warum. Wenn es unnötig, doppelt, zu aufwendig oder riskant ist, sage das klar.
"riskant" bedeutet: relevante technische, rechtliche, Datenschutz-, Kosten- oder Scope-Risiken.
"meh" bedeutet: nicht schlecht, aber aktuell wenig Nutzen / falsche Priorität / unnötiger Aufwand.
Der Score ist eine pragmatische Einschätzung für DIESES Projekt, kein objektiver Qualitätswert.
Halte summary, watchout und next_step jeweils sehr kurz (idealerweise 1 Satz).
`.trim();

  const schema = {
    type: "object",
    properties: {
      verdict: { type: "string", enum: ["stark", "gut", "meh", "riskant"] },
      score: { type: "integer", minimum: 1, maximum: 10 },
      summary: { type: "string" },
      watchout: { type: "string" },
      next_step: { type: "string" }
    },
    required: ["verdict", "score", "summary", "watchout", "next_step"],
    additionalProperties: false
  };

  let openaiResponse;
  try {
    openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-5.6-luna",
        store: false,
        reasoning: { effort: "none" },
        instructions,
        input: JSON.stringify(safeContext),
        max_output_tokens: 320,
        text: {
          verbosity: "low",
          format: { type: "json_schema", name: "herrmann_idea_review", strict: true, schema }
        }
      })
    });
  } catch {
    return json({ error: "Herrmann erreicht OpenAI gerade nicht." }, 502);
  }

  const data = await openaiResponse.json().catch(() => ({}));
  if (!openaiResponse.ok) {
    const message = data?.error?.message || "OpenAI hat die Anfrage abgelehnt.";
    if (openaiResponse.status === 401) return json({ error: "Der OpenAI API-Key ist ungültig oder nicht verfügbar." }, 502);
    if (openaiResponse.status === 429) return json({ error: "Herrmann hat gerade sein API-Limit erreicht. Prüfe ggf. OpenAI-Billing." }, 429);
    return json({ error: message.slice(0, 400) }, 502);
  }

  const outputText = extractOutputText(data);
  if (!outputText) return json({ error: "Herrmann hat diesmal keine lesbare Antwort geliefert." }, 502);
  try { return json(JSON.parse(outputText), 200); }
  catch { return json({ error: "Herrmanns Antwort konnte nicht gelesen werden." }, 502); }
};

export const config = {
  path: "/api/herrmann",
  rateLimit: {
    windowLimit: 12,
    windowSize: 60,
    aggregateBy: ["ip", "domain"]
  }
};
