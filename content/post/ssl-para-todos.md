+++
author = "@FeR2D2"
date = "2017-02-11T17:00:00+01:00"
title = "SSL gratis para todos: Let's Encrypt!"
comments = true
draft = false
+++

Cuando creé este blog, quise buscar alguna autoridad de certificación (CA) que expidiera de forma gratuita certificados SSL reconocidos por los navegadores actuales. Conocía algunas opciones como [StartSSL][1] o [Comodo][2], pero en este caso he optado por una alternativa de la que había oído hablar hace algún tiempo: [Let's Encrypt][3].

## ¿Qué es LetsEncrypt?

Let's Encrypt es un proyecto promovido por una organización sin ánimo de lucro (el *Internet Security Research Group*), y auspiciado por compañías de la talla de Google, Facebook o la Fundación Mozilla, entre otras. La meta es ofrecer una autoridad de certificación (CA), para que cualquiera pueda generar, de forma sencilla y automatizada, certificados SSL/TLS con los que cifrar conexiones, y progresivamente reemplazar el uso de HTTP por HTTPS, materializando la iniciativa **https everywhere**.

## Instación

El primer paso es obtener un cliente de LetsEncrypt. Existen varias alternativas, siendo [Certbot][4] la más destacable.

![Web de Certbot](/img/certbot-web.png)

La web ofrece múltiples formas de instalar el cliente. En mi caso, por las tecnologías que utiliza el servidor de *El Proceso Zombie* (Docker y NGINX), he optado por la instalación manual:

```bash
# Descargamos el cliente
wget https://dl.eff.org/certbot-auto
# Le damos permisos de ejecución
chmod a+x certbot-auto
# Lo ejecutamos por primera vez, para que instale dependencias necesarias
./certbot-auto
```

Una vez tenemos instalado el cliente, únicamente nos restaría generar certificados que podamos incorporar en nuestro servidor web. Dependiendo del servidor, Certbot puede crearlos de forma más o menos automática. Actualmente el mejor soporte se ofrece para el servidor web Apache. En mi caso, trabajo con Nginx, y Docker, por lo que el procedimiento estándar no me servía y tuve que diseñar una pequeña rutina alternativa:

### 1. Comprobación de certificados mediante webroot

Cuando Letsencrypt genera/renueva los certificados, necesita validar que el usuario es propietario de los dominios para los que solicita dichos certificados. La forma de realizar este proceso se denomina [webroot][5], y consiste en poner en un directorio público del servidor (en el caso de *El Proceso Zombie*, en `https://www.procesozombie.com/.well-known/`) un fichero temporal con el que Letsencrypt valida la existencia del dominio realizando una petición. Conceptualmente, es similar a cuando añadimos un registro TXT para validar que somos los propietarios de un dominio para activar un servicio de Google u otro proveedor.

### 2. Explicación del setup de El Proceso Zombie

El servidor tiene un NGINX, que se monta mediante un contenedor de *Docker* utilizando *docker-compose*. El fichero de configuración de *compose* sería el siguiente:

```yml
# docker-compose.yml
nginx:
  image: nginx:latest
  hostname: nginx
  container_name: nginx
  restart: always
  volumes:
    - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    - ./nginx/vhosts:/etc/nginx/conf.d:ro
    - ./deploys/current:/var/www/blog-procesozombie
    - ./letsencrypt:/var/www/letsencrypt
    - /etc/letsencrypt/live/procesozombie.com:/etc/letsencrypt/live/procesozombie.com
    - /etc/letsencrypt/archive/procesozombie.com:/etc/letsencrypt/archive/procesozombie.com
  ports:
    - "0.0.0.0:80:80"
    - "0.0.0.0:443:443"
```

Como puede verse, el contenedor monta dos directorios con los certificados accesibles, así como un directorio donde letsencrypt pueda escribir los *retos* que usará el servidor al validar crear/renovar los certificados:

  - /etc/letsencrypt/live/procesozombie.com:/etc/letsencrypt/live/procesozombie.com
  - /etc/letsencrypt/archive/procesozombie.com:/etc/letsencrypt/archive/procesozombie.com
  - ./letsencrypt:/var/www/letsencrypt

En el VirtualHost de NGINX, tendremos que cargar los certificados y añadir una redirección para el directorio de los *retos*: `location /.well-known`:

```
server {
  listen 443 ssl http2;
  server_name www.procesozombie.com;

  ssl_certificate /etc/letsencrypt/live/procesozombie.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/procesozombie.com/privkey.pem;

  ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
  ssl_prefer_server_ciphers on;
  ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';

  root   /var/www/blog-procesozombie;
  index  index.html;

  location / {
    try_files $uri $uri/ $uri.html;
  }

  error_page   404  /404.html;
  error_page   500 502 503 504  /50x.html;

  location = /50x.html {
    root   /usr/share/nginx/html;
  }

  location /.well-known {
    alias /var/www/letsencrypt/.well-known/;
  }

}
```

### 3. Creación de un script para crear/renovar los certificados:

Con algunas variaciones, podemos utilizar el siguiente script (`renew.sh`):

```bash
#!/bin/bash

CERTBOT_PATH=/home/fernando/certbot-auto
WEBROOT_PATH=/var/docker-projects/blog-procesozombie.com/letsencrypt/

DOMAIN_WWW=www.procesozombie.com
DOMAIN=procesozombie.com

DOCKER_COMPOSE_PATH=/var/docker-projects/blog-procesozombie.com/docker-compose.yml

PRE_HOOK="docker-compose -f $DOCKER_COMPOSE_PATH stop nginx"
POST_HOOK="docker-compose -f $DOCKER_COMPOSE_PATH start nginx"

function generateCert {
  $CERTBOT_PATH certonly --webroot -w $WEBROOT_PATH -d $DOMAIN -d $DOMAIN_WWW
}

function renewCert {
  $CERTBOT_PATH renew --webroot --pre-hook "$PRE_HOOK" --post-hook "$POST_HOOK"
}

ACTION=$1

case "$ACTION" in
  generate)
    generateCert
    ;;
  renew)
    renewCert
    ;;
  *)
    echo "Usage: $0 {generate|renew}"
    exit 1
esac
```

Este script permite ejecutar dos comandos, uno para generar el certificado (la primera vez) y otro para regenerar dicho certificado las siguientes veces. Es importante reemplazas las variables del script por aquellos datos que se adapten a vuestro caso de uso.

Como es lógico, la regeneración la automatizaremos con una tarea de cron que añadiremos al usuario *root*:

```bash
sudo su
crontab -e
```

...Y añadimos al crontab la siguiente línea:

```bash
0 4 * * * /path/to/renew.sh renew > /some/log/location/renew.log renew
```

## Conclusiones

Como veis, tener certificados SSL "en verde" se ha convertido en algo sencillo y gratuito gracias a iniciativas como Letsencrypt. ¡Ya no hay excusa para no utilizar HTTPS!

[1]: https://www.startssl.com/ "Sitio web oficial de StartSSL"
[2]: https://ssl.comodo.com/free-ssl-certificate.php "Certificados gratuitos de Comodo"
[3]: https://letsencrypt.org/ "Sitio web oficial de Let's Encrypt"
[4]: https://certbot.eff.org/ "Sitio web de Certbot"
[5]: https://certbot.eff.org/docs/using.html#webroot "Webroot explicado"
[hidden1]: https://letsencrypt.org/howitworks/
