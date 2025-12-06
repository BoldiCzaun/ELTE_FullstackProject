FROM composer:lts

COPY . .

RUN composer install
RUN cp .env.example .env
RUN php artisan key:generate
RUN chmod -R 777 storage bootstrap/cache

EXPOSE 8000

CMD ["php", "artisan", "serve"]

