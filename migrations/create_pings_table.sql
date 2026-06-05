-- Create tables for pings and ping_logs
CREATE TABLE IF NOT EXISTS pings (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  url TEXT NOT NULL,
  interval_mins INT NOT NULL DEFAULT 5,
  last_ping_at DATETIME NULL,
  last_status VARCHAR(32) NULL,
  last_response_ms INT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ping_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  ping_id VARCHAR(50) NOT NULL,
  status VARCHAR(32) NOT NULL,
  http_status INT NULL,
  response_ms INT NULL,
  checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ping_id) REFERENCES pings(id) ON DELETE CASCADE
);
