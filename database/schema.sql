CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reflections (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    date TIMESTAMP DEFAULT NOW(),
    value_emoji TEXT NOT NULL,
    value_name TEXT NOT NULL,
    reflection TEXT NOT NULL,
    action TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reflections_user_id ON reflections(user_id);
