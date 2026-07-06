-- ============================================
-- CronBoy Database Schema
-- MySQL/MariaDB Version (Fixed)
-- ============================================

CREATE DATABASE IF NOT EXISTS cronboy;
USE cronboy;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,  -- 'password' is also reserved!
  role ENUM('Superadmin', 'Admin', 'Viewer') NOT NULL,
  policies JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- CRON JOBS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cron_jobs (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  `schedule` VARCHAR(255) NOT NULL,  -- 'schedule' might be reserved
  `status` ENUM('active', 'paused', 'failed') NOT NULL,  -- 'status' is reserved
  last_run TIMESTAMP NULL,
  next_run TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- SUBDOMAINS/MONITORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subdomains (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  subdomain VARCHAR(255) UNIQUE NOT NULL,
  env ENUM('Production', 'Staging', 'Dev') NOT NULL,
  `status` ENUM('healthy', 'degraded', 'down', 'paused') NOT NULL,
  last_checked TIMESTAMP NULL,
  response_time INT DEFAULT 0,
  uptime DECIMAL(5,2) DEFAULT 100.00,
  ssl_issuer VARCHAR(255) NULL,
  ssl_expiry_days INT NULL,
  linked_cron CHAR(36) NULL,
  cron_schedule VARCHAR(255) NULL,
  check_interval VARCHAR(50) NULL,
  ssl_auto_renew BOOLEAN DEFAULT FALSE,
  `history` JSON DEFAULT NULL,  -- 'history' might be reserved
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (linked_cron) REFERENCES cron_jobs(id) ON DELETE SET NULL
);

-- ============================================
-- ALERT RULES TABLE (FIXED)
-- ============================================
CREATE TABLE IF NOT EXISTS alert_rules (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  rule_condition VARCHAR(255) NOT NULL,  -- ✅ Changed from 'condition'
  threshold INT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- PINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS pings (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(2048) NOT NULL,
  interval_mins INT DEFAULT 5,
  last_ping_at TIMESTAMP NULL,
  last_status VARCHAR(50) NULL,
  last_response_ms INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- PING LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ping_logs (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  ping_id CHAR(36) NOT NULL,
  status VARCHAR(50) NOT NULL,
  http_status INT NULL,
  response_ms INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ping_id) REFERENCES pings(id) ON DELETE CASCADE
);

-- ============================================
-- LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS logs (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  subdomain_id CHAR(36) NULL,
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- 'timestamp' is reserved
  `status` VARCHAR(50) NULL,
  duration VARCHAR(50) NULL,
  message TEXT NULL,
  response_code INT NULL,
  FOREIGN KEY (subdomain_id) REFERENCES subdomains(id) ON DELETE CASCADE
);

-- ============================================
-- REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NULL,
  domain_ids JSON NOT NULL,
  report_type ENUM('summary', 'detailed', 'critical') NOT NULL,
  sent_via ENUM('whatsapp', 'email', 'webhook') NOT NULL,
  recipient_phone VARCHAR(20) NULL,
  recipient_email VARCHAR(255) NULL,
  content TEXT NULL,
  `status` VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- WHATSAPP MESSAGE LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  report_id CHAR(36) NULL,
  phone_number VARCHAR(20) NOT NULL,
  message_text TEXT NULL,
  `status` ENUM('pending', 'sent', 'failed', 'delivered') DEFAULT 'pending',
  error_message TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP NULL,
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- ============================================
-- AUDIT LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NULL,
  `action` VARCHAR(255) NOT NULL,  -- 'action' is reserved
  resource_type VARCHAR(100) NULL,
  resource_id CHAR(36) NULL,
  changes JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_subdomains_env ON subdomains(env);
CREATE INDEX idx_subdomains_status ON subdomains(`status`);
CREATE INDEX idx_logs_subdomain_id ON logs(subdomain_id);
CREATE INDEX idx_logs_timestamp ON logs(`timestamp`);
CREATE INDEX idx_cron_jobs_status ON cron_jobs(`status`);
CREATE INDEX idx_alert_rules_enabled ON alert_rules(enabled);
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_created_at ON reports(created_at);
CREATE INDEX idx_whatsapp_messages_status ON whatsapp_messages(`status`);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);