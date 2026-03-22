FROM php:8.1-alpine

WORKDIR /app

# Install dependencies and PHP extensions
RUN apk add --no-cache \
    curl \
    git \
    zip \
    unzip \
    openssl-dev \
    oniguruma-dev \
    libzip-dev \
    $PHPIZE_DEPS && \
    docker-php-ext-install \
    pdo \
    pdo_mysql \
    zip \
    bcmath \
    mbstring && \
    apk del $PHPIZE_DEPS

# Set memory limit
RUN echo "memory_limit=2G" > /usr/local/etc/php/conf.d/memory.ini

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy application
COPY . .

# Create startup script
RUN echo '#!/bin/sh\n\
cd /app\n\
composer install --no-dev --no-interaction 2>&1\n\
php artisan migrate --force 2>&1\n\
php artisan serve --host=0.0.0.0 --port=8000' > /start.sh && \
chmod +x /start.sh

# Fix permissions
RUN chmod -R 777 storage bootstrap/cache

EXPOSE 8000

CMD ["/start.sh"]
