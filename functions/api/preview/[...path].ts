export async function onRequestGet(context: any) {
  const key = `preview/${context.params.path.join("/")}`;

  const obj = await context.env.R2.get(key);
  if (!obj) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("cache-control", "public, max-age=86400");

  return new Response(obj.body, { headers });
}