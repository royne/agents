-- Índices de rendimiento para consultas frecuentes
-- Ejecutar en Supabase

-- profiles: acceso por user_id y por company_id
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(user_id);
CREATE INDEX IF NOT EXISTS profiles_company_id_idx ON profiles(company_id);

-- campaigns: filtros por company_id y status
CREATE INDEX IF NOT EXISTS campaigns_company_id_idx ON campaigns(company_id);
CREATE INDEX IF NOT EXISTS campaigns_company_status_idx ON campaigns(company_id, status);

-- campaign_daily_records: filtros por campaign_id y date
CREATE INDEX IF NOT EXISTS campaign_daily_records_campaign_id_idx ON campaign_daily_records(campaign_id);
CREATE INDEX IF NOT EXISTS campaign_daily_records_campaign_date_idx ON campaign_daily_records(campaign_id, date);

-- tasks: filtros por profile_id y orden por due_date
CREATE INDEX IF NOT EXISTS tasks_profile_id_idx ON tasks(profile_id);
CREATE INDEX IF NOT EXISTS tasks_due_date_idx ON tasks(due_date);

-- task_assignees: filtros por profile_id y task_id
CREATE INDEX IF NOT EXISTS task_assignees_profile_id_idx ON task_assignees(profile_id);
CREATE INDEX IF NOT EXISTS task_assignees_task_id_idx ON task_assignees(task_id);

-- daily_summaries: filtros por company_id y date
CREATE INDEX IF NOT EXISTS daily_summaries_company_date_idx ON daily_summaries(company_id, date);

-- companies: ordenar por name
CREATE INDEX IF NOT EXISTS companies_name_idx ON companies(name);
