export interface Env {
  DB: D1Database;
}

function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  // CORS (dev-friendly)
  headers.set("access-control-allow-origin", "*");
  headers.set("access-control-allow-methods", "GET,POST,PATCH,DELETE,OPTIONS");
  headers.set("access-control-allow-headers", "content-type,x-invite-code");
  return new Response(JSON.stringify(data), { ...init, headers });
}

function text(msg: string, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "text/plain; charset=utf-8");
  headers.set("access-control-allow-origin", "*");
  headers.set("access-control-allow-methods", "GET,POST,PATCH,DELETE,OPTIONS");
  headers.set("access-control-allow-headers", "content-type,x-invite-code");
  return new Response(msg, { ...init, headers });
}

function bad(msg: string, status = 400) {
  return text(msg, { status });
}

function unauthorized(msg = "Unauthorized") {
  return text(msg, { status: 401 });
}

function uuidv4() {
  return crypto.randomUUID();
}

// Generate invite code: 8-10 chars, uppercase/numbers, optional hyphen
function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I, O, 0, 1
  const len = 8 + Math.floor(Math.random() * 3); // 8-10 chars
  let code = "";
  for (let i = 0; i < len; i++) {
    if (i === 4 && Math.random() > 0.5) {
      code += "-";
    } else {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return code;
}

// Get couple_id from invite_code
async function getCoupleIdFromInviteCode(env: Env, inviteCode: string): Promise<string | null> {
  const stmt = env.DB.prepare("SELECT id FROM couples WHERE invite_code = ?").bind(inviteCode);
  const result = await stmt.first<{ id: string }>();
  return result?.id ?? null;
}

// Require invite code and return couple_id
async function requireAuth(req: Request, env: Env): Promise<string | null> {
  const inviteCode = req.headers.get("x-invite-code");
  if (!inviteCode) return null;
  return await getCoupleIdFromInviteCode(env, inviteCode);
}

// super-light rate limit: 1 req/sec per Worker instance
let lastGeocodeAt = 0;

async function handleGeocode(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const limit = Math.min(Number(url.searchParams.get("limit") || "6") || 6, 10);

  if (q.length < 2) return json([]);

  const now = Date.now();
  // Rate limit: 1.2초 간격 (더 여유있게)
  if (now - lastGeocodeAt < 1200) {
    return bad("Rate limited: try again in a second.", 429);
  }
  lastGeocodeAt = now;

  const target = new URL("https://nominatim.openstreetmap.org/search");
  target.searchParams.set("format", "jsonv2");
  target.searchParams.set("addressdetails", "1");
  target.searchParams.set("limit", String(limit));
  target.searchParams.set("q", q);

  const res = await fetch(target.toString(), {
    headers: {
      "user-agent": "CoupleMap/1.0 (contact: sihnrila@github.com)",
      "accept-language": "ko",
      "referer": "https://couplemap-api.oo8923.workers.dev",
    },
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    return bad(t || `Geocode error: ${res.status}`, 502);
  }
  const data = await res.json();
  return json(data);
}

// Couple APIs
async function handleCoupleCreate(req: Request, env: Env) {
  const id = uuidv4();
  const inviteCode = generateInviteCode();
  const createdAt = new Date().toISOString();

  try {
    await env.DB.prepare("INSERT INTO couples (id, invite_code, created_at) VALUES (?, ?, ?)")
      .bind(id, inviteCode, createdAt)
      .run();
  } catch (e: any) {
    // Retry if invite code collision (unlikely)
    if (e?.message?.includes("UNIQUE")) {
      return handleCoupleCreate(req, env);
    }
    return bad(e?.message || "DB insert failed", 500);
  }

  return json({ inviteCode, coupleId: id });
}

async function handleCoupleJoin(req: Request, env: Env) {
  const body = await req.json().catch(() => null) as any;
  if (!body) return bad("Invalid JSON body");

  const inviteCode = String(body.inviteCode || "").trim();
  if (!inviteCode) return bad("Missing inviteCode");

  const coupleId = await getCoupleIdFromInviteCode(env, inviteCode);
  if (!coupleId) return bad("Invalid invite code", 404);

  return json({ coupleId });
}

async function handleCoupleRotate(req: Request, env: Env) {
  const coupleId = await requireAuth(req, env);
  if (!coupleId) return unauthorized();

  const newInviteCode = generateInviteCode();
  try {
    await env.DB.prepare("UPDATE couples SET invite_code = ? WHERE id = ?")
      .bind(newInviteCode, coupleId)
      .run();
  } catch (e: any) {
    if (e?.message?.includes("UNIQUE")) {
      return handleCoupleRotate(req, env); // Retry
    }
    return bad(e?.message || "DB update failed", 500);
  }

  return json({ inviteCode: newInviteCode });
}

// Folder APIs
async function handleFoldersList(req: Request, env: Env) {
  const coupleId = await requireAuth(req, env);
  if (!coupleId) return unauthorized();

  const stmt = env.DB.prepare(
    "SELECT id, couple_id, name, color, icon, sort, created_at FROM folders WHERE couple_id = ? ORDER BY sort ASC, created_at ASC"
  ).bind(coupleId);

  const { results } = await stmt.all();
  const mapped = (results || []).map((r: any) => ({
    id: r.id,
    couple_id: r.couple_id,
    name: r.name,
    color: r.color,
    icon: r.icon ?? null,
    sort: r.sort,
    created_at: r.created_at,
  }));

  return json(mapped);
}

async function handleFoldersCreate(req: Request, env: Env) {
  const coupleId = await requireAuth(req, env);
  if (!coupleId) return unauthorized();

  const body = await req.json().catch(() => null) as any;
  if (!body) return bad("Invalid JSON body");

  const name = String(body.name || "").trim();
  const color = String(body.color || "").trim();
  const icon = body.icon != null ? String(body.icon) : null;
  const sort = Number.isFinite(Number(body.sort)) ? Number(body.sort) : 0;

  if (!name) return bad("Missing name");
  if (!color) return bad("Missing color");

  const id = uuidv4();
  const createdAt = new Date().toISOString();

  try {
    await env.DB.prepare(
      "INSERT INTO folders (id, couple_id, name, color, icon, sort, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
      .bind(id, coupleId, name, color, icon, sort, createdAt)
      .run();
  } catch (e: any) {
    return bad(e?.message || "DB insert failed", 500);
  }

  return json({
    id,
    couple_id: coupleId,
    name,
    color,
    icon,
    sort,
    created_at: createdAt,
  });
}

async function handleFoldersUpdate(req: Request, env: Env, folderId: string) {
  const coupleId = await requireAuth(req, env);
  if (!coupleId) return unauthorized();

  const body = await req.json().catch(() => null) as any;
  if (!body) return bad("Invalid JSON body");

  // Verify folder belongs to couple
  const check = await env.DB.prepare("SELECT id FROM folders WHERE id = ? AND couple_id = ?")
    .bind(folderId, coupleId)
    .first<{ id: string }>();
  if (!check) return bad("Folder not found", 404);

  const updates: string[] = [];
  const values: any[] = [];

  if (body.name != null) {
    const name = String(body.name).trim();
    if (name) {
      updates.push("name = ?");
      values.push(name);
    }
  }
  if (body.color != null) {
    const color = String(body.color).trim();
    if (color) {
      updates.push("color = ?");
      values.push(color);
    }
  }
  if (body.icon != null) {
    updates.push("icon = ?");
    values.push(body.icon ? String(body.icon) : null);
  }
  if (body.sort != null && Number.isFinite(Number(body.sort))) {
    updates.push("sort = ?");
    values.push(Number(body.sort));
  }

  if (updates.length === 0) return json({ id: folderId });

  values.push(folderId, coupleId);

  try {
    await env.DB.prepare(
      `UPDATE folders SET ${updates.join(", ")} WHERE id = ? AND couple_id = ?`
    )
      .bind(...values)
      .run();
  } catch (e: any) {
    return bad(e?.message || "DB update failed", 500);
  }

  return json({ id: folderId });
}

async function handleFoldersDelete(req: Request, env: Env, folderId: string) {
  const coupleId = await requireAuth(req, env);
  if (!coupleId) return unauthorized();

  // Verify folder belongs to couple
  const check = await env.DB.prepare("SELECT id FROM folders WHERE id = ? AND couple_id = ?")
    .bind(folderId, coupleId)
    .first<{ id: string }>();
  if (!check) return bad("Folder not found", 404);

  try {
    // Delete folder and clear folder_id from places
    await env.DB.batch([
      env.DB.prepare("DELETE FROM folders WHERE id = ? AND couple_id = ?").bind(folderId, coupleId),
      env.DB.prepare("UPDATE places SET folder_id = NULL WHERE couple_id = ? AND folder_id = ?")
        .bind(coupleId, folderId),
    ]);
  } catch (e: any) {
    return bad(e?.message || "DB delete failed", 500);
  }

  return json({ success: true });
}

// Place APIs
async function handlePlacesList(req: Request, env: Env) {
  const coupleId = await requireAuth(req, env);
  if (!coupleId) return unauthorized();

  const stmt = env.DB.prepare(
    "SELECT id, couple_id, folder_id, title, memo, lat, lng, visited_at, tags_json, source, source_id, created_at FROM places WHERE couple_id = ? ORDER BY created_at DESC"
  ).bind(coupleId);

  const { results } = await stmt.all();

  const mapped = (results || []).map((r: any) => ({
    id: r.id,
    couple_id: r.couple_id,
    folder_id: r.folder_id ?? null,
    title: r.title,
    memo: r.memo ?? null,
    lat: r.lat,
    lng: r.lng,
    visited_at: r.visited_at ?? null,
    tags: safeJsonArray(r.tags_json),
    source: r.source ?? null,
    source_id: r.source_id ?? null,
    created_at: r.created_at,
  }));

  return json(mapped);
}

function safeJsonArray(s: string): string[] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

async function handlePlacesCreate(req: Request, env: Env) {
  const coupleId = await requireAuth(req, env);
  if (!coupleId) return unauthorized();

  const body = await req.json().catch(() => null) as any;
  if (!body) return bad("Invalid JSON body");

  const title = String(body.title || "").trim();
  const memo = body.memo != null ? String(body.memo) : null;
  const folder_id = body.folder_id ? String(body.folder_id).trim() : null;
  const lat = Number(body.lat);
  const lng = Number(body.lng);
  const visited_at = body.visited_at ? String(body.visited_at) : null;

  const tags = Array.isArray(body.tags) ? body.tags.filter((t: any) => typeof t === "string") : [];
  const source = body.source != null ? String(body.source) : null;
  const source_id = body.source_id != null ? String(body.source_id) : null;
  const created_at = body.created_at ? String(body.created_at) : new Date().toISOString();

  if (!title) return bad("Missing title");
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return bad("Invalid lat/lng");

  // Verify folder belongs to couple if provided
  if (folder_id) {
    const check = await env.DB.prepare("SELECT id FROM folders WHERE id = ? AND couple_id = ?")
      .bind(folder_id, coupleId)
      .first<{ id: string }>();
    if (!check) return bad("Folder not found", 404);
  }

  const id = uuidv4();

  try {
    await env.DB.prepare(
      "INSERT INTO places (id, couple_id, folder_id, title, memo, lat, lng, visited_at, tags_json, source, source_id, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)"
    ).bind(
      id,
      coupleId,
      folder_id,
      title,
      memo,
      lat,
      lng,
      visited_at,
      JSON.stringify(tags),
      source,
      source_id,
      created_at
    ).run();
  } catch (e: any) {
    return bad(e?.message || "DB insert failed", 409);
  }

  return json({
    id,
    couple_id: coupleId,
    folder_id,
    title,
    memo,
    lat,
    lng,
    visited_at,
    tags,
    source,
    source_id,
    created_at,
  });
}

async function handlePlacesUpdate(req: Request, env: Env, placeId: string) {
  const coupleId = await requireAuth(req, env);
  if (!coupleId) return unauthorized();

  const body = await req.json().catch(() => null) as any;
  if (!body) return bad("Invalid JSON body");

  // Verify place belongs to couple
  const check = await env.DB.prepare("SELECT id FROM places WHERE id = ? AND couple_id = ?")
    .bind(placeId, coupleId)
    .first<{ id: string }>();
  if (!check) return bad("Place not found", 404);

  const updates: string[] = [];
  const values: any[] = [];

  if (body.folder_id !== undefined) {
    const folder_id = body.folder_id ? String(body.folder_id).trim() : null;
    if (folder_id) {
      // Verify folder belongs to couple
      const folderCheck = await env.DB.prepare("SELECT id FROM folders WHERE id = ? AND couple_id = ?")
        .bind(folder_id, coupleId)
        .first<{ id: string }>();
      if (!folderCheck) return bad("Folder not found", 404);
    }
    updates.push("folder_id = ?");
    values.push(folder_id);
  }

  if (body.title != null) {
    const title = String(body.title).trim();
    if (title) {
      updates.push("title = ?");
      values.push(title);
    }
  }
  if (body.memo !== undefined) {
    updates.push("memo = ?");
    values.push(body.memo != null ? String(body.memo) : null);
  }
  if (body.visited_at !== undefined) {
    updates.push("visited_at = ?");
    values.push(body.visited_at ? String(body.visited_at) : null);
  }
  if (body.tags !== undefined) {
    const tags = Array.isArray(body.tags) ? body.tags.filter((t: any) => typeof t === "string") : [];
    updates.push("tags_json = ?");
    values.push(JSON.stringify(tags));
  }

  if (updates.length === 0) return json({ id: placeId });

  values.push(placeId, coupleId);

  try {
    await env.DB.prepare(
      `UPDATE places SET ${updates.join(", ")} WHERE id = ? AND couple_id = ?`
    )
      .bind(...values)
      .run();
  } catch (e: any) {
    return bad(e?.message || "DB update failed", 500);
  }

  return json({ id: placeId });
}

export default {
  async fetch(req: Request, env: Env) {
    if (req.method === "OPTIONS") return text("", { status: 204 });

    const url = new URL(req.url);
    const pathname = url.pathname;

    // Public endpoints
    if (pathname === "/api/geocode" && req.method === "GET") return handleGeocode(req);
    if (pathname === "/api/couple/create" && req.method === "POST") return handleCoupleCreate(req, env);
    if (pathname === "/api/couple/join" && req.method === "POST") return handleCoupleJoin(req, env);

    // Protected endpoints (require x-invite-code header)
    if (pathname === "/api/couple/rotate" && req.method === "POST") return handleCoupleRotate(req, env);

    if (pathname === "/api/folders" && req.method === "GET") return handleFoldersList(req, env);
    if (pathname === "/api/folders" && req.method === "POST") return handleFoldersCreate(req, env);

    const folderMatch = pathname.match(/^\/api\/folders\/([^/]+)$/);
    if (folderMatch && req.method === "PATCH") {
      return handleFoldersUpdate(req, env, folderMatch[1]);
    }
    if (folderMatch && req.method === "DELETE") {
      return handleFoldersDelete(req, env, folderMatch[1]);
    }

    if (pathname === "/api/places" && req.method === "GET") return handlePlacesList(req, env);
    if (pathname === "/api/places" && req.method === "POST") return handlePlacesCreate(req, env);

    const placeMatch = pathname.match(/^\/api\/places\/([^/]+)$/);
    if (placeMatch && req.method === "PATCH") {
      return handlePlacesUpdate(req, env, placeMatch[1]);
    }

    return bad("Not found", 404);
  },
};
