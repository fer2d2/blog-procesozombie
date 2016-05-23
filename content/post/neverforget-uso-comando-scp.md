+++
date = "2016-05-23T22:04:35+02:00"
title = "Never Forget: uso del comando scp"
comments = true
+++

Inauguro esta sección de publicaciones breves en las que recopilaré todos los comandos de la terminal que, por mi mala memoria, soy incapaz de teclear sin tener que hacer una búsqueda previa en internet o tirar del comando `man`. Por mucho que los repita, por más que me configure un alias, siempre serán mi *Talón de Aquiles*, mi *kryptonita*, mi *némesis*. Y por eso creo que merecen formar parte de este pequeño *Hall of Fame* personal que además me servirá para tenerlos a mano.

## Comando scp

Si has llegado hasta aquí es porque sabes para qué sirve este comando. Copiar ficheros de local a remoto, de remoto a remoto, de remoto a local, sobre SSH.

### Sintaxis genérica

```bash
scp [-P port] [-r] [[usr1@]host1:]file1 ... [[usr2@]host2:]file2
```

- [-P *port*]: puerto del servidor remoto
- [-r]: copiado recursivo (para copiar directorios)
- usr1, usr2: usuario en el host remoto
- host1, host2: hosts remotos
- **file1**: fichero o directorio **origen**
- **file2**: fichero o directorio **destino**

### De local a remoto

```bash
scp -r /path/to/local/file remoteUser@remoteHost:/home/remoteUser/
```

### De remoto a local

```bash
scp -r remoteUser@remoteHost:/path/to/remote/file /path/to/local/destination
```

### De remoto a remoto

```bash
scp -r remoteUser1@remoteHost1:/path/to/remote/sourceFile remoteUser2@remoteHost2:/path/to/remote/destination
```
