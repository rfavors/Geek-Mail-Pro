#!/bin/bash

# Geek Mail Pro Restore Script for Coolify.io
# This script restores the database and uploaded files from backup

set -e

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <backup_timestamp>"
    echo "Example: $0 20241209_143000"
    exit 1
fi

BACKUP_TIMESTAMP="$1"
BACKUP_DIR="/app/backups"
DB_NAME="${PGDATABASE:-geek_mail_pro}"
DB_USER="${PGUSER:-postgres}"
DB_HOST="${PGHOST:-postgres}"

echo "Starting restore from backup timestamp: $BACKUP_TIMESTAMP"

# Check if backup files exist
DB_BACKUP="$BACKUP_DIR/database_$BACKUP_TIMESTAMP.sql.gz"
FILES_BACKUP="$BACKUP_DIR/uploads_$BACKUP_TIMESTAMP.tar.gz"

if [ ! -f "$DB_BACKUP" ]; then
    echo "Error: Database backup file not found: $DB_BACKUP"
    exit 1
fi

if [ ! -f "$FILES_BACKUP" ]; then
    echo "Error: Files backup not found: $FILES_BACKUP"
    exit 1
fi

# Restore database
echo "Restoring database..."
gunzip -c "$DB_BACKUP" | psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME"

# Restore files
echo "Restoring uploaded files..."
cd /app
tar -xzf "$FILES_BACKUP"

echo "Restore completed successfully at $(date)"