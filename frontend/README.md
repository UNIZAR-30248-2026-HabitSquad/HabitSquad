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

Desde código se navega con `router.navigate('/login')`; cada pantalla recibe
`navigate` como argumento de `view`. Las rutas que no existen muestran la
pantalla «Página no encontrada».

Una ruta con `private: true` exige sesión: sin ella, el enrutador lleva a
`/login`. Una con `guestOnly: true` (login y registro) lleva a `/` si ya hay
sesión. Ambas redirecciones sustituyen la entrada del historial.

## Diseño responsive y componentes

La interfaz es mobile-first: primero se compone para una columna estrecha y
después se adapta con los prefijos `sm:` y `lg:` de Tailwind. El estilo es
minimalista: fondo claro, tipografía del sistema y un único color de acento.
Este diseño solo se aplica a las pantallas de acceso (iniciar sesión,
registro y recuperar contraseña); el resto mantiene su propio estilo.
Los colores son tokens de `src/style.css` (`bg-canvas`, `text-ink`,
`text-ink-muted`, `bg-accent`, `text-streak`…); no se escriben valores
hexadecimales en las vistas. El naranja de la racha se reserva para el número
de días.

En pantallas grandes, junto al formulario aparece un móvil con el panel del
escuadrón tal como está en el diseño; en el móvil solo se ve el formulario.

Las piezas repetidas viven en `src/components/` y las pantallas solo componen
esos bloques y contienen su lógica:

- `layout.js`: `splitLayout`, columna principal con marca, título y contenido,
  y la vista previa en escritorio.
- `squadPreview.js`: maqueta decorativa del panel del escuadrón (oculta a
  lectores de pantalla).
- `forms.js`: campos, contraseña con mostrar/ocultar, errores, avisos y botón
  de envío con estado de espera.
- `navigation.js`: selector Iniciar sesión / Registrarme, enlace de
  recuperación y enlace de volver.
- `brand.js` e `icons.js`: icono de la app, nombre e iconos SVG.

Al crear una pantalla nueva se reutilizan estos componentes antes de copiar
clases o crear otra variante parecida.

## Sesión y llamadas a la API

Al iniciar sesión, `login()` (`src/api.js`) guarda el access y el refresh
token en `localStorage` (`src/session.js`). Las llamadas a endpoints que
requieren sesión se hacen con `authFetch`, que acepta los mismos argumentos que
`fetch` y añade `Authorization: Bearer <access>`:

```js
import { authFetch } from './api.js'

const response = await authFetch('/api/escuadrones/', { method: 'POST', body })
```

Si la API responde `401`, `authFetch` renueva los tokens con
`/api/auth/token/refresh/` y repite la petición una vez. Si varias peticiones
caducan a la vez, se hace una sola renovación. Si el refresh ya no vale, borra
la sesión y la aplicación vuelve a `/login`. `logout()` revoca el refresh en
`/api/auth/logout/` y borra la sesión aunque el backend no responda.

El flujo completo de tokens está en `docs/AUTENTICACION_JWT.md`.

### Recuperar la contraseña

La pantalla `/recuperar-contrasena` envía el correo a
`POST /api/auth/password-reset/` con `{ "email": "..." }`. Ese endpoint aún no
existe en el backend; mientras tanto la API responde `404` y la pantalla avisa
de que la función todavía no está disponible. Cuando se implemente, debe
responder `204` exista o no la cuenta, para no revelar qué correos están
registrados, y `429` si se supera el límite de intentos. La pantalla para
escribir la contraseña nueva desde el enlace del correo se hará junto con ese
endpoint.

En desarrollo, `npm run dev` y `npm run preview` reenvían `/api` al backend en
`http://localhost:8000`, así que hay que tener `python manage.py runserver` en
marcha para iniciar sesión. En producción Caddy sirve frontend y API en el
mismo dominio.

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
- `src/main.js`: arranca el enrutador y vuelve a `/login` si caduca la sesión.
- `src/router.js`: enrutador con la History API.
- `src/routes.js`: rutas, pantallas y rutas que exigen sesión.
- `src/api.js`: inicio y cierre de sesión, renovación de tokens y `authFetch`.
- `src/session.js`: guarda los tokens en el navegador.
- `src/components/`: piezas reutilizables de diseño, formularios y navegación.
- `src/views/`: pantallas de la aplicación.
- `src/style.css`: importa Tailwind CSS.
- `public/`: ficheros estáticos que se copian tal cual al build, incluidos los
  iconos de la PWA.
- `vite.config.js`: configuración de Vite, Tailwind, la PWA y Vitest.
