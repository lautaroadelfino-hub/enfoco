function unauthorized() {
  return new Response("Unauthorized", { status: 401 });
}

function badRequest(msg: string) {
  return Response.json({ error: msg }, { status: 400 });
}

export async function onRequestPost(context: any) {
  const key = context.request.headers.get("x-admin-key");
  if (!key || key !== context.env.ADMIN_KEY) return unauthorized();

  const body = await context.request.json().catch(() => null) as
    | { torneo?: string; fecha?: string; encuentro?: string; lugar?: string }
    | null;

  const torneo = body?.torneo?.trim();
  const fecha = body?.fecha?.trim(); // YYYY-MM-DD
  const encuentro = body?.encuentro?.trim();
  const lugar = body?.lugar?.trim() || null;

  if (!torneo || !fecha || !encuentro) {
    return badRequest("Faltan campos: torneo, fecha, encuentro");
  }

  const id = "ev_" + crypto.randomUUID();
  const created_at = new Date().toISOString();

  await context.env.DB.prepare(
    `INSERT INTO events (id, torneo, fecha, encuentro, lugar, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(id, torneo, fecha, encuentro, lugar, created_at).run();

  return Response.json({ id, torneo, fecha, encuentro, lugar, created_at });
}