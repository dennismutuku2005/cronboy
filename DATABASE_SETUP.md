# CronBoy Database & API Setup Guide

## Environment Setup

1. Copy `.env.local.example` to `.env`:
```bash
copy .env.local.example .env
```

2. Update `.env` with your database credentials and WhatsApp config:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=cronboy
NEXT_PUBLIC_WHATSAPP_API_KEY=your-whatsapp-api-key
REPORT_WHATSAPP_NUMBER=254793527494
```

> `NEXT_PUBLIC_WHATSAPP_API_KEY` is required by the client-side report sender. `REPORT_WHATSAPP_NUMBER` is the default WhatsApp sender/recipient fallback on the server.

## MySQL Database Setup

### Install MySQL
- **Windows**: Download from https://dev.mysql.com/downloads/mysql/
- **macOS**: `brew install mysql`
- **Linux**: use your package manager, for example `sudo apt install mysql-server`

### Create the `cronboy` database
```powershell
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS cronboy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Apply the schema
```powershell
mysql -u root -p cronboy < migrations/schema.sql
```

This creates the database structure used by CronBoy:
- `users` - user accounts and access control
- `subdomains` - monitored services and ping targets
- `cron_jobs` - cron schedules and job metadata
- `alert_rules` - alert logic and rule definitions
- `logs` - execution history for pings and health checks
- `reports` - generated report metadata
- `whatsapp_messages` - WhatsApp delivery log
- `audit_logs` - system audit entries

## Important `.env` Variables

| Variable | Purpose |
|---|---|
| `DB_HOST` | MySQL host, usually `localhost` |
| `DB_PORT` | MySQL port, usually `3306` |
| `DB_USER` | MySQL username |
| `DB_PASS` | MySQL password |
| `DB_NAME` | Database name, usually `cronboy` |
| `NEXT_PUBLIC_WHATSAPP_API_KEY` | WhatsApp API key exposed to the app |
| `REPORT_WHATSAPP_NUMBER` | Default number used for reports |

## API Notes

The app currently uses MySQL through `mysql2/promise` in `lib/mysql.js`.

### Report sending endpoint
**POST** `/api/reports/send`

Request body example:
```json
{
  "domains": [
    {
      "id": "uuid",
      "subdomain": "api.cronboy.io",
      "status": "healthy",
      "responseTime": 142,
      "uptime": 99.98,
      "sslExpiryDays": 28
    }
  ],
  "reportType": "summary|detailed|critical",
  "recipientPhone": "254793527494"
}
```

Response example:
```json
{
  "success": true,
  "reportId": "uuid",
  "message": "Report sent successfully"
}
```

## WhatsApp Integration

The system uses a WhatsApp API key defined in `NEXT_PUBLIC_WHATSAPP_API_KEY`.

### Common issues
- Invalid API key
- Incorrect `REPORT_WHATSAPP_NUMBER`
- API endpoint unreachable

## Run the app

Install dependencies:
```bash
npm install
```

Start locally:
```bash
npm run dev
```

## Troubleshooting

### Database connection failed
- Confirm MySQL server is running
- Confirm `.env.local` values are correct
- Confirm the `cronboy` database exists

### Schema or migration issues
- Ensure `migrations/schema.sql` was applied to `cronboy`
- Verify that MySQL user has privileges on the database

### Missing `.env` file
- Copy `.env.local.example` to `.env.local`
- Never commit `.env.local` to source control
