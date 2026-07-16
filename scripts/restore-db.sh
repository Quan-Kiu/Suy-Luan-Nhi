#!/usr/bin/env sh
set -eu
: "${DATABASE_URL:?DATABASE_URL is required}"
: "${1:?Usage: scripts/restore-db.sh <backup.dump>}"
pg_restore --clean --if-exists --no-owner --no-acl --dbname="$DATABASE_URL" "$1"
printf 'Restore completed from %s\n' "$1"
