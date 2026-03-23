#!/bin/sh

set -e

cd /app

echo "Removing lock file for fresh composer resolution..."
rm -f composer.lock

echo "Installing Composer dependencies..."
composer install --no-dev --no-interaction

echo "Clearing application cache..."
php artisan config:clear
php artisan route:clear
php artisan cache:clear

echo "Running migrations..."
php artisan migrate --force

echo "Seeding database with menu items and users..."
php artisan db:seed --force

echo "Starting Laravel server..."
php artisan serve --host=0.0.0.0 --port=8000
