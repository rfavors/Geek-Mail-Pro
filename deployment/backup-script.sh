#!/bin/bash

# Geek Mail Pro Backup Script for Coolify.io
# This script backs up the database and uploaded files

set -e

# Configuration
BACKUP_DIR="/app/backups"
DB_NAME="${PGDATABASE:-geek_mail_pro}"
DB_USER="${PGUSER:-postgres}"
DB_HOST="${PGHOST:-postgres}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "Starting backup at $(date)"

# Database backup
echo "Backing up database..."
pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_DIR/database_$TIMESTAMP.sql"

# Compress database backup
gzip "$BACKUP_DIR/database_$TIMESTAMP.sql"

# Files backup
echo "Backing up uploaded files..."
tar -czf "$BACKUP_DIR/uploads_$TIMESTAMP.tar.gz" -C /app uploads/

# Clean up old backups (keep last 7 days)
echo "Cleaning up old backups..."
find "$BACKUP_DIR" -name "database_*.sql.gz" -mtime +7 -delete
find "$BACKUP_DIR" -name "uploads_*.tar.gz" -mtime +7 -delete

echo "Backup completed successfully at $(date)"
echo "Files:"
ls -la "$BACKUP_DIR"/*"$TIMESTAMP"*