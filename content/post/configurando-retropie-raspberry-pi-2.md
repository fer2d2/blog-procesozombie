+++
author = "@FeR2D2"
date = "2016-03-06T14:00:34+01:00"
title = "El media center definitivo con Retropie y Raspberry-Pi (Parte 1: Instalación)"
comments = true
+++

Recientemente adquirí un proyector con la idea de utilizarlo para el visionado de series y películas, además de poder jugar a videojuegos de plataformas antiguas mediante emuladores. Para ello decidí darle uso a mi Raspberry-Pi, construyendo una pequeña estación de videojuegos retro y centro multimedia, instalando la distribución [Retropie](http://blog.petrockblock.com/retropie/ "Sitio oficial de Retropie").

Para instalar la distro, se pueden utilizar los métodos recomendados en la web de la propia distribución. Yo, en lo personal, prefiero seguir los [métodos oficiales](https://www.raspberrypi.org/documentation/installation/):

- Utilizar Win32DiskImager en Windows.
- Usar el comando `dd` en Linux y Mac OS X.

Como yo estoy trabajando desde un Mac, explicaré los pasos para este sistema operativo. Por su similitud con Linux, también detallaré las pequeñas diferencias que se pueden apreciar durante el proceso:

## Descargar la imagen de Retropie

Una vez accedemos al sitio oficial, simplemente tenemos que localizar la [sección de descargas](http://blog.petrockblock.com/retropie/retropie-downloads/) y obtener la imagen que necesitemos dependiendo de nuestro modelo de Raspberry-Pi. En mi caso se trata de la imagen **RetroPie SD-card Image for Raspberry Pi 2 and 3**. En mi caso he descargado la versión *Standard*.

## Escribir el contenido de la imagen en una tarjeta SD.

He elegido una tarjeta MicroSD de 32GB de Samsung, que podéis encontrar a un precio muy económico en [Amazon](http://www.amazon.es/dp/B00J29BR3Y/ref=asc_df_B00J29BR3Y32388716/?tag=googshopes-21&creative=24538&creativeASIN=B00J29BR3Y&linkCode=df0&hvdev=c&hvnetw=g&hvqmt=) y nos garantiza una velocidad de lectura/escritura decente al ser de *clase 10*.

Los pasos a seguir se realizarán desde terminal:

### 1. Obtener el punto de montaje de la tarjeta SD

Antes de insertar la tarjeta, ejecutamos un comando que nos permita listar las unidades que tenemos en el PC y seleccionar .

```bash
# En Linux
df -h
# En MacOSX
diskutil list
```

Esto nos debería mostrar una lista de los dispositivos montados en nuestro sistema:

![Listar discos](/img/list-disks1.png)

A continuación, conectamos la tarjeta SD y listamos de nuevo los dispositivos con el comando anterior:

![Listar discos](/img/list-disks2.png)

Con esto podemos identificar cuál es el disco sobre el que tenemos que operar, que en mi caso se llama **disk2**. En el caso de Linux, probablemente recibiría un nombre similar a */dev/sdd*.

### 2. Desmontar la tarjeta SD

Para desmontar la tarjeta, ejecutamos el comando necesario dependiendo de nuestro sistema operativo, donde deberéis reemplazar *sdd* o *disk2* por el punto de montaje que hayáis identificado en el paso anterior:

```bash
# En Linux
umount /dev/sdd1 # Se añade el "1" para desmontar la primera partición
# En MacOSX
diskutil unmountDisk /dev/disk2
```

### 3. Copiar el contenido de la imagen en la tarjeta SD

Para escribir el contenido de la imagen en la memoria SD, utilizamos el comando `dd`:

*Nota*: En MacOSX, el nombre del punto de montaje deberá llevar delante una **r**. Por ejemplo, *disk2* pasa a ser *rdisk2*. Si el comando falla (depende de versiones de MacOSX), entonces probar con *disk2*.

```bash
# En Linux
dd bs=4M if=nombre-fichero.img of=/dev/sdd
# En MacOSX
dd bs=1M if=nombre-fichero.img of=/dev/rdisk2
```

![Copiar imagen en SD](/img/dd-copy.png)

El proceso puede tardar un rato en ejecutar. No lo detengáis hasta que en la consola se muestre el comando como finalizado, o se vuelva a mostrar el [prompt](https://es.wikipedia.org/wiki/Prompt):

![Copiar imagen en SD](/img/sd-copy-finalizado.png)

Finalizado este paso, nos resta conectar a nuestra Raspberry-Pi un monitor y un teclado, y empezar a configurar el sistema. De ello hablaré en el **próximo artículo**, donde comentaré:

- Expandir el sistema de ficheros.
- Configurar la conexión WiFi.
- Actualizar el sistema.
- Instalar el media center Kodi.
- Controlar Kodi desde el móvil, como si fuera un mando a distancia.
- Cómo configurar un *joypad* USB.
- Cómo instalar ROMS y empezar a jugar.
