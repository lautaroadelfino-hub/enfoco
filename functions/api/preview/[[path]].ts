export async function onRequestGet(context: any) {
  const p = context.params?.path;
  const rest = Array.isArray(p) ? p.join("/") : (p ? String(p) : "");

  if (!rest) return new Response("Missing path", { status: 400 });

  // esto busca en R2: preview/<rest>
  const key = `preview/${rest}`;

  const obj = await context.env.R2.get(key);
  if (!obj) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("cache-control", "public, max-age=86400");

  return new Response(obj.body, { headers });
}