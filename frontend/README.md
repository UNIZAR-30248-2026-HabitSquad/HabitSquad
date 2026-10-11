# Frontend

Aplicación web de HabitSquad implementada con Vite, HTML, Tailwind CSS y
JavaScript.

## Requisitos

- Node.js 22.x (LTS) y npm. La versión está en `.nvmrc`.
- Dependencias fijadas en `package.json` y `package-lock.json`.

## Preparar el entorno local

Desde `frontend/`:

```bash
npm ci
```

`npm ci` instala exactamente las versiones del `package-lock.json`. Para añadir
o actualizar una dependencia se usa `npm install` y se suben los cambios de
`package.json` y `package-lock.json` en el mismo commit. La carpeta
`node_modules/` no se sube; está excluida por el `.gitignore` raíz.

## Comandos de desarrollo

Desde `frontend/`:

```bash
npm run dev       # servidor de desarrollo en http://localhost:5173
npm test          # pruebas con Vitest
npm run build     # build de producción en dist/
npm run preview   # sirve el build de dist/ en local
```

Las pruebas se escriben junto al código con el sufijo `.test.js`, por ejemplo
`src/router.test.js`. Se ejecutan en un DOM simulado con jsdom, así que pueden
crear elementos y lanzar eventos.

## Pantallas y enrutador

Cada pantalla es una función que devuelve un elemento del DOM. Las rutas se
declaran en `src/routes.js`:

```js
{
  path: '/escuadrones/nuevo',
  title: 'Crea tu escuadrón',
  view: () => crearEscuadron(),
}
```

El enrutador (`src/router.js`) usa la History API: las URL son normales
(`/login`, no `/#/login`). Los enlaces internos llevan el atributo
`data-link` para cambiar de pantalla sin recargar la página:

```html
<a href="/registro" data-link>Registrarme</a>
```

Desde código se navega con `router.navigate('/login')`. Las rutas que no
existen muestran la pantalla «Página no encontrada».

## PWA

`vite-plugin-pwa` genera en el build el manifest (`manifest.webmanifest`) y el
service worker (`sw.js`), que guarda la aplicación en caché para que abra sin
conexión. Los iconos están en `public/icons/`.

El service worker solo existe en el build. Para probar la instalación o el
funcionamiento sin conexión:

```bash
npm run build
npm run preview   # http://localhost:4173
```

En Chrome, la pestaña Application de las herramientas de desarrollo muestra el
manifest y el estado del service worker. Para instalarla en un móvil hace falta
HTTPS, así que se prueba con la versión desplegada.

## Estructura

- `index.html`: punto de entrada de la aplicación.
- `src/main.js`: arranca el enrutador.
- `src/router.js`: enrutador con la History API.
- `src/routes.js`: rutas y pantallas.
- `src/views/`: pantallas y componentes de interfaz.
- `src/style.css`: importa Tailwind CSS.
- `public/`: ficheros estáticos que se copian tal cual al build, incluidos los
  iconos de la PWA.
- `vite.config.js`: configuración de Vite, Tailwind, la PWA y Vitest.
