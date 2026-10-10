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
`src/api.test.js`.

## Estructura

- `index.html`: punto de entrada de la aplicación.
- `src/main.js`: código JavaScript inicial.
- `src/style.css`: importa Tailwind CSS.
- `public/`: ficheros estáticos que se copian tal cual al build.
- `vite.config.js`: configuración de Vite, Tailwind y Vitest.
