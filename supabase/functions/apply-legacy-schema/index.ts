import postgres from "https://esm.sh/postgres@3.4.4";
import { migrations } from "./migrations.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const dbUrl = Deno.env.get("SUPABASE_DB_URL");
  if (!dbUrl) {
    return new Response(JSON.stringify({ error: "SUPABASE_DB_URL missing" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const url = new URL(req.url);
  const start = Number(url.searchParams.get("start") ?? "0");
  const count = Number(url.searchParams.get("count") ?? String(migrations.length));

  const sql = postgres(dbUrl, { max: 1, prepare: false, idle_timeout: 10 });
  const results: { name: string; ok: boolean; error?: string }[] = [];

  try {
    for (const m of migrations.slice(start, start + count)) {
      const text = new TextDecoder().decode(
        Uint8Array.from(atob(m.b64), (c) => c.charCodeAt(0)),
      );
      try {
        await sql.unsafe(text);
        results.push({ name: m.name, ok: true });
      } catch (e) {
        results.push({ name: m.name, ok: false, error: String((e as Error).message ?? e) });
      }
    }
  } finally {
    await sql.end({ timeout: 5 });
  }

  const failed = results.filter((r) => !r.ok);
  return new Response(
    JSON.stringify({ total: results.length, failedCount: failed.length, failed, results: results.map((r) => r.name) }, null, 2),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
