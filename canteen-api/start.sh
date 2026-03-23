#!/bin/sh

set -e

cd /app

echo "Checking if vendor directory exists..."
if [ ! -d "vendor" ]; then
    echo "Installing Composer dependencies..."
    composer install --no-dev --no-interaction --optimize-autoloader
fi

echo "Clearing all caches aggressively..."
rm -rf bootstrap/cache/*.php 2>/dev/null || true
php artisan optimize:clear 2>/dev/null || true
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear 2>/dev/null || true

echo "Running migrations..."
php artisan migrate --force

echo "Seeding database..."
php artisan db:seed --force

PORT=${PORT:-8000}
echo "Starting Laravel server on port $PORT..."
php artisan serve --host=0.0.0.0 --port=$PORT
