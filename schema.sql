-- vrmap D1 スキーマ（v2）
-- 適用: wrangler d1 execute vrmap-db --remote --file=./schema.sql

-- エリアテーブル（会場マップ上の大区画）
CREATE TABLE IF NOT EXISTS areas (
  id              TEXT PRIMARY KEY,
  label           TEXT NOT NULL,
  x               REAL NOT NULL DEFAULT 50,
  y               REAL NOT NULL DEFAULT 50,
  desc            TEXT NOT NULL DEFAULT '',
  detail_map_url  TEXT,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
);

-- 座席テーブル（拡大マップ上の個別座席）
CREATE TABLE IF NOT EXISTS seats (
  id          TEXT PRIMARY KEY,
  area_id     TEXT NOT NULL REFERENCES areas(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  x           REAL NOT NULL DEFAULT 50,
  y           REAL NOT NULL DEFAULT 50,
  pano_url    TEXT,
  ticket_url  TEXT,
  pitch       REAL NOT NULL DEFAULT 0,
  yaw         REAL NOT NULL DEFAULT 0,
  hfov        REAL NOT NULL DEFAULT 100,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_seats_area_id ON seats(area_id);
