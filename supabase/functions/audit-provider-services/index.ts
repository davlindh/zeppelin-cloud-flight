import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-run-token",
};

const RUN_TOKEN = "zeppel-schema-replay-2026";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.headers.get("x-run-token") !== RUN_TOKEN) {
    return new Response(JSON.stringify({ error: "forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const dbUrl = Deno.env.get("SUPABASE_DB_URL");
  if (!dbUrl) {
    return new Response(JSON.stringify({ error: "SUPABASE_DB_URL missing" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let payload: { files: { name: string; sql: string }[] };
  try {
    payload = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "invalid json", detail: String(e) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const client = new Client(dbUrl);
  const failures: { name: string; error: string }[] = [];
  let okCount = 0;

  try {
    await client.connect();
    for (const f of payload.files ?? []) {
      try {
        await client.queryArray(`BEGIN; ${f.sql}\n; COMMIT;`);
        okCount++;
      } catch (e) {
        try {
          await client.queryArray("ROLLBACK;");
        } catch (_) { /* ignore */ }
        failures.push({ name: f.name, error: String((e as Error).message ?? e) });
      }
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } finally {
    try {
      await client.end();
    } catch (_) { /* ignore */ }
  }

  return new Response(JSON.stringify({ okCount, failedCount: failures.length, failures }, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
