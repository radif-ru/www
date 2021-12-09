server {
# Перенаправление с http на https
    listen radif.ru:80;
    server_name radif.ru;
# Устанавливаем/обновляем сертификат Let's Encrypt. Раскомментировать include, закомментировать return
#    include acme;
    return 301 https://$host$request_uri;
}


server {
    listen 80 default_server;
    listen [::]:80 default_server;
    listen 443 ssl http2 default_server;
    listen [::]:443 ssl http2 default_server;
    # выше можно добавить default_server для клиентов без SNI
    server_name radif.ru;

# Подключаю сертификаты, которые получил в центре сертификации - Let's Encrypt
    ssl_certificate /etc/letsencrypt/live/radif.ru-0001/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/radif.ru-0001/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/radif.ru-0001/chain.pem;
    ssl_stapling on;
    ssl_stapling_verify on;
#    resolver 127.0.0.1 8.8.8.8;
#     resolver 45.89.230.30;

# Исключаю возврат на http-версию сайта
#     add_header Strict-Transport-Security "max-age=31536000";

# Явно "ломаю" все картинки с http://
    add_header Content-Security-Policy "img-src https: data:; upgrade-insecure-requests";

    location = /favicon.ico { access_log off; log_not_found off; }

    location / {
        root /var/www;
        index index.html index.htm;
        autoindex on;
    }
}

