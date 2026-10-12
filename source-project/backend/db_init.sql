-- Run this file in your PostgreSQL prompt to initialize the database:
-- psql -U postgres -d postgres -f db_init.sql

CREATE DATABASE wbl_db;
\c wbl_db;

CREATE TABLE IF NOT EXISTS wbl_registrations (
  id SERIAL PRIMARY KEY,
  team_name VARCHAR(100) NOT NULL UNIQUE,
  captain_name VARCHAR(100) NOT NULL,
  captain_phone VARCHAR(20) NOT NULL,
  payment_mode VARCHAR(20) NOT NULL,
  team_logo_path VARCHAR(255),
  players JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
