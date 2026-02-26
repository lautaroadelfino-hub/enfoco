export async function onRequestGet() {
  return Response.json({
    ok: true,
    howToUse: "POST this endpoint with header x-admin-key to initialize DB schema"
  });
}

export async function onRequestPost(context: any) {
  const key = context.request.headers.get("x-admin-key");
  if (!key || key !== context.env.ADMIN_KEY) {
    return new Response("Unauthorized", { status: 401 });
  }

  const stmts = [
    `CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      torneo TEXT NOT NULL,
      fecha TEXT NOT NULL,
      encuentro TEXT NOT NULL,
      lugar TEXT,
      created_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_events_torneo_fecha ON events (torneo, fecha)`,

    `CREATE TABLE IF NOT EXISTS photos (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      dorsal INTEGER,
      preview_key TEXT NOT NULL,
      hd_key TEXT NOT NULL,
      price_ars INTEGER NOT NULL DEFAULT 5000,
      created_at TEXT NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_photos_event_dorsal ON photos (event_id, dorsal)`,

    `CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      buyer_email TEXT NOT NULL,
      status TEXT NOT NULL,
      total_ars INTEGER NOT NULL,
      mp_preference_id TEXT,
      mp_payment_id TEXT,
      created_at TEXT NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS order_items (
      order_id TEXT NOT NULL,
      photo_id TEXT NOT NULL,
      unit_price_ars INTEGER NOT NULL,
      PRIMARY KEY (order_id, photo_id)
    )`,

    `CREATE TABLE IF NOT EXISTS download_tokens (
      token TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      photo_id TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      max_downloads INTEGER NOT NULL DEFAULT 3,
      downloads_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )`
  ];

  for (const sql of stmts) {
    await context.env.DB.prepare(sql).run();
  }

  return Response.json({ ok: true });
}git add functions/api/admin/schema.ts
git commit -m "Add schema initializer endpoint"
git push