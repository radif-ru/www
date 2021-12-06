server {
    listen pro-remont-otdelka.ru:80;
    server_name pro-remont-otdelka.ru;
# Устанавливаем/обновляем сертификат Let's Encrypt. include раскомментировать, return закомментировать
#    include acme;
    return 301 https://$host$request_uri;
}


server {
#    listen 443 ssl;
    server_name pro-remont-otdelka.ru;
    listen pro-remont-otdelka.ru:443 ssl; # default_server;
    # выше можно добавить default_server для клиентов без SNI

    ssl_certificate /etc/letsencrypt/live/pro-remont-otdelka.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pro-remont-otdelka.ru/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/pro-remont-otdelka.ru/chain.pem;

    ssl_stapling on;
    ssl_stapling_verify on;
#    resolver 127.0.0.1 8.8.8.8;
    resolver 45.89.230.30;

    # исключим возврат на http-версию сайта
    add_header Strict-Transport-Security "max-age=31536000";

    # явно "сломаем" все картинки с http://
    add_header Content-Security-Policy "img-src https: data:; upgrade-insecure-requests";
        
    location / {
        root /home/radif/pro-remont-otdelka.ru;
	index index.html index.htm;
	autoindex on;
    }
}

