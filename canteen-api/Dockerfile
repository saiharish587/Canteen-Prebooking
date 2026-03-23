FROM php:8.4-alpine

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

# Copy backend application
COPY canteen-api/ .

# Create public directory structure
RUN mkdir -p public/app

# Copy frontend files to public directory
COPY canteen/css/ public/css/
COPY canteen/js/ public/js/
COPY canteen/images/ public/images/
COPY canteen/*.html public/
COPY canteen/_redirects public/

# Copy startup script
COPY canteen-api/start.sh /start.sh
RUN chmod +x /start.sh

# Create directories and fix permissions
RUN mkdir -p storage/logs bootstrap/cache && \
    chmod -R 777 storage bootstrap/cache && \
    chmod -R 755 public

EXPOSE 8000

CMD ["/start.sh"]
