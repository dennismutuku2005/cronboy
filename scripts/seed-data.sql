-- CronBoy Seed Data
-- This seeds the database with the existing mock data as real records

-- Seed users
INSERT INTO users (id, name, email, password, role, policies) VALUES
  ('user-1', 'Dennis Mutuku', 'dennismutuku', 'admin123321', 'Superadmin', ARRAY['Manage users', 'Manage monitors', 'View dashboards', 'Create jobs', 'Edit alerts']);

-- Seed subdomains (matching the 24 mock entries)
INSERT INTO subdomains (id, subdomain, env, status, last_checked, response_time, uptime, ssl_issuer, ssl_expiry_days, linked_cron, cron_schedule, check_interval, ssl_auto_renew, history) VALUES
  ('sub-1',  'api.cronboy.io',           'Production', 'healthy',  NOW() - INTERVAL '0 minutes', 142, 99.98, 'Let''s Encrypt Authority X3',  28,  'DB Backup Run',       '0 0 * * *',     '10s',  true,  ARRAY[142,138,145,140,139,141,143]),
  ('sub-2',  'auth.cronboy.io',          'Production', 'healthy',  NOW() - INTERVAL '2 minutes', 85,  99.95, 'DigiCert TLS RSA SHA256',      14,  'Session Cleaner',     '*/15 * * * *',  '5m',   true,  ARRAY[85,82,88,84,80,83,86]),
  ('sub-3',  'dashboard.cronboy.io',     'Production', 'healthy',  NOW() - INTERVAL '5 minutes', 182, 99.90, 'Sectigo Demo CA',              45,  'Uptime Sync',         '*/5 * * * *',   '1m',   true,  ARRAY[182,179,190,185,177,180,188]),
  ('sub-4',  'worker-1.cronboy.io',      'Production', 'degraded', NOW() - INTERVAL '1 minute',  480, 98.42, 'Let''s Encrypt Authority X3',  3,   'Queue Poller',        '* * * * *',     '30s',  false, ARRAY[480,510,460,490,520,440,410]),
  ('sub-5',  'billing.cronboy.io',       'Production', 'down',     NOW() - INTERVAL '0 minutes', 0,   94.20, 'Expired Let''s Encrypt CA',    -2,  'Subscription Re-bill','0 8 * * *',     '15m',  true,  ARRAY[0,0,190,192,185,188,190]),
  ('sub-6',  'staging-api.cronboy.io',    'Staging',   'healthy',  NOW() - INTERVAL '3 minutes', 110, 99.85, 'Let''s Encrypt Staging CA',    50,  'Staging DB Sync',     '0 */2 * * *',   '5m',   true,  ARRAY[110,115,108,112,105,110,114]),
  ('sub-7',  'staging-client.cronboy.io', 'Staging',   'paused',   NOW() - INTERVAL '1 hour',    0,   100.0, 'Let''s Encrypt Staging CA',    80,  'Assets Prefetch',     '0 0 * * 0',     '1h',   false, ARRAY[0,0,0,0,0,0,0]),
  ('sub-8',  'dev-api.cronboy.io',        'Dev',       'degraded', NOW() - INTERVAL '4 minutes', 310, 97.50, 'Self-Signed localhost',        120, 'Dev Logs Clear',      '0 0 * * *',     '15m',  false, ARRAY[310,290,320,280,240,260,305]),
  ('sub-9',  'dev-sandbox.cronboy.io',    'Dev',       'down',     NOW() - INTERVAL '0 minutes', 0,   88.10, 'Self-Signed localhost',        90,  'Sandbox Reset',       '*/30 * * * *',  '10m',  true,  ARRAY[0,0,110,115,120,0,105]),
  ('sub-10', 'postgres.cronboy.io',       'Production', 'healthy',  NOW() - INTERVAL '0 minutes', 45,  99.99, 'DigiCert TLS RSA SHA256',      60,  'Postgres Vacuum',     '0 2 * * *',     '5m',   true,  ARRAY[45,42,48,44,40,43,46]),
  ('sub-11', 'redis.cronboy.io',          'Production', 'healthy',  NOW() - INTERVAL '4 minutes', 30,  99.99, 'DigiCert TLS RSA SHA256',      60,  'Cache Eviction Trigger', '*/10 * * * *', '1m', true, ARRAY[30,28,35,32,29,31,33]),
  ('sub-12', 'graphql.cronboy.io',        'Production', 'healthy',  NOW() - INTERVAL '3 minutes', 195, 99.78, 'Sectigo Demo CA',              12,  'Schema Sync Checker', '0 */12 * * *',  '5m',   true,  ARRAY[195,180,210,199,188,192,201]),
  ('sub-13', 'mailer.cronboy.io',         'Production', 'degraded', NOW() - INTERVAL '2 minutes', 420, 98.90, 'Let''s Encrypt Authority X3',  5,   'Queue Bounce Cleaner','0 0 * * *',    '5m',   false, ARRAY[420,390,440,410,380,430,450]),
  ('sub-14', 'cdn.cronboy.io',            'Production', 'healthy',  NOW() - INTERVAL '0 minutes', 55,  99.99, 'GlobalSign CA',                150, 'Cache Purge Cron',     '0 4 * * *',     '15m',  true,  ARRAY[55,52,58,54,50,53,56]),
  ('sub-15', 'search-api.cronboy.io',     'Production', 'healthy',  NOW() - INTERVAL '5 minutes', 230, 99.80, 'Let''s Encrypt Authority X3',  40,  'Index Rebuilder',     '0 1 * * *',     '10m',  true,  ARRAY[230,210,250,240,220,235,242]),
  ('sub-16', 'staging-auth.cronboy.io',   'Staging',   'healthy',  NOW() - INTERVAL '4 minutes', 120, 99.90, 'Let''s Encrypt Staging CA',    50,  'Staging Session Reset','0 0 * * *',    '5m',   true,  ARRAY[120,115,125,118,110,122,128]),
  ('sub-17', 'staging-worker.cronboy.io', 'Staging',   'healthy',  NOW() - INTERVAL '0 minutes', 160, 99.40, 'Let''s Encrypt Staging CA',    50,  'Staging Queue Reset', '*/30 * * * *',  '2m',   true,  ARRAY[160,155,170,165,150,162,168]),
  ('sub-18', 'dev-db.cronboy.io',         'Dev',       'healthy',  NOW() - INTERVAL '0 minutes', 65,  99.99, 'Self-Signed localhost',        90,  'Dev DB Vacuum',       '0 0 * * *',     '15m',  false, ARRAY[65,62,68,64,60,63,66]),
  ('sub-19', 'dev-cache.cronboy.io',      'Dev',       'paused',   NOW() - INTERVAL '3 hours',   0,   100.0, 'Self-Signed localhost',        90,  'Cache Flusher',       '*/5 * * * *',   '5m',   false, ARRAY[0,0,0,0,0,0,0]),
  ('sub-20', 'analytics.cronboy.io',      'Production', 'healthy',  NOW() - INTERVAL '0 minutes', 290, 99.70, 'GlobalSign CA',                120, 'Report Aggregator',   '0 5 * * *',     '15m',  true,  ARRAY[290,270,310,295,280,285,300]),
  ('sub-21', 'admin.cronboy.io',          'Production', 'healthy',  NOW() - INTERVAL '1 minute',  110, 99.95, 'DigiCert TLS RSA SHA256',      80,  'Audit Logs Archiver', '0 0 1 * *',     '5m',   true,  ARRAY[110,105,115,108,107,112,114]),
  ('sub-22', 'webhooks.cronboy.io',       'Production', 'healthy',  NOW() - INTERVAL '0 minutes', 130, 99.85, 'Let''s Encrypt Authority X3',  45,  'Webhook Retries Handler', '*/5 * * * *', '1m', true, ARRAY[130,125,135,128,122,131,133]),
  ('sub-23', 'staging-cdn.cronboy.io',    'Staging',   'healthy',  NOW() - INTERVAL '5 minutes', 95,  99.95, 'Let''s Encrypt Staging CA',    50,  'Staging Cache Purge', '0 0 * * *',     '10m',  true,  ARRAY[95,90,100,93,88,92,98]),
  ('sub-24', 'dev-search.cronboy.io',     'Dev',       'healthy',  NOW() - INTERVAL '0 minutes', 180, 99.50, 'Self-Signed localhost',        90,  'Dev Index Rebuild',   '0 0 * * *',     '10m',  false, ARRAY[180,170,190,185,175,178,182]);

-- Seed alert rules
INSERT INTO alert_rules (id, name, condition, threshold, enabled) VALUES
  ('rule-1', 'Uptime Degraded Alert',        'Uptime drops below 99.0%',                            NULL, true),
  ('rule-2', 'SSL Certificate Expiry Warning','SSL Expiry is less than 7 days',                    NULL, true),
  ('rule-3', 'Down Service Notification',    'Subdomain health status changes to DOWN',             NULL, true),
  ('rule-4', 'Latency Spike Monitor',        'Response time exceeds 400ms for 3 checks',           NULL, false);

-- Seed incidents as logs
INSERT INTO logs (id, subdomain_id, timestamp, status, duration, message) VALUES
  ('inc-1',  'sub-5',  NOW() - INTERVAL '9 minutes',  'down',     '—',     'SSL Certificate has Expired. DNS check passed but TLS handshake failed.'),
  ('inc-2',  'sub-4',  NOW() - INTERVAL '1 hour 20 minutes', 'degraded', '520ms', 'Response time peaked at 520ms. Check interval flagged degraded.'),
  ('inc-3',  'sub-9',  NOW() - INTERVAL '3 hours 30 minutes', 'down', '—',     'Connection refused on port 443. localhost target offline.'),
  ('inc-4',  'sub-13', NOW() - INTERVAL '4 hours 40 minutes', 'degraded', '420ms', 'SMTP queue latency exceeded 400ms threshold for 3 consecutive checks.'),
  ('inc-5',  'sub-5',  NOW() - INTERVAL '1 day 9 hours', 'down', '—',     'Billing webhook returned 502 Bad Gateway from payment gateway responder.'),
  ('inc-6',  'sub-7',  NOW() - INTERVAL '2 days 11 hours', 'down', '—',   'Staging deployment pipeline locked. Client page unresolvable.'),
  ('inc-7',  'sub-4',  NOW() - INTERVAL '3 days 22 hours', 'degraded', '610ms', 'Queue Poller latency peaked at 610ms during weekly migration run.'),
  ('inc-8',  'sub-1',  NOW() - INTERVAL '6 days 16 hours', 'down', '—',   'API Gateway gateway-timeout. DNS check healthy but HTTP resolves 504.');
