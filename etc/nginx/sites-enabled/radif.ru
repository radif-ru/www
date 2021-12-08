server {
    listen radif.ru:80;
    server_name radif.ru;
# Устанавливаем/обновляем сертификат Let's Encrypt. Раскомментировать include, закомментировать return
#    include acme;
    return 301 https://$host$request_uri;
}


server {
#    listen 443 ssl;
#    server_name radif.ru 45.89.230.30;
    listen 80 default_server;
    listen [::]:80 default_server;
    listen 443 ssl default_server; # default_server;
    listen [::]:443 ssl default_server; # default_server;
    # выше можно добавить default_server для клиентов без SNI
    server_name radif.ru;

    ssl_certificate /etc/letsencrypt/live/radif.ru-0001/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/radif.ru-0001/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/radif.ru-0001/chain.pem;

    ssl_stapling on;
    ssl_stapling_verify on;
#    resolver 127.0.0.1 8.8.8.8;
#     resolver 45.89.230.30;

    # исключим возврат на http-версию сайта
#     add_header Strict-Transport-Security "max-age=31536000";

    # явно "сломаем" все картинки с http://
    add_header Content-Security-Policy "img-src https: data:; upgrade-insecure-requests";

    location = /favicon.ico { access_log off; log_not_found off; }

    location / {
        root /var/www;
        index index.html index.htm;
        autoindex on;
    }
}

