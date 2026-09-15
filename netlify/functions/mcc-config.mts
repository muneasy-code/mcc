export default async () => {
  const url = Netlify.env.get("MCC_SUPABASE_URL") || "";
  const key = Netlify.env.get("MCC_SUPABASE_PUBLISHABLE_KEY") || "";

  if (!url || !key) {
    return Response.json({ ok: false, error: "MCC cloud config missing" }, { status: 503 });
  }

  return Response.json(
    { ok: true, supabaseUrl: url, publishableKey: key },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "Content-Type": "application/json; charset=utf-8"
      }
    }
  );
};

export const config = {
  path: "/api/mcc-config"
};
