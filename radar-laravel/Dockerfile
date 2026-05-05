FROM php:8.2-apache

# Instala dependências do sistema
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip

# Instala extensões PHP para Laravel
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Ativa o mod_rewrite do Apache
RUN a2enmod rewrite

# Instala o Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Define o diretório de trabalho
WORKDIR /var/www/html

# Copia os arquivos da pasta atual para o container
COPY . .

# Instala dependências do Laravel
RUN composer install --no-dev --optimize-autoloader

# Ajusta permissões de pastas críticas
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Configura o Apache para apontar para a pasta public
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

EXPOSE 80