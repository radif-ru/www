server {
    listen pro-gidroizolyaciya.ru:80;
    server_name pro-gidroizolyaciya.ru;
    return 301 https://$host$request_uri;
}

server {
    listen 80;
    listen [::]:80;
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    
    server_name pro-gidroizolyaciya.ru;
#     listen pro-gidroizolyaciya.ru:443 ssl;

    ssl_certificate /etc/letsencrypt/live/pro-gidroizolyaciya.ru-0001/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pro-gidroizolyaciya.ru-0001/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/pro-gidroizolyaciya.ru-0001/chain.pem;

    ssl_stapling on;
    ssl_stapling_verify on;
#     resolver 45.89.230.30;\

# Перенаправление схемы запросов в https
    proxy_set_header X-Forwarded-Proto $scheme;

# Исключаю возврат на http-версию сайта
    add_header Strict-Transport-Security "max-age=31536000";

# Явно "ломаю" все картинки с http://
    add_header Content-Security-Policy "img-src https: data:; upgrade-insecure-requests";

    location = /favicon.ico { access_log off; log_not_found off; }
    location / {
        root /var/www/Intex_Stroy;
        index index.html index.htm;
        autoindex on;
    }

    # Устанавливаю максимальный размер загружаемых данных
    client_max_body_size 230M;
}