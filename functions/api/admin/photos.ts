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
    | { event_id?: string; dorsal?: number | string; price_ars?: number; ext?: string }
    | null;

  const event_id = body?.event_id?.trim();
  const dorsalRaw = body?.dorsal;
  const dorsal =
    dorsalRaw === undefined || dorsalRaw === null || dorsalRaw === ""
      ? null
      : Number(dorsalRaw);

  const price_ars = body?.price_ars ?? 5000;
  const ext = (body?.ext ?? "jpg").toLowerCase();

  if (!event_id) return badRequest("Falta event_id");
  if (dorsal !== null && Number.isNaN(dorsal)) return badRequest("dorsal inválido");

  const id = "ph_" + crypto.randomUUID();
  const created_at = new Date().toISOString();

  const preview_key = `preview/${event_id}/${id}.${ext}`;
  const hd_key = `hd/${event_id}/${id}.${ext}`;

  await context.env.DB.prepare(
    `INSERT INTO photos (id, event_id, dorsal, preview_key, hd_key, price_ars, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(id, event_id, dorsal, preview_key, hd_key, price_ars, created_at)
    .run();

  return Response.json({ id, event_id, dorsal, price_ars, preview_key, hd_key, created_at });
}