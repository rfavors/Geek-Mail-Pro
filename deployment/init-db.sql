-- Initialize database for Geek Mail Pro
-- This script runs automatically when the PostgreSQL container starts

-- Create the main database if it doesn't exist
SELECT 'CREATE DATABASE geek_mail_pro'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'geek_mail_pro')\gexec

-- Connect to the database
\c geek_mail_pro;

-- Create extensions if they don't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'UTC';

-- Create indexes for better performance (these will be created by Drizzle migrations)
-- But we can prepare the database with some initial settings

-- Set default permissions
GRANT ALL PRIVILEGES ON DATABASE geek_mail_pro TO postgres;

-- Log the initialization
SELECT 'Database initialized successfully' AS status;