/**
 * Cloudflare Worker — vrmap API v2
 */

export interface Env {
  DB: D1Database
  BUCKET: R2Bucket
  R2_PUBLIC_URL: string
  ADMIN_SECRET: string
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Max-Age': '86400',
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  })

const err = (msg: string, status = 400) => json({ error: msg }, status)

const isAuthed = (req: Request, env: Env) =>
  req.headers.get('Authorization') === `Bearer ${env.ADMIN_SECRET}`

// R2のキーをURLから取り出す
function r2KeyFromUrl(url: string | null, publicUrl: string): string | null {
  if (!url || !url.startsWith(publicUrl)) return null
  return url.replace(publicUrl + '/', '')
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const { pathname: p } = new URL(req.url)
    const method = req.method

    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    // ── 公開API ─────────────────────────────────────────
    if (method === 'GET' && p === '/api/areas') {
      const { results } = await env.DB.prepare(
        'SELECT * FROM areas ORDER BY created_at ASC'
      ).all()
      return json(results)
    }

    if (method === 'GET' && /^\/api\/areas\/[^/]+$/.test(p)) {
      const id = p.split('/')[3]
      const row = await env.DB.prepare('SELECT * FROM areas WHERE id=?').bind(id).first()
      return row ? json(row) : err('Not found', 404)
    }

    if (method === 'GET' && /^\/api\/areas\/[^/]+\/seats$/.test(p)) {
      const areaId = p.split('/')[3]
      const { results } = await env.DB.prepare(
        'SELECT * FROM seats WHERE area_id=? ORDER BY created_at ASC'
      ).bind(areaId).all()
      return json(results)
    }

    // ── 認証チェック ────────────────────────────────────
    if (!isAuthed(req, env)) {
      return err('Unauthorized', 401)
    }

    // ── 管理API ─────────────────────────────────────────
    if (method === 'POST' && p === '/api/areas') {
      const b = await req.json() as Record<string, unknown>
      if (b._check) return json({ ok: true })
      const id = crypto.randomUUID()
      await env.DB.prepare(`
        INSERT INTO areas (id,label,x,y,desc,detail_map_url,created_at,updated_at)
        VALUES (?,?,?,?,?,?,datetime('now'),datetime('now'))
      `).bind(id, b.label, b.x ?? 50, b.y ?? 50, b.desc ?? '', b.detail_map_url ?? null).run()
      return json(await env.DB.prepare('SELECT * FROM areas WHERE id=?').bind(id).first(), 201)
    }

    if (method === 'PUT' && /^\/api\/areas\/[^/]+$/.test(p)) {
      const id = p.split('/')[3]
      const b = await req.json() as Record<string, unknown>
      // 古い画像URLを取得して差し替えがあればR2から削除
      const old = await env.DB.prepare('SELECT detail_map_url FROM areas WHERE id=?').bind(id).first() as Record<string, unknown> | null
      if (old?.detail_map_url && old.detail_map_url !== b.detail_map_url) {
        const key = r2KeyFromUrl(old.detail_map_url as string, env.R2_PUBLIC_URL)
        if (key) await env.BUCKET.delete(key)
      }
      await env.DB.prepare(`
        UPDATE areas SET
          label=COALESCE(?,label), x=COALESCE(?,x), y=COALESCE(?,y),
          desc=COALESCE(?,desc), detail_map_url=?,
          updated_at=datetime('now')
        WHERE id=?
      `).bind(b.label??null, b.x??null, b.y??null, b.desc??null, b.detail_map_url??null, id).run()
      return json(await env.DB.prepare('SELECT * FROM areas WHERE id=?').bind(id).first())
    }

    if (method === 'DELETE' && /^\/api\/areas\/[^/]+$/.test(p)) {
      const id = p.split('/')[3]
      // エリアの拡大マップ画像を削除
      const area = await env.DB.prepare('SELECT detail_map_url FROM areas WHERE id=?').bind(id).first() as Record<string, unknown> | null
      if (area?.detail_map_url) {
        const key = r2KeyFromUrl(area.detail_map_url as string, env.R2_PUBLIC_URL)
        if (key) await env.BUCKET.delete(key)
      }
      // 紐づく座席の360°画像も削除
      const { results: seats } = await env.DB.prepare('SELECT pano_url FROM seats WHERE area_id=?').bind(id).all() as { results: Record<string, unknown>[] }
      for (const seat of seats) {
        if (seat.pano_url) {
          const key = r2KeyFromUrl(seat.pano_url as string, env.R2_PUBLIC_URL)
          if (key) await env.BUCKET.delete(key)
        }
      }
      await env.DB.prepare('DELETE FROM areas WHERE id=?').bind(id).run()
      return json({ ok: true })
    }

    if (method === 'POST' && p === '/api/seats') {
      const b = await req.json() as Record<string, unknown>
      const id = crypto.randomUUID()
      await env.DB.prepare(`
        INSERT INTO seats (id,area_id,label,x,y,pano_url,ticket_url,pitch,yaw,hfov,created_at,updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,datetime('now'),datetime('now'))
      `).bind(
        id, b.area_id, b.label,
        b.x ?? 50, b.y ?? 50,
        b.pano_url ?? null, b.ticket_url ?? null,
        b.pitch ?? 0, b.yaw ?? 0, b.hfov ?? 100
      ).run()
      return json(await env.DB.prepare('SELECT * FROM seats WHERE id=?').bind(id).first(), 201)
    }

    if (method === 'PUT' && /^\/api\/seats\/[^/]+$/.test(p)) {
      const id = p.split('/')[3]
      const b = await req.json() as Record<string, unknown>
      // 古い360°画像を削除
      const old = await env.DB.prepare('SELECT pano_url FROM seats WHERE id=?').bind(id).first() as Record<string, unknown> | null
      if (old?.pano_url && old.pano_url !== b.pano_url) {
        const key = r2KeyFromUrl(old.pano_url as string, env.R2_PUBLIC_URL)
        if (key) await env.BUCKET.delete(key)
      }
      await env.DB.prepare(`
        UPDATE seats SET
          label=COALESCE(?,label), x=COALESCE(?,x), y=COALESCE(?,y),
          pano_url=?, ticket_url=?,
          pitch=COALESCE(?,pitch), yaw=COALESCE(?,yaw), hfov=COALESCE(?,hfov),
          updated_at=datetime('now')
        WHERE id=?
      `).bind(b.label??null, b.x??null, b.y??null, b.pano_url??null, b.ticket_url??null, b.pitch??null, b.yaw??null, b.hfov??null, id).run()
      return json(await env.DB.prepare('SELECT * FROM seats WHERE id=?').bind(id).first())
    }

    if (method === 'DELETE' && /^\/api\/seats\/[^/]+$/.test(p)) {
      const id = p.split('/')[3]
      // 360°画像をR2から削除
      const seat = await env.DB.prepare('SELECT pano_url FROM seats WHERE id=?').bind(id).first() as Record<string, unknown> | null
      if (seat?.pano_url) {
        const key = r2KeyFromUrl(seat.pano_url as string, env.R2_PUBLIC_URL)
        if (key) await env.BUCKET.delete(key)
      }
      await env.DB.prepare('DELETE FROM seats WHERE id=?').bind(id).run()
      return json({ ok: true })
    }

    if (method === 'POST' && p === '/api/upload/presign') {
      const { filename, contentType } = await req.json() as { filename: string; contentType: string }
      const key = `panoramas/${crypto.randomUUID()}-${filename}`
      return json({
        uploadUrl: `${env.R2_PUBLIC_URL}/upload/${key}`,
        publicUrl: `${env.R2_PUBLIC_URL}/${key}`,
      })
    }

    return err('Not found', 404)
  },
}
