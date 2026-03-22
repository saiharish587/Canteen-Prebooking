FROM php:8.1-cli

WORKDIR /app

# Install system dependencies 
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    unzip \
    libzip-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install only required PHP extensions - others are built-in
RUN docker-php-ext-install -j$(nproc) \
    pdo \
    pdo_mysql \
    zip \
    bcmath \
    mbstring

# Set PHP memory limit for composer
RUN echo "memory_limit = 2G" >> /usr/local/etc/php/conf.d/docker-php-memlimit.ini

# Download and install latest Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Copy composer files
COPY composer.json composer.lock* ./

# Install dependencies
RUN composer install --no-dev --no-interaction --no-scripts 2>&1 || (rm -f composer.lock && composer install --no-dev --no-interaction --no-scripts)

# Copy rest of application
COPY . .

# Run composer scripts
RUN composer run-script post-install-cmd || true

# Create necessary directories
RUN mkdir -p storage/logs bootstrap/cache && \
    chmod -R 775 storage bootstrap/cache

# Expose port
EXPOSE 8000

# Run migrations and start server
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=8000
