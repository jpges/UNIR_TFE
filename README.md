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

Será necesario tener Node.js instalado en el equipo.

- #### Instalación de Node sobre Windows

  Ir a [official Node.js website](https://nodejs.org/) y descargar el instalador.
Asegúrate también que `git` está disponible en tu PATH, `npm` podría necesitarlo (Puedes encontrar git [aquí](https://git-scm.com/)).

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

### Despliegue 🔧

El despliegue del proyecto requiere tener instalado git.

#### Required
* Git::Repository

Instala esta dependencia y clona el repositorio:
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

Estos scripts están basados en truffle. Si deseas utilizarlos es un requerimiento.

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
