FROM php:8.1-cli

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    libzip-dev \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql zip bcmath mbstring

# Increase memory limit
ENV PHP_MEMORY_LIMIT=2G
RUN echo "memory_limit=2G" > /usr/local/etc/php/conf.d/memory.ini

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy application
COPY . .

# Install dependencies - remove lock file for clean install
RUN rm -f composer.lock && \
    COMPOSER_ALLOW_SUPERUSER=1 composer install --no-dev --optimize-autoloader --no-interaction

# Set permissions
RUN chmod -R 777 storage bootstrap/cache

EXPOSE 8000

# Start Laravel
CMD ["sh", "-c", "php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=8000"]
