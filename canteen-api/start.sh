#!/bin/sh

set -e

cd /app

echo "========================================="
echo "BVRIT Canteen API - Startup Process"
echo "========================================="

echo "[1] Checking vendor directory..."
if [ ! -d "vendor" ]; then
    echo "    Installing Composer dependencies..."
    composer install --no-dev --no-interaction --optimize-autoloader
fi

echo "[2] Clearing caches..."
rm -rf bootstrap/cache/*.php 2>/dev/null || true
rm -rf bootstrap/cache/routes* 2>/dev/null || true
php artisan optimize:clear 2>/dev/null || true
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear 2>/dev/null || true

echo "[3] Testing database connection..."
php artisan db:show || echo "⚠️  Database not yet accessible"

echo "[4] Running migrations..."
php artisan migrate --force

echo "[5] Checking migration status..."
php artisan migrate:status

echo "[6] Seeding database..."
php artisan db:seed --force 2>/dev/null || echo "⚠️  Seeding optional"

echo "========================================="
echo "✅ Server startup complete!"
echo "========================================="

PORT=${PORT:-8000}
echo "Starting Laravel server on port $PORT..."
exec php artisan serve --host=0.0.0.0 --port=$PORT
