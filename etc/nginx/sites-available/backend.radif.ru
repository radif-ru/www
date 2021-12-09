upstream todos {
# Прослушиваю сервис, подключенный в docker-compose
    server backend:3333;
}

server {
# Перенаправление с http на https
    listen backend.radif.ru:80;
    server_name backend.radif.ru;
    return 301 https://$host$request_uri;
}

server {
    listen 80;
    listen [::]:80;
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
#     listen django.radif.ru:443 ssl http2;
    server_name backend.radif.ru;

# Подключаю сертификаты, которые получил в центре сертификации - Let's Encrypt
    ssl_certificate /etc/letsencrypt/live/backend.radif.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/backend.radif.ru/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/backend.radif.ru/chain.pem;
    ssl_stapling on;
    ssl_stapling_verify on;
#    resolver 127.0.0.1 8.8.8.8;

# Перенаправление схемы запросов в https
    proxy_set_header X-Forwarded-Proto $scheme;

# Исключаю возврат на http-версию сайта
    add_header Strict-Transport-Security "max-age=31536000";

# Явно "ломаю" все картинки с http://
    add_header Content-Security-Policy "img-src https: data:; upgrade-insecure-requests";

    location = /favicon.ico { access_log off; log_not_found off; }

    location / {
# Перенаправляю все запросы в сервис бэкенда
        proxy_pass http://todos;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_redirect off;

### ### ###
        # add_header Access-Control-Allow-Origin *;
        if ($request_method = 'OPTIONS') {
# У каких адресов есть доступ. Включены все. Для безопасности можно указать конкретные!
            add_header 'Access-Control-Allow-Origin' '*';
            #
            # Om nom nom cookies
            #
            add_header 'Access-Control-Allow-Credentials' 'true';
            # Доступные методы запроса. Не используемые можно отключить!
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, DELETE, PUT, PATCH, HEAD, CONNECT, TRACE';

            #
            # Custom headers and headers various browsers *should* be OK with but aren't
            #
            add_header 'Access-Control-Allow-Headers' 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';

            #
            # Tell client that this pre-flight info is valid for 20 days
            #
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
        }

        if ($request_method = 'POST') {
# У каких адресов есть доступ. Включены все. Для безопасности можно указать конкретные!
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Credentials' 'true';
# Доступные методы запроса. Не используемые можно отключить!
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, DELETE, PUT, PATCH, HEAD, CONNECT, TRACE';
            add_header 'Access-Control-Allow-Headers' 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';
        }

        if ($request_method = 'GET') {
# У каких адресов есть доступ. Включены все. Для безопасности можно указать конкретные!
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Credentials' 'true';
# Доступные методы запроса. Не используемые можно отключить!
            add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, DELETE, PUT, PATCH, HEAD, CONNECT, TRACE';
            add_header 'Access-Control-Allow-Headers' 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';
        }

# У каких адресов есть доступ. Включены все. Для безопасности можно указать конкретные!
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Credentials' 'true';
# Доступные методы запроса. Не используемые можно отключить!
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS, DELETE, PUT, PATCH, HEAD, CONNECT, TRACE';
        add_header 'Access-Control-Allow-Headers' 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';
### ### ###
    }

    location /static/ {
        alias /home/app/backend/staticfiles/;
    }

    location /media/ {
        alias /home/app/backend/mediafiles/;
    }
}
