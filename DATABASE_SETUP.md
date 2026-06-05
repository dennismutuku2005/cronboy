# CronBoy Database & API Setup Guide

## Environment Setup

1. Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

2. Update `.env.local` with your database credentials:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/cronboy
NEXT_PUBLIC_WHATSAPP_API_KEY=3f9d3160-4769-44b5-a0e9-7d4e36512aec
REPORT_WHATSAPP_NUMBER=254793527494
```

## Database Setup

### PostgreSQL Installation
- **Linux/Mac**: `brew install postgresql`
- **Windows**: Download from https://www.postgresql.org/download/windows/

### Create Database
```bash
createdb cronboy
```

### Run Schema Migration
```bash
psql cronboy < migrations/schema.sql
```

This creates all necessary tables with UUID primary keys:
- `users` - User accounts and access control
- `subdomains` - Domain monitors
- `cron_jobs` - Scheduled jobs
- `alert_rules` - Alert configurations
- `logs` - Health check logs
- `reports` - Generated reports
- `whatsapp_messages` - WhatsApp message log
- `audit_logs` - System audit trail

## API Endpoints

### Send Domain Report
**POST** `/api/reports/send`

Request body:
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

Response:
```json
{
  "success": true,
  "reportId": "uuid",
  "message": "Report sent successfully"
}
```

## WhatsApp Integration

The system uses the Pace-Send WhatsApp API:
- **Endpoint**: `https://whatsapp.pacewisp.co.ke/send/primary`
- **API Key**: Stored in `NEXT_PUBLIC_WHATSAPP_API_KEY`
- **Supported Features**:
  - Text messages
  - Images with captions
  - PDF documents
  - Interactive buttons

## Report Types

### Summary Report
Displays total, healthy, degraded, and down counts.

### Detailed Report
Lists each domain with:
- Status
- Response time
- Uptime percentage
- SSL expiry days

### Critical Report
Shows only domains with issues:
- Down status
- Degraded status
- SSL expiring soon (≤7 days)

## Using the System

1. **Select domains** in the dashboard using checkboxes
2. **Click "Send report (WhatsApp)"** button
3. **Enter phone number** when prompted (include country code)
4. **Report sent** via WhatsApp to the specified number

## Database Connection

The system uses `pg` (node-postgres) with connection pooling:
- Max pool size: 20 connections
- Idle timeout: 30 seconds
- Connection timeout: 2 seconds

All database queries are logged to the console with execution time.

## Dependencies

Install with:
```bash
npm install
```

Required packages:
- `pg` - PostgreSQL client
- `next` - Next.js framework
- `react` - UI library

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env.local`
- Ensure database `cronboy` exists

### WhatsApp API Error
- Verify `NEXT_PUBLIC_WHATSAPP_API_KEY` is correct
- Check phone number format (include country code)
- Ensure API endpoint is accessible

### Missing Tables
- Run schema migration: `psql cronboy < migrations/schema.sql`
- Check for PostgreSQL extensions: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
