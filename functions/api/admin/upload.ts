function unauthorized() {
  return new Response("Unauthorized", { status: 401 });
}

export async function onRequestPost(context: any) {
  const key = context.request.headers.get("x-admin-key");
  if (!key || key !== context.env.ADMIN_KEY) return unauthorized();

  const form = await context.request.formData();
  const r2Key = String(form.get("key") ?? "");
  const file = form.get("file");

  if (!r2Key) return new Response("Missing key", { status: 400 });
  if (!(file instanceof File)) return new Response("Missing file", { status: 400 });

  // Guardar en R2
  await context.env.R2.put(r2Key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type || "image/jpeg" }
  });

  return Response.json({ ok: true, key: r2Key, size: file.size });
}