FROM php:8.1-alpine

WORKDIR /app

# Install dependencies and PHP extensions
RUN apk add --no-cache \
    curl \
    git \
    zip \
    unzip \
    oniguruma-dev \
    libzip-dev \
    $PHPIZE_DEPS

# Install PHP extensions
RUN docker-php-ext-install \
    pdo \
    pdo_mysql \
    zip \
    bcmath \
    mbstring

# Set memory limit
RUN echo "memory_limit=2G" > /usr/local/etc/php/conf.d/memory.ini

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy and install dependencies
COPY . .
RUN rm -f composer.lock && \
    COMPOSER_ALLOW_SUPERUSER=1 composer install --no-dev --optimize-autoloader --no-interaction

# Fix permissions
RUN chmod -R 777 storage bootstrap/cache

EXPOSE 8000

CMD ["sh", "-c", "php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=8000"]
