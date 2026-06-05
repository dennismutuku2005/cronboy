#!/bin/bash
# CronBoy Database Initialization Script

echo "CronBoy Database Setup"
echo "======================"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL is not installed. Please install it first."
    echo "macOS: brew install postgresql"
    echo "Linux: sudo apt-get install postgresql postgresql-contrib"
    echo "Windows: Download from https://www.postgresql.org/download/windows/"
    exit 1
fi

# Create database
echo "Creating cronboy database..."
createdb cronboy 2>/dev/null || echo "Database cronboy already exists."

# Run migrations
echo "Running schema migrations..."
psql cronboy < migrations/schema.sql

echo ""
echo "Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your configuration"
echo "2. Run: npm install"
echo "3. Run: npm run dev"
echo ""
echo "WhatsApp Integration:"
echo "- API Key: 3f9d3160-4769-44b5-a0e9-7d4e36512aec"
echo "- Report Phone: 254793527494"
