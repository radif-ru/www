server {
    listen django.radif.ru:80; 
#    listen django.radif.ru:5432;
    server_name django.radif.ru;
# Устанавливаем/обновляем сертификат Let's Encrypt. include раскомментировать, return закомментировать
#    include acme;
    return 301 https://$host$request_uri;
}

server {
    server_name django.radif.ru;
    listen django.radif.ru:443 ssl; # default_server; 
#    listen django.radif.ru:5432 ssl; 
    # выше можно добавить default_server для клиентов без SNI

    ssl_certificate /etc/letsencrypt/live/django.radif.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/django.radif.ru/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/django.radif.ru/chain.pem;

    ssl_stapling on;
    ssl_stapling_verify on;
#    resolver 127.0.0.1 8.8.8.8;
    resolver 45.89.230.30;

    # исключим возврат на http-версию сайта
    add_header Strict-Transport-Security "max-age=31536000";

    # явно "сломаем" все картинки с http://
    add_header Content-Security-Policy "img-src https: data:; upgrade-insecure-requests";

    # далее всё что вы обычно указываете
    #location / {
    #    proxy_pass ...;
    #}

    location = /favicon.ico { access_log off; log_not_found off; }
    location /static/ {
        root /home/radif/Django_optimization_tools;
    }

    location /media/ {
	root /home/radif/Django_optimization_tools;
    }

#    location /screenshots/ {
#	root /home/radif/Django_optimization_tools;
#	autoindex on;  
#  }

    location / {
        include proxy_params;
        proxy_pass http://unix:/run/gunicorn_shop.sock;
  }
}
