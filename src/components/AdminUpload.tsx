import { useEffect, useMemo, useState } from "react";

type EventRow = {
  id: string;
  torneo: string;
  fecha: string;
  encuentro: string;
  lugar?: string | null;
};

type CreatePhotoResp = {
  id: string;
  event_id: string;
  dorsal: number | null;
  price_ars: number;
  preview_key: string; // e.g. preview/ev_xxx/ph_xxx.jpg
  hd_key: string;      // e.g. hd/ev_xxx/ph_xxx.jpg
};

function extFromFileName(name: string) {
  const p = name.split(".").pop()?.toLowerCase();
  if (!p) return "jpg";
  if (p === "jpeg") return "jpg";
  return p;
}

export default function AdminUpload() {
  const [adminKey, setAdminKey] = useState(localStorage.getItem("ENFOCO_ADMIN_KEY") || "");
  const [events, setEvents] = useState<EventRow[]>([]);
  const [eventId, setEventId] = useState("");
  const [dorsal, setDorsal] = useState<string>("");
  const [price, setPrice] = useState<number>(5000);

  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [hdFile, setHdFile] = useState<File | null>(null);

  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [lastPreviewUrl, setLastPreviewUrl] = useState<string>("");

  const selectedEvent = useMemo(() => events.find(e => e.id === eventId), [events, eventId]);

  useEffect(() => {
    fetch("/api/events")
      .then(r => r.json())
      .then(data => setEvents(data.events ?? []))
      .catch(() => setEvents([]));
  }, []);

  const addLog = (msg: string) => setLog(prev => [msg, ...prev].slice(0, 15));

  const saveKey = () => {
    localStorage.setItem("ENFOCO_ADMIN_KEY", adminKey);
    addLog("✅ Admin key guardada en este navegador");
  };

  async function uploadToR2(key: string, file: File) {
    const fd = new FormData();
    fd.append("key", key);
    fd.append("file", file);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      headers: { "x-admin-key": adminKey },
      body: fd
    });

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(`Upload failed (${res.status}): ${t}`);
    }
  }

  async function onSubmit() {
    if (!adminKey) return addLog("❌ Falta ADMIN KEY");
    if (!eventId) return addLog("❌ Elegí un evento");
    if (!previewFile) return addLog("❌ Falta archivo PREVIEW (con watermark)");
    if (!hdFile) return addLog("❌ Falta archivo HD (limpio)");

    setBusy(true);
    setLastPreviewUrl("");
    try {
      addLog("1) Creando registro de foto en DB...");

      const ext = extFromFileName(previewFile.name || "jpg");

      const createRes = await fetch("/api/admin/photos", {
        method: "POST",
        headers: {
          "x-admin-key": adminKey,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          event_id: eventId,
          dorsal: dorsal.trim() === "" ? null : Number(dorsal),
          price_ars: price,
          ext
        })
      });

      if (!createRes.ok) {
        const t = await createRes.text().catch(() => "");
        throw new Error(`Create photo failed (${createRes.status}): ${t}`);
      }

      const created = (await createRes.json()) as CreatePhotoResp;

      addLog(`✅ Foto creada: ${created.id}`);
      addLog("2) Subiendo PREVIEW a R2...");
      await uploadToR2(created.preview_key, previewFile);

      addLog("3) Subiendo HD a R2...");
      await uploadToR2(created.hd_key, hdFile);

      const previewUrl = "/api/" + created.preview_key; // => /api/preview/...
      setLastPreviewUrl(previewUrl);
      addLog("✅ Listo: preview + HD subidos");
    } catch (e: any) {
      addLog("❌ " + String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Admin · Subir foto</h2>

      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="ADMIN KEY"
            style={{ padding: 10, border: "1px solid #ccc", borderRadius: 10, width: 260 }}
          />
          <button onClick={saveKey} style={{ padding: "10px 12px", borderRadius: 10 }}>
            Guardar
          </button>
        </div>

        <select
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 10 }}
        >
          <option value="">Elegí evento…</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.fecha} · {e.torneo} · {e.encuentro}
            </option>
          ))}
        </select>

        {selectedEvent ? (
          <div style={{ opacity: 0.75 }}>
            Seleccionado: <b>{selectedEvent.torneo}</b> — {selectedEvent.fecha} — {selectedEvent.encuentro}
          </div>
        ) : null}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            value={dorsal}
            onChange={(e) => setDorsal(e.target.value)}
            placeholder="Dorsal (opcional)"
            style={{ padding: 10, border: "1px solid #ccc", borderRadius: 10, width: 180 }}
          />
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            placeholder="Precio ARS"
            style={{ padding: 10, border: "1px solid #ccc", borderRadius: 10, width: 180 }}
          />
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <label>
            <div style={{ fontWeight: 600 }}>Preview (con watermark ENFOCO)</div>
            <input type="file" accept="image/*" onChange={(e) => setPreviewFile(e.target.files?.[0] ?? null)} />
          </label>

          <label>
            <div style={{ fontWeight: 600 }}>HD (limpio)</div>
            <input type="file" accept="image/*" onChange={(e) => setHdFile(e.target.files?.[0] ?? null)} />
          </label>
        </div>

        <button
          disabled={busy}
          onClick={onSubmit}
          style={{
            padding: 12,
            borderRadius: 12,
            fontWeight: 700,
            opacity: busy ? 0.6 : 1
          }}
        >
          {busy ? "Subiendo…" : "Crear + Subir"}
        </button>

        {lastPreviewUrl ? (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Preview subida</div>
            <img src={lastPreviewUrl} style={{ width: "100%", maxWidth: 520, borderRadius: 12 }} />
          </div>
        ) : null}

        <div style={{ marginTop: 10 }}>
          <div style={{ fontWeight: 700 }}>Log</div>
          <ul style={{ marginTop: 6, paddingLeft: 18 }}>
            {log.map((l, i) => (
              <li key={i} style={{ fontFamily: "ui-monospace, SFMono-Regular", fontSize: 12 }}>
                {l}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}