FROM php:8.2-alpine

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

# Copy startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Create directories and fix permissions
RUN mkdir -p storage/logs bootstrap/cache && \
    chmod -R 777 storage bootstrap/cache

EXPOSE 8000

CMD ["/start.sh"]
