-- CronBoy Database Schema
-- PostgreSQL with UUID support

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('Superadmin', 'Admin', 'Viewer')),
  policies TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subdomains/Monitors table
CREATE TABLE subdomains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subdomain VARCHAR(255) UNIQUE NOT NULL,
  env VARCHAR(50) NOT NULL CHECK (env IN ('Production', 'Staging', 'Dev')),
  status VARCHAR(50) NOT NULL CHECK (status IN ('healthy', 'degraded', 'down', 'paused')),
  last_checked TIMESTAMP,
  response_time INTEGER DEFAULT 0,
  uptime DECIMAL(5,2) DEFAULT 100.0,
  ssl_issuer VARCHAR(255),
  ssl_expiry_days INTEGER,
  linked_cron UUID REFERENCES cron_jobs(id) ON DELETE SET NULL,
  cron_schedule VARCHAR(255),
  check_interval VARCHAR(50),
  ssl_auto_renew BOOLEAN DEFAULT false,
  history INTEGER[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cron Jobs table
CREATE TABLE cron_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  schedule VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'paused', 'failed')),
  last_run TIMESTAMP,
  next_run TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Alert Rules table
CREATE TABLE alert_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  condition VARCHAR(255) NOT NULL,
  threshold INTEGER,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Logs table
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subdomain_id UUID REFERENCES subdomains(id) ON DELETE CASCADE,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50),
  duration VARCHAR(50),
  message TEXT,
  response_code INTEGER
);

-- Reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  domain_ids UUID[] NOT NULL,
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('summary', 'detailed', 'critical')),
  sent_via VARCHAR(50) NOT NULL CHECK (sent_via IN ('whatsapp', 'email', 'webhook')),
  recipient_phone VARCHAR(20),
  recipient_email VARCHAR(255),
  content TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP
);

-- WhatsApp Message Log table
CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) NOT NULL,
  message_text TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP
);

-- Audit Log table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(100),
  resource_id UUID,
  changes JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_subdomains_env ON subdomains(env);
CREATE INDEX idx_subdomains_status ON subdomains(status);
CREATE INDEX idx_logs_subdomain_id ON logs(subdomain_id);
CREATE INDEX idx_logs_timestamp ON logs(timestamp);
CREATE INDEX idx_cron_jobs_status ON cron_jobs(status);
CREATE INDEX idx_alert_rules_enabled ON alert_rules(enabled);
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_created_at ON reports(created_at);
CREATE INDEX idx_whatsapp_messages_status ON whatsapp_messages(status);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
