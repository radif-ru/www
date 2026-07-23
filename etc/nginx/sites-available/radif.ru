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
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;
    # HTTP/2 включаем современной директивой http2 on; (listen ... http2 устарел в nginx >= 1.25).
    http2 on;
    # выше можно добавить default_server для клиентов без SNI
    server_name radif.ru;

# Подключаю сертификаты, которые получил в центре сертификации - Let's Encrypt
    ssl_certificate /etc/letsencrypt/live/radif.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/radif.ru/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/radif.ru/chain.pem;

    ssl_stapling on;
    ssl_stapling_verify on;

# Перенаправление схемы запросов в https
    proxy_set_header X-Forwarded-Proto $scheme;

# Безопасность: заголовки применяем ко ВСЕМ ответам (always), включая ошибки.
# ВАЖНО (nginx): add_header НЕ наследуется в location, где есть свой add_header.
# Поэтому кэш статики ниже задаётся директивой expires (без add_header) — так эти
# заголовки безопасности продолжают действовать и на CSS/JS/картинках.
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), browsing-topics=()" always;
    add_header Cross-Origin-Opener-Policy "same-origin" always;
# CSP: всё грузится со своего домена. Внешние CSS/JS вынесены в /assets того же домена.
# Инлайн JSON-LD — это data-блок (type="application/ld+json"): браузер НЕ исполняет его как
# скрипт, поэтому 'unsafe-inline' в script-src больше НЕ нужен — политика строгая ('self').
    add_header Content-Security-Policy "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; object-src 'none'; img-src 'self' https: data:; style-src 'self'; font-src 'self'; connect-src 'self'; manifest-src 'self'; script-src 'self'; upgrade-insecure-requests" always;

    location = /favicon.ico { root /var/www; access_log off; log_not_found off; }
    location = /robots.txt { root /var/www; access_log off; log_not_found off; }
    location = /sitemap.xml { root /var/www; access_log off; log_not_found off; }
# .webmanifest не всегда есть в mime.types — задаём корректный тип явно.
    location = /manifest.webmanifest { root /var/www; default_type application/manifest+json; access_log off; }

# Кэш статики через expires (НЕ add_header — иначе потеряются заголовки безопасности).
# Файлы не версионируются (правятся на месте через bind-mount): CSS/JS — короткий кэш,
# чтобы правки быстро доезжали до пользователей; медиа меняются реже — кэш длиннее.
    location ~* \.(?:css|js|mjs|svg|woff2?|ttf|otf|eot)$ {
        root /var/www;
        expires 1h;
        access_log off;
    }
    location ~* \.(?:png|jpe?g|gif|ico|webp|avif|pdf|mp3|wav|ogg|mp4)$ {
        root /var/www;
        expires 30d;
        access_log off;
    }

# JavaScriptProfessional-v2: ослабленный CSP для совместимости с Vue.js (unsafe-eval)
# и Google Fonts. ВАЖНО: add_header НЕ наследуется от server — повторяем ВСЕ заголовки.
    location /JavaScriptProfessional-v2/ {
        root /var/www;
        autoindex on;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), browsing-topics=()" always;
        add_header Cross-Origin-Opener-Policy "same-origin" always;
        add_header Content-Security-Policy "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; object-src 'none'; img-src 'self' https: data:; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self'; manifest-src 'self'; script-src 'self' 'unsafe-eval'; upgrade-insecure-requests" always;
    }

    location / {
        root /var/www;
        index index.html index.htm;
        autoindex on;
    }

    # Устанавливаю максимальный размер загружаемых данных
    client_max_body_size 230M;
}

