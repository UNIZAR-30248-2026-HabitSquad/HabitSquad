## Resumen

Conecta la pantalla de registro (`/registro`) con el endpoint del backend `POST /api/auth/register/` (PBI #1, tarea T05). Gestiona la validación y errores devueltos por el servidor (correo repetido, contraseña rechazada, límite de peticiones), inicia sesión automáticamente mediante JWT (`POST /api/auth/token/`), persiste los tokens en `localStorage` y redirige al usuario a la pantalla principal.

## Cambios incluidos

- Conecta el formulario de registro (`/registro`) mediante el cliente `register` en [`src/api.js`](file:///c:/Users/juano/HabitSquad/frontend/src/api.js).
- Gestión de estado del botón «Crear cuenta»: se desactiva con estado de espera durante la llamada para impedir envíos múltiples.
- Integración y presentación de errores devueltos por la API:
  - Error 400 por correo ya registrado: muestra «Ya existe una cuenta con este email.» asociado al campo de correo, lo marca como no válido y traslada el foco al input.
  - Error 400 por contraseña rechazada: asocia el mensaje de error devuelto por los validadores de Django al campo de contraseña y le otorga el foco.
  - Error 429 por límite de solicitudes: muestra el aviso «Has superado el número de registros. Espera un rato y vuelve a probar.».
  - Errores de red o inesperados: muestra el aviso «No se ha podido crear la cuenta. Comprueba tu conexión e inténtalo de nuevo.».
- Flujo de sesión completo tras registro exitoso (201 Created):
  - Solicita el par de tokens a `POST /api/auth/token/` mediante `login`.
  - Guarda `habitsquad.access` y `habitsquad.refresh` en `localStorage` mediante `session.js`.
  - Redirección automática sin recarga a la pantalla principal (`/`).
- Mantiene la compatibilidad de navegación con la ruta `/menu`.
- Documenta el flujo en `README.md`, `backend/README.md`, `frontend/README.md`, `docs/AUTENTICACION_JWT.md` y en las descripciones de OpenAPI.
- Añade pruebas unitarias con Vitest para el cliente de registro (`src/api.test.js`), integración en rutas (`src/routes.test.js`) y feedback visual en la vista (`src/views/registro.test.js`).

## Contrato principal

- Ruta: `/registro`.
- Endpoint de alta: `POST /api/auth/register/` con `{ email, password }`.
- Registro exitoso (201): desencadena petición a `POST /api/auth/token/` con las mismas credenciales.
- Inicio de sesión correcto (200): almacena `habitsquad.access` y `habitsquad.refresh` en `localStorage` y redirige a la pantalla principal (`/`).
- Correo ya existente (400 con `email`): mensaje específico en el campo de correo, marcado como no válido.
- Contraseña rechazada por Django (400 con `password`): mensaje específico en el campo de contraseña, marcado como no válido.
- Límite superado (429): aviso general de límite alcanzado.
- Fallo de conexión o 500: aviso general de reintento sin perder los datos del formulario.

## Validación

Comprobaciones ejecutadas para este cambio:

- Frontend: `npm test` — 98 pruebas en 9 ficheros, todas pasan.
- Frontend: `npm run build` — el build de Vite compila sin errores, generando el manifiesto PWA y service worker.
- Backend: `pytest` — 42 pruebas pasan (cobertura completa de modelos, autenticación, registro y límites).
- Backend comprobaciones: `python manage.py check`, `python manage.py makemigrations --check`, `ruff check backend` y `python manage.py spectacular --validate` pasan al 100% sin advertencias ni modificaciones pendientes.

## Aceptación

No se puede cumplir desde este cambio. Que la PBI cumpla sus condiciones de satisfacción y que el Product Owner la acepte formalmente es una decisión posterior a la revisión del sprint. El autor no puede darla por hecha.

## Código y revisión (peer review)

Cumplido por parte del autor. El código nuevo sigue los estándares del proyecto (JavaScript modular con funciones que devuelven DOM, clases utilitarias de Tailwind, persistencia en `session.js` y pruebas unitarias con Vitest junto al código). En backend únicamente se actualizan docstrings y descripciones de OpenAPI. La revisión requiere la aprobación de al menos otro integrante del equipo en GitHub.

## Pruebas automatizadas y cobertura

Se cumple en local y se validará en GitHub Actions. Vitest cubre la llamada a `POST /api/auth/register/`, la obtención de tokens en `POST /api/auth/token/`, la gestión de errores (400, 429, red) y el feedback visual en la vista. `pytest` en backend cubre el endpoint de registro, persistencia en base de datos y esquema OpenAPI. El workflow `.github/workflows/ci.yml` ejecutará la suite completa al abrir el pull request.

## Documentación

Cumplido. Se ha actualizado la sección «Registro de cuenta» en `README.md`, el resumen en `backend/README.md`, `frontend/README.md`, la guía `docs/AUTENTICACION_JWT.md` y el esquema OpenAPI/Swagger (`/api/docs/` y `/api/schema/`), explicitando que `/api/auth/register/` no emite tokens y que el frontend solicita la sesión en `/api/auth/token/`.

## Cumplimiento de GUI y usabilidad

Cumplido en navegador de desarrollo. La pantalla mantiene el diseño mobile-first Duolingo con cristal y mascota acordado, se comprobó tanto en resoluciones móviles estrechas (320 px y 375 px) como en escritorio. El foco se sitúa en los campos con error, el botón se deshabilita durante la petición evitando clics repetidos y la redirección a `/` no provoca recarga completa de página. La prueba en dispositivo móvil real con PWA instalada requiere el despliegue previo con HTTPS.

## Despliegue e integración

No se puede cumplir todavía. Este cambio está en una rama de características (`feature/acceso-login-registro`). El despliegue continuo en la máquina virtual de Azure se ejecutará automáticamente tras fusionar en `main`.

## Documentación y prueba manual

1. Iniciar backend: `python manage.py runserver` en `http://127.0.0.1:8000`.
2. Iniciar frontend: `npm run dev` en `frontend/` y abrir `http://localhost:5173/registro`.
3. Probar registro exitoso: introducir correo no registrado y contraseña válida. Pulsar «Crear cuenta». Verificar redirección a `/` y presencia de tokens `habitsquad.access` y `habitsquad.refresh` en `localStorage`.
4. Probar correo duplicado: volver a `/registro` e introducir el mismo correo. Comprobar que aparece el error «Ya existe una cuenta con este email.» sobre el campo de correo con borde rojo.
5. OpenAPI: consultar `http://127.0.0.1:8000/api/docs/` y revisar la descripción de `POST /api/auth/register/`.

## Notas

El endpoint `POST /api/auth/register/` devuelve 201 Created con datos públicos del usuario (`id`, `email`, `date_joined`) sin tokens; por diseño la sesión se establece encadenando la llamada a `POST /api/auth/token/`.
La aprobación de la PBI por el Product Owner, la revisión por pares y el despliegue final en producción quedan fuera del alcance que este cambio puede cerrar de forma aislada.
