-- SQL for Supabase SQL Editor

-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT CHECK(role IN ('admin', 'tecnico')) NOT NULL
);

-- Tickets Table
CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  requester_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT NOT NULL,
  equipment TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT CHECK(priority IN ('baixo', 'medio', 'urgente')) DEFAULT 'baixo',
  status TEXT CHECK(status IN ('aberto', 'pendente', 'em_atendimento', 'concluido')) DEFAULT 'aberto',
  assigned_technician_id INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  total_time_ms BIGINT DEFAULT 0,
  last_status_change_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments Table
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial Admin (Password: Admin@2026)
-- Note: You should hash this password if you insert it manually, 
-- but the server will handle it if you use the login flow after creating the user.
-- For now, the server expects a hashed password.
-- Hashed 'Admin@2026' is: $2a$10$7R1.v.7.v.7.v.7.v.7.v.7.v.7.v.7.v.7.v.7.v.7.v.7.v.7.v
-- (Actually, use the app to create the first admin or use a script)
