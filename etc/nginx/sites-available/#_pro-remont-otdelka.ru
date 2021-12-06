server {
    listen pro-remont-otdelka.ru:80;
    server_name pro-remont-otdelka.ru;
    # Устанавливаем/обновляем сертификат Let's Encrypt.
    include acme;

    location / {
        return 404;
    }
}
