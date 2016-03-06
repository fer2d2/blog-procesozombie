+++
author = "@FeR2D2"
date = "2016-02-07T21:57:16+01:00"
title = "SSL gratis para todos: ¡Ya no hay excusa!"
comments = true
draft = true
+++

Cuando creé este blog, quise buscar alguna autoridad de certificación (CA) que expidiera de forma gratuita certificados SSL reconocidos por los navegadores actuales. Por motivos profesionales, conocía con anterioridad algunas opciones como [StartSSL][1] o [Comodo][2], pero en este caso he optado por una opción de la que había oído hablar hace algún tiempo: [Let's Encrypt][3].

Let's Encrypt es un proyecto actualmente en fase beta, constituido como una organización sin ánimo de lucro (el *Internet Security Research Group*), y auspiciado por compañías de la talla de Google, Facebook o la Fundación Mozilla, entre otras. La meta es ofrecer una autoridad de certificación (CA), para que cualquiera pueda generar, de forma sencilla y automatizada, certificados SSL/TLS con los que cifrar conexiones, y progresivamente reemplazar el uso de HTTP por HTTPS.

Para comenzar, lo único que tendremos que hacer es descargar el cliente de *Let's Encrypt*, y llevar a cabo el proceso de generación de los certificados. Suponiendo que estemos llevando a cabo los pasos en un Linux:

En primer lugar, copiamos el cliente en `/opt`:
```bash
cd /opt/
sudo mkdir letsencrypt
sudo chown -R $(whoami) letsencrypt/
git clone https://github.com/letsencrypt/letsencrypt letsencrypt/
```

A continuación, entramos en el directorio donde se ha descargado el repositorio y ejecutamos letsencrypt una primera vez, para que instale todas las dependencias:
```bash
cd letsencrypt/
./letsencrypt-auto --help
```
![Update letsencrypt](/img/update-letsencrypt.png)

Una vez tenemos instalado el cliente y sus dependencias, únicamente nos falta generar certificados que podamos incorporar en nuestro servidor web. Dependiendo del servidor, letsencrypt puede generarlos de forma más o menos automática. Actualmente el mejor soporte se ofrece para el servidor web Apache. Yo llevo años trabajando con Nginx, y últimamente con Docker, por lo que paso a explicar el procedimiento *"no estándar"* que he seguido:

La primera vez, generamos los certificados de forma manual:

```bash
# Usando webroot
/opt/letsencrypt/letsencrypt-auto certonly --keep-until-expiring --webroot -w /var/docker-projects/blog-procesozombie.com/deploys/current -d procesozombie.com,www.procesozombie.com
# Usando standalone
/opt/letsencrypt/letsencrypt-auto certonly -tvv --standalone --keep -d procesozombie.com,www.procesozombie.com
```

Esto pedirá algunos datos:



[1]: https://www.startssl.com/ "Sitio web oficial de StartSSL"
[2]: https://ssl.comodo.com/free-ssl-certificate.php "Certificados gratuitos de Comodo"
[3]: https://letsencrypt.org/ "Sitio web oficial de Let's Encrypt"
[hidden1]: https://letsencrypt.org/howitworks/
