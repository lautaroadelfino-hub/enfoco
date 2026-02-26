export async function onRequestGet(context: any) {
  const r = await context.env.DB.prepare("SELECT 1 as ok").first();
  return Response.json({ ok: r?.ok === 1 });
}