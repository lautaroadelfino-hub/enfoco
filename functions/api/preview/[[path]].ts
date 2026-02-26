export async function onRequestGet(context: any) {
  const p = context.params?.path;
  const rest = Array.isArray(p) ? p.join("/") : (p ? String(p) : "");
  if (!rest) return new Response("Missing path", { status: 400 });

  const key = `preview/${rest}`; // busca en R2: preview/test.jpg
  const obj = await context.env.R2.get(key);
  if (!obj) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("cache-control", "public, max-age=86400");
  return new Response(obj.body, { headers });
}