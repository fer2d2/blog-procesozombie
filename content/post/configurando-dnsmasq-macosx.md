+++
author = "@FeR2D2"
comments = true
date = "2016-02-04T16:48:20+01:00"
title = "Configurando dnsmasq en MacOS X"
+++

Cuando se configura un entorno para desarrollo web, suele ser frecuente moverse entre múltiples *virtualhosts*, que añadimos de forma estática el fichero `/etc/hosts` del sistema. Sin embargo, si sabemos que existen una serie de extensiones de dominio que deberían de configurarse como virtualhost de forma automática (hablo de extensiones como *.lan*, *.dev* o *.home*), podemos ayudarnos de  **dnsmasq**, un pequeño servidor de DNS disponible en sistemas tipo Unix. El proceso de configuración es sencillo:

## Instalación de dnsmasq

Primeramente, instalamos **dnsmasq** usando *homebrew*:

```bash
brew install dnsmasq
```

Tras el proceso de instalación, brew creará un enlace simbólico hacia el ejecutable en `/usr/local/sbin/dnsmasq`. Si no tenemos permisos suficientes, el proceso fallará, y deberemos crear el enlace simbólico de forma manual:

```sh
sudo ln -s /usr/local/Cellar/dnsmasq/2.75/sbin/dnsmasq /usr/local/sbin/dnsmasq
```

Para que *homebrew* pueda actualizar **dnsmasq** y regenerar el enlace, cambiamos los permisos:

```bash
chown $(whoami):staff /usr/local/sbin/dnsmasq
```

A continuación deberemos ejecutar una serie de comandos manualmente. Durante la instalación, *homebrew* muestra cuáles son:

```bash
cp $(brew list dnsmasq | grep /dnsmasq.conf.example$) /usr/local/etc/dnsmasq.conf
sudo cp $(brew list dnsmasq | grep /homebrew.mxcl.dnsmasq.plist$) /Library/LaunchDaemons/
sudo launchctl load /Library/LaunchDaemons/homebrew.mxcl.dnsmasq.plist
```

Por último, configuramos **dnsmasq**. Para ello, editamos el fichero `/usr/local/etc/dnsmasq.conf`y añadimos justo al final las siguientes líneas:

```apache
address=/dev/127.0.0.1
address=/lan/127.0.0.1
address=/home/127.0.0.1
```

Con esto, cualquier petición que acabe en `.dev`, `.lan` o `.home` será interpretada por el servidor de DNS, y responderá con IP de destino 127.0.0.1 (localhost).

## Configuración del sistema

Ahora que tenemos configurado el servidor de DNS, vamos a hacer que el sistema operativo envíe cualquier petición con la extensión `.dev`, `.lan` o `.home` al mismo, pero que utilice el servidor de DNS por defecto para cualquier otra petición. En sistemas tipo Linux se puede utilizar el fichero Para ello, creamos el directorio `/etc/resolver`:

```bash
sudo mkdir -p /etc/resolver
```

Y dentro de dicho directorio creamos tres ficheros, llamados `dev`, `lan` y `home`, cada uno de ellos con el siguiente contenido:

```bash
nameserver 127.0.0.1
```

Por último, reiniciamos el servidor de DNS:

```bash
sudo launchctl stop homebrew.mxcl.dnsmasq
sudo launchctl start homebrew.mxcl.dnsmasq
```

Para probar que la configuración funciona, podemos utilizar el comando `ping` y ver si se resuelven nombres aleatorios con las extensiones configuradas:

![Ping example](/img/ping-test.png)
