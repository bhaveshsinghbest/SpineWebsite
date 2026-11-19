-- Equivalent manual setup (any OS), run as a PostgreSQL superuser:
--   psql -U postgres -v app_password=choose-a-strong-password -f database/scripts/setup-database.sql
-- Then set DATABASE_URL=postgres://spine_app:<password>@<host>:5432/spine_advisory in backend/.env
-- and run:  cd backend && npm run db:setup

SELECT format('CREATE ROLE spine_app LOGIN PASSWORD %L', :'app_password')
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'spine_app') \gexec

SELECT 'CREATE DATABASE spine_advisory OWNER spine_app ENCODING ''UTF8'' TEMPLATE template0'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'spine_advisory') \gexec

SELECT 'CREATE DATABASE spine_advisory_test OWNER spine_app ENCODING ''UTF8'' TEMPLATE template0'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'spine_advisory_test') \gexec
