//tabla users y tasks, compatible con postgresql y login con google

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),   -- Identificador único del usuario
  name TEXT NOT NULL,                               -- Nombre del usuario
  email TEXT UNIQUE NOT NULL,                       -- Email del usuario
  picture TEXT,                                    -- URL de la foto de perfil (Google devuelve este campo)
  password TEXT,                                   -- Contraseña (se puede dejar vacía si es login con Google)
  google_id TEXT UNIQUE,                           -- Identificador único de Google
  auth_provider TEXT DEFAULT 'local',              -- Identifica el proveedor de autenticación: 'google' o 'local'
  created_at TIMESTAMP DEFAULT now(),              -- Fecha de creación del usuario
  updated_at TIMESTAMP DEFAULT now()               -- Fecha de actualización del usuario
);

-- Agregar un índice para la búsqueda rápida por google_id
CREATE INDEX idx_google_id ON users (google_id);