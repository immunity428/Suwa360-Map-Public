// ── エリア（会場マップ上の大区画）──────────────────
export interface Area {
  id: string
  label: string
  x: number             // 会場マップ上X位置（%）
  y: number             // 会場マップ上Y位置（%）
  desc: string
  detail_map_url: string | null  // 拡大マップ画像URL（R2）
  created_at?: string
  updated_at?: string
}

export type AreaFormData = Omit<Area, 'id' | 'created_at' | 'updated_at'>

// ── 座席（拡大マップ上の個別座席）────────────────────
export interface Seat {
  id: string
  area_id: string       // 所属エリアID
  label: string         // 座席名（例: A列1番）
  x: number             // 拡大マップ上X位置（%）
  y: number             // 拡大マップ上Y位置（%）
  pano_url: string | null   // 360°画像URL（R2）遅延読み込み
  ticket_url: string | null // チケット購入リンク
  pitch: number
  yaw: number
  hfov: number
  created_at?: string
  updated_at?: string
}

export type SeatFormData = Omit<Seat, 'id' | 'created_at' | 'updated_at'>

// ── APIレスポンス ──────────────────────────────────
export interface ApiResponse<T> {
  data?: T
  error?: string
}
