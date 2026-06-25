-- BEPS 2026 Room Management Database Schema
-- Rooms are created by delegates at runtime (no pre-seeded rooms).

-- Remove legacy room data if migrating an existing database
DELETE FROM room_members;
DELETE FROM room;

DROP VIEW IF EXISTS room_status;

CREATE TABLE IF NOT EXISTS room (
    id SERIAL PRIMARY KEY,
    room_code VARCHAR(8) NOT NULL UNIQUE,
    room_type VARCHAR(20) NOT NULL CHECK (room_type IN ('individual', 'shared')),
    gender CHAR(1) NOT NULL CHECK (gender IN ('M', 'F')),
    room_id VARCHAR(32) NOT NULL UNIQUE,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE room
ADD COLUMN IF NOT EXISTS room_type VARCHAR(20) NOT NULL DEFAULT 'shared'
CHECK (room_type IN ('individual', 'shared'));

CREATE TABLE IF NOT EXISTS room_members (
    id SERIAL PRIMARY KEY,
    room_id VARCHAR(32) NOT NULL REFERENCES room(room_id) ON DELETE CASCADE,
    registration_id VARCHAR(100) NOT NULL UNIQUE,
    user_name VARCHAR(100) NOT NULL,
    gender CHAR(1) NOT NULL CHECK (gender IN ('M', 'F')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_room_code ON room(room_code);
CREATE INDEX IF NOT EXISTS idx_room_gender ON room(gender);
CREATE INDEX IF NOT EXISTS idx_room_type ON room(room_type);
CREATE INDEX IF NOT EXISTS idx_room_members_room_id ON room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_room_members_registration_id ON room_members(registration_id);

CREATE OR REPLACE VIEW room_status AS
SELECT
    r.id,
    r.room_code,
    r.room_type,
    r.gender,
    r.room_id,
    r.capacity,
    r.created_by,
    COALESCE(COUNT(rm.id), 0) AS occupied,
    (r.capacity - COALESCE(COUNT(rm.id), 0)) AS available_spots,
    CASE
        WHEN COALESCE(COUNT(rm.id), 0) >= r.capacity THEN 'FULL'
        WHEN COALESCE(COUNT(rm.id), 0) = 0 THEN 'EMPTY'
        ELSE 'AVAILABLE'
    END AS status,
    r.created_at,
    r.updated_at
FROM room r
LEFT JOIN room_members rm ON r.room_id = rm.room_id
GROUP BY r.id, r.room_code, r.room_type, r.gender, r.room_id, r.capacity, r.created_by, r.created_at, r.updated_at
ORDER BY r.created_at DESC;
