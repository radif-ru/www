# Актуальный стабильный nginx на Alpine (вместо устаревшего 1.21.4 от 2021 года).
FROM nginx:1.27-alpine

#COPY . /var/www/
RUN rm /etc/nginx/conf.d/default.conf
#COPY ./etc/nginx/sites-available /etc/nginx/sites-available
#COPY ./etc/nginx/sites-enabled /etc/nginx/sites-enabled
#COPY ./etc/nginx/nginx.conf /etc/nginx/nginx.conf
#COPY ./etc/letsencrypt /etc/letsencrypt
