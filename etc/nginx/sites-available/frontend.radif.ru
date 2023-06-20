server {
# Перенаправление с http на https
    listen frontend.radif.ru:80;
    server_name frontend.radif.ru;
    return 301 https://$host$request_uri;
}

server {
    listen 80;
    listen [::]:80;
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
#    listen frontend.radif.ru:443 ssl http2;
    server_name frontend.radif.ru;

# Подключаю сертификаты, которые получил в центре сертификации - Let's Encrypt
    ssl_certificate /etc/letsencrypt/live/radif.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/radif.ru/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/radif.ru/chain.pem;

    ssl_stapling on;
    ssl_stapling_verify on;

# Перенаправление схемы запросов в https
    proxy_set_header X-Forwarded-Proto $scheme;

# Исключаю возврат на http-версию сайта
    add_header Strict-Transport-Security "max-age=31536000";

# Явно "ломаю" все картинки с http://
    add_header Content-Security-Policy "img-src https: data:; upgrade-insecure-requests";

    location = /favicon.ico { access_log off; log_not_found off; }

    # where the root here
    root /var/www/frontend;
    # what file to server as index
    index index.html index.htm;

    location / {
        # First attempt to serve request as file, then
        # as directory, then fall back to redirecting to index.html
        try_files $uri $uri/ /index.html;
        autoindex on;
    }

  # Media: images, icons, video, audio, HTC
    location ~* \.(?:jpg|jpeg|gif|png|ico|cur|gz|svg|svgz|mp4|ogg|ogv|webm|htc)$ {
      expires 1M;
      access_log off;
      add_header Cache-Control "public";
    }

    # Javascript and CSS files
    location ~* \.(?:css|js)$ {
        try_files $uri =404;
        expires 1y;
        access_log off;
        add_header Cache-Control "public";
    }

    # Any route containing a file extension (e.g. /devicesfile.js)
    location ~ ^.+\..+$ {
        try_files $uri =404;
        }

    # Устанавливаю максимальный размер загружаемых данных
    client_max_body_size 230M;
}
