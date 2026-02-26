export async function onRequestGet(context: any) {
  const url = new URL(context.request.url);
  const event_id = url.searchParams.get("event_id");
  const dorsal = url.searchParams.get("dorsal");

  if (!event_id) return Response.json({ photos: [] });

  let sql =
    `SELECT id, event_id, dorsal, preview_key, price_ars
     FROM photos
     WHERE event_id = ?`;
  const binds: any[] = [event_id];

  if (dorsal && dorsal.trim() !== "") {
    sql += " AND dorsal = ?";
    binds.push(Number(dorsal));
  }

  sql += " ORDER BY created_at DESC LIMIT 500";

  const rows = await context.env.DB.prepare(sql).bind(...binds).all();
  return Response.json({ photos: rows.results });
}