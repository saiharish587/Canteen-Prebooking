#!/bin/sh

set -e

cd /app

echo "Installing Composer dependencies..."
composer install --no-dev --no-interaction

echo "Running migrations..."
php artisan migrate --force

echo "Starting Laravel server..."
php artisan serve --host=0.0.0.0 --port=8000
