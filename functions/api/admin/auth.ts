export async function onRequestGet(context: any) {
  const key = context.request.headers.get("x-admin-key");
  if (!key || key !== context.env.ADMIN_KEY) {
    return new Response("Unauthorized", { status: 401 });
  }
  return Response.json({ ok: true });
}