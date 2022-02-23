# Desafío: Nuestra primera Base de Datos

## Instalación del proyecto

Ejecutar el código ```npm install``` para reconstruir los módulos de Node.
Crear el archivo ```.env``` con el siguiente contenido
~~~
PORT=8080
NOD_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=ecommerce
CORS=*
~~~

~~~
Ejecutar el código ```npm install`
~~~

## Comandos a ejecutar


### Ejecutar el servidor con Forever
#### Ejecutar en modo FORK y puerto 9001
~~~
forever index.js -p 9001
~~~
#### Ejecutar en modo CLUSTER y puerto 8080
~~~
forever index.js -p 8080 -m CLUSTER
~~~

#### Ejecutar en modo CLUSTER
~~~
pm2 start index.js --name="appCluster" -i max --watch
~~~

### Ejecutar el servidor con PM2
#### Ejecutar en modo FORK
~~~
pm2 start index.js --name="appFork" --watch
~~~


