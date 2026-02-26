export async function onRequestGet(context: any) {
  try {
    const hasDB = !!context.env?.DB;
    const hasR2 = !!context.env?.R2;

    if (!hasDB) {
      return Response.json(
        { ok: false, error: "DB binding missing (context.env.DB is undefined)", hasDB, hasR2 },
        { status: 500 }
      );
    }

    const r = await context.env.DB.prepare("SELECT 1 as ok").first();
    return Response.json({ ok: r?.ok === 1, hasDB, hasR2 });
  } catch (e: any) {
    return Response.json(
      { ok: false, error: String(e?.message ?? e), hasDB: !!context.env?.DB, hasR2: !!context.env?.R2 },
      { status: 500 }
    );
  }
}