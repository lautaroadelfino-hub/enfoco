export async function onRequestGet(context: any) {
  const rows = await context.env.DB.prepare(
    `SELECT id, torneo, fecha, encuentro, lugar, created_at
     FROM events
     ORDER BY fecha DESC, created_at DESC
     LIMIT 100`
  ).all();

  return Response.json({ events: rows.results });
}