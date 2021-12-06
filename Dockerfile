FROM nginx:1.21.4-alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY ./etc/nginx/sites-available /etc/nginx/sites-available
COPY ./etc/nginx/sites-enabled /etc/nginx/sites-enabled
COPY ./etc/letsencrypt /etc/letsencrypt
COPY . /var/www/html