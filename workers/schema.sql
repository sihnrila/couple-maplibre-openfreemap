-- D1 schema for couples, folders, and places

-- Couples table
CREATE TABLE IF NOT EXISTS couples (
  id TEXT PRIMARY KEY,
  invite_code TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);

-- Folders table
CREATE TABLE IF NOT EXISTS folders (
  id TEXT PRIMARY KEY,
  couple_id TEXT NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT,
  sort INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

-- Places table
CREATE TABLE IF NOT EXISTS places (
  id TEXT PRIMARY KEY,
  couple_id TEXT NOT NULL,
  folder_id TEXT,
  title TEXT NOT NULL,
  memo TEXT,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  visited_at TEXT,
  tags_json TEXT NOT NULL DEFAULT '[]',
  source TEXT,
  source_id TEXT,
  created_at TEXT NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_folders_couple_sort ON folders (couple_id, sort);
CREATE INDEX IF NOT EXISTS idx_places_couple_created ON places (couple_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_places_folder ON places (folder_id);

-- Optional unique guard for 'same source place'
CREATE UNIQUE INDEX IF NOT EXISTS uq_places_source
ON places (couple_id, source, source_id);
