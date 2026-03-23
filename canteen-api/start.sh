#!/bin/sh

set -e

cd /app

echo "=== STARTING CANTEEN API DEPLOYMENT ==="

echo "Removing composer lock file..."
rm -f composer.lock

echo "Installing PHP dependencies..."
composer install --no-dev --no-interaction --optimize-autoloader

echo "Clearing all Laravel caches..."
php artisan optimize:clear 2>/dev/null || true
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

echo "Running database migrations..."
php artisan migrate --force --quiet

echo "Seeding database..."
php artisan db:seed --force --quiet

echo "=== STARTING LARAVEL SERVER ==="
php artisan serve --host=0.0.0.0 --port=8000
