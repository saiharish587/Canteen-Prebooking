FROM php:8.1-fpm

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    composer \
    mysql-client \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql

# Copy project files
COPY . .

# Install composer dependencies
RUN composer install --no-dev --optimize-autoloader

# Generate app key if not exists
RUN if [ ! -f .env ]; then cp .env.example .env; fi

# Set permissions
RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache

# Expose port
EXPOSE 8000

# Run migrations and start server
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=8000
