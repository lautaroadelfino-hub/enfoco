export async function onRequestGet(context: any) {
  // En catch-all de Pages: context.params.path es string (puede incluir "/")
  const rest = context.params?.path ? String(context.params.path) : "";
  const key = rest ? `preview/${rest}` : "";

  if (!key || key.endsWith("preview/")) {
    return new Response("Missing path", { status: 400 });
  }

  const obj = await context.env.R2.get(key);
  if (!obj) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("cache-control", "public, max-age=86400");

  return new Response(obj.body, { headers });
}