# Código de inicio de sesión quitado

Este archivo describe el código de inicio de sesión eliminado del trabajo local, todavía sin commit. El commit `d93c385` (`feat: add responsive login and registration screens`) no se ha modificado: la pantalla de iniciar sesión, la ruta `/login` y `frontend/src/views/login.test.js` de ese commit siguen en el repositorio.

## `login.js`

- Ubicación: `frontend/src/auth/login.js`
- Qué se quitó: el fichero entero. Llamaba a `POST /api/auth/token/` con el correo y la contraseña. Si la respuesta era `200` y traía `access` y `refresh`, los guardaba en `localStorage` con las claves `habitsquad.access` y `habitsquad.refresh` y devolvía el mensaje «Has iniciado sesión.» junto con la redirección a `/menu`. Un `401` devolvía «No se ha podido iniciar sesión con esos datos.», sin mostrar el texto en inglés del backend. Un `429` devolvía «Has superado el número de intentos. Prueba más tarde.». Un fallo de red, un JSON inválido o una respuesta sin los dos tokens devolvía «No se ha podido iniciar sesión. Inténtalo de nuevo.». También exportaba `saveSession`, `readSession` y `MENU_PATH`.

## `login.test.js`

- Ubicación: `frontend/src/auth/login.test.js`
- Qué se quitó: el fichero entero. Probaba `loginWithPassword` con `fetch` simulado: guardado de `access` y `refresh` en un `200`, aviso genérico en un `401` sin dejar tokens, aviso de límite en un `429` y aviso de fallo si no hay conexión.

## `login.test.js` de la vista

- Ubicación: `frontend/src/views/login.test.js`
- Qué se quitó: dos pruebas añadidas encima del commit, no las del commit. Una comprobaba que un resultado `{ ok: false, message }` mostraba «No se ha podido iniciar sesión con esos datos.» en `#login-request-feedback` y reactivaba el botón. La otra comprobaba que `{ ok: true, message: 'Has iniciado sesión.' }` ponía ese texto con `role="status"`. El fichero volvió al contenido del commit.

## `routes.js`

- Ubicación: `frontend/src/routes.js`
- Qué se quitó: el import de `loginWithPassword` desde `frontend/src/auth/login.js` y su uso en la ruta `/login`. La ruta quedó otra vez como `loginScreen()`, sin enviar el formulario al backend.

## `registro.js`

- Ubicación: `frontend/src/auth/registro.js`
- Qué se quitó: el import de `loginWithPassword` y de `MENU_PATH` desde el cliente de login. Tras un `201` de `POST /api/auth/register/` ya no se llama a `POST /api/auth/token/` con el mismo correo y la misma contraseña. También se quitó el mensaje «La cuenta se ha creado, pero no se ha podido iniciar la sesión.». El alta sigue redirigiendo a `/menu` sin guardar tokens.

## `registro.test.js`

- Ubicación: `frontend/src/auth/registro.test.js`
- Qué se quitó: la prueba que esperaba una segunda petición a `/api/auth/token/`, el guardado de `access` y `refresh`, y la prueba del fallo al abrir la sesión después de crear la cuenta. La prueba de alta correcta ahora solo espera la petición a `/api/auth/register/` y la redirección a `/menu`.

## `menu.js`

- Ubicación: `frontend/src/views/menu.js`
- Qué se quitó: el texto «Ya has iniciado sesión.». La pantalla dice «Tu cuenta está creada.».

## `acceso.js`

- Ubicación: `frontend/src/views/acceso.js`
- Qué se quitó: el aviso único de fallo «No se ha podido iniciar sesión. Inténtalo de nuevo.» para cualquier envío que rechazara la promesa. En registrarse el aviso pasa a ser «No se ha podido crear la cuenta. Inténtalo de nuevo.». La frase de inicio de sesión solo se mantiene si el modo del formulario es login.
