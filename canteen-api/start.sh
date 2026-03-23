#!/bin/sh

set -e

cd /app

echo "=== STARTING CANTEEN API DEPLOYMENT ==="

echo "Step 1: Removing composer lock file..."
rm -f composer.lock

echo "Step 2: Installing PHP dependencies..."
composer install --no-dev --no-interaction --optimize-autoloader

echo "Step 3: Clearing all Laravel caches..."
php artisan config:clear 2>/dev/null || echo "Config clear: OK"
php artisan cache:clear 2>/dev/null || echo "Cache clear: OK"
php artisan route:clear 2>/dev/null || echo "Route clear: OK"

echo "Step 4: Running database migrations..."
php artisan migrate --force --quiet

echo "Step 5: Seeding database with menu items..."
php artisan db:seed --force --quiet

echo "Step 6: Starting Laravel server on port 8000..."
exec php artisan serve --host=0.0.0.0 --port=8000
