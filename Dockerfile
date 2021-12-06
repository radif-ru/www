FROM nginx:1.21.4-alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY ./etc /etc
COPY . /var/www/html