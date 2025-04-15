-- Tabla para refresh tokens
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT now()
);

--Alter para añadir expires_at
ALTER TABLE refresh_tokens
ADD COLUMN expires_at TIMESTAMP DEFAULT (now() + INTERVAL '7 days');