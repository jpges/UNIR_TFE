# UNIR_TFE

Trabajo Fin Experto - Desarrollo Aplicaciones Blockchain

Plataforma universitaria de gestión de ECTS y matriculaciones.

## Documentación

El proyecto despliega una plataforma donde pueden registrarse universidades y estudiantes. La plataforma despliega un token
llamado ECTSToken que los estudiantes adquieren comprándolos con Ether. Las universidades registradas publican su oferta de asignaturas
con precio valorado en ECTSToken. Los estudiantes que quieran matricularse en una asignatura, intercambian sus ECTSToken por matrículas 
en las asignaturas publicadas en las que están interesados. El modelo económico se cierra con el reembolso de los ECTSToken a las 
universidades por parte de la plataforma a un precio menor que el costé de adquirirlos por parte de los estudiantes.

Desde el punto de vista técnico de las aplicaciones blockchain, el proyecto se centra en el desarrollo de varios smart contracts 
donde reside la lógica, los ECTSToken que extienden los tokens ERC20 y las asignaturas publicadas que extienden el ERC721. 

Funcionalmente también permite registrar el aprobado de una asignatura por parte de la universidad y abre la puerta a la implementación
de un mecanismo de emisión de claims en un modelo de identidad digital basado en ERC725 y ERC735.

_La memoria del proyecto se encuentra en_ 
https://github.com/jpges/UNIR_TFE/blob/master/docs/TFE_Titulaciones_tokenizadas-Jose_Pastor-20200316.pdf


### Pre-requisitos 📋

#### Node.js y npm

Será necesario tener Node.js instalado en el equipo.

- #### Instalación de Node sobre Windows

  Ir a [official Node.js website](https://nodejs.org/) y descargar el instalador.

- #### Instalación de Node sobre Ubuntu

  Puedes instalar nodejs y npm fácilmente con apt install, solo tienes que ejecutar estos comandos:

      $ sudo apt install nodejs
      $ sudo apt install npm

- #### Para otros sistemas operativos
  Puedes encontrar más información sobre la instalación en [official Node.js website](https://nodejs.org/) y la [official NPM website](https://npmjs.org/).

Si la instalación es correcta, ejecutando los siguientes comandos podrás ver algo similar a: 

    $ node --version
    v8.17.0

    $ npm --version
    6.13.4

Si necesitas actualizar `npm`, puedes utilizar el propio `npm`, ejecutando el siguiente comando y preguntando de nuevo por la versión

    $ npm install npm -g
    
   
#### Git

Para descargar e instalar el proyecto también será necesario tener instalado GIT.

- #### Instalación de Git sobre Windows

  Solo tienes que visitar http://git-scm.com/download/win y la descarga empezará automáticamente. Fíjate que éste es un proyecto conocido como Git para Windows (también llamado msysGit), el cual es diferente de Git. Para más información acerca de este proyecto visita http://msysgit.github.io/.
  
  Asegúrate también que `git` está disponible en tu PATH, `npm` podría necesitarlo.

- #### Instalación de Git sobre Ubuntu

  Puedes usar apt-get:
  	````
    $ apt-get install git
    ````
- #### Para otras opciones o sistemas operativos
  Para opciones adicionales, la página web de Git tiene instrucciones de instalación en diferentes tipos de Unix. Puedes encontrar esta información en http://git-scm.com/download/linux.

Si la instalación es correcta, ejecutando los siguientes comandos podrás ver algo similar a: 

    $ git --version
    git version 2.7.4

### Despliegue 🔧

Descarga o clona el repositorio desde:
```
https://github.com/jpges/UNIR_TFE.git
```

#### Instala el proyecto :hammer:
Simplemente, en el directorio raiz del proyecto, donde está el package.json, ejecuta:
```
npm install
```

## Inicio :rocket:

Igualmente, en el directorio raiz del proyecto, ejecuta:

```
npm start
```  

A partir de este momento podrás acceder a la aplicación en [localhost:8000](http://localhost:8000)


## Compilación, migración y prueba :construction:

Para poder realizar este tipo de acciones es un pre-requisito tener instalado el framework de desarrollo **truffle** (no es necesario para desplegar el proyecto y arrancarlo, pero sí para ejecutar los planes de prueba).

#### Truffle (Required) ####
Para instalarlo simplemente debes ejecutar
````
npm install truffle -g
````

El sistema se ha provisto con 3 configuraciones de migración y prueba que pueden ser consultadas en el fichero truffle-config.js y que se han llamado "ganache", "testnet" y "alastria".

Para arrancar nuestra compilación, desde el directorio raiz del proyecto ejecutaremos:
````
truffle compile --all
````
Para ejecutar la migración de nuestros SC, dependiendo de la red utilizaremos:
````
truffle migrate --network [network]  --reset
````
Donde deberemos sustituir ````[network]```` por la correspondiente red sobre la que estemos migrando, "ganache", "testnet" o "alastria".

Por último, para ejecutar el plan de pruebas sobre las diferentes redes, utilizaremos:
````
truffle test --network [network]
````
Igualmente sustituiremos ````[network]```` por la correspondiente red sobre la que pretendamos probar, "ganache", "testnet" o "alastria".

Para un **entorno local de desarrollo como ganache**, se han incorporado 3 scripts al fichero package.json que nos facilitarán estas tareas (en algunos IDEs como el VSCode, los scripts package.json pueden ser lanzados visualmente desde el propio IDE).

Para la compilación lanza 
```
npm compile
```  

Para la migración lanza
```
npm migrate
```  

Y para lanzar el plan de pruebas definido, ejecuta
```
npm test
```  

## Desarrollado con 🛠️

* [VS Vode](https://code.visualstudio.com/) - Editor de código gratuito construido sobre software libre.

## Autor ✒️

* **José Enrique Pastor Galiana** - [jpges](https://github.com/jpges)

## Mis agradecimientos 🎁

* Una cerveza 🍺 para todos los miembros del grupo Telegram EU_Blockchain_UNIR, sin los cuales, no sé si hubiese llegado a esto, pero para ello seguro que me lo habría pasado mucho peor 🤓🤓🤓. Gracias chicos, por haber estado siempre atentos para ayudarme.
* Iñigo García de Mata, mi tutor en el proyecto.
