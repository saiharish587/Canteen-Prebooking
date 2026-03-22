FROM php:8.1-cli

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    unzip \
    libzip-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql zip

# Set PHP memory limit for composer
RUN echo "memory_limit = 512M" >> /usr/local/etc/php/conf.d/docker-php-memlimit.ini

# Download and install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Copy composer files first
COPY composer.json composer.lock* ./

# Install composer dependencies with fallback
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader || composer install --no-dev --no-interaction --prefer-dist

# Copy rest of project files
COPY . .

# Set permissions
RUN chmod -R 775 /app/storage /app/bootstrap/cache || true

# Expose port
EXPOSE 8000

# Run migrations and start server
CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=8000
