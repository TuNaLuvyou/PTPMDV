-- Khởi tạo 5 database riêng (database-per-service) cho môi trường local.
-- Production dùng 5 link Supabase riêng qua DATABASE_URL của từng service.
SELECT 'CREATE DATABASE hrm_identity' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'hrm_identity')\gexec
SELECT 'CREATE DATABASE hrm_organization' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'hrm_organization')\gexec
SELECT 'CREATE DATABASE hrm_work' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'hrm_work')\gexec
SELECT 'CREATE DATABASE hrm_payroll' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'hrm_payroll')\gexec
SELECT 'CREATE DATABASE hrm_integration' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'hrm_integration')\gexec
