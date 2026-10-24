## Resumen

Implementa la vista de acceso, con pestañas para iniciar sesión y registrarse. Valida los datos en el navegador, muestra avisos junto a cada campo y se adapta al ancho de la pantalla. No llama todavía a la API.

## Cambios incluidos

Sustituye los marcadores de /login y /registro por la misma vista.
Muestra HabitSquad, «Cumple tu hábito. Que no caiga la racha.», las pestañas Iniciar sesión y Registrarme, los campos Correo y Contraseña, y el texto «Después podrás crear un escuadrón o unirte a uno.».
En iniciar sesión el botón es «Entrar». El correo se normaliza a minúsculas. La contraseña solo se exige: no se aplican las reglas de alta.
En registrarse el botón es «Crear cuenta». Exige un email válido y una contraseña de al menos 8 caracteres, que no sea solo números, ni común, ni demasiado parecida al email.
Si los datos no valen, muestra el aviso en rojo junto al campo, marca el campo como no válido y no entrega el formulario. Al corregir un campo, retira solo ese aviso.
El fondo ocupa toda la ventana. En móvil el formulario usa el ancho disponible; en escritorio queda centrado. Respeta los márgenes de la muesca y de la barra inferior.
Añade pruebas Vitest del login y de la validación local del registro.

## Contrato principal

Ruta de login: /login. Ruta de registro: /registro. Cada pestaña enlaza con la otra.
Login válido: correo con formato de email y contraseña no vacía. Se entrega el correo en minúsculas y la contraseña tal cual, espacios incluidos.
Registro válido: email normalizado y contraseña que cumple las reglas locales. Se entrega ese par.
Correo vacío: «Introduce tu correo.» en el login y «Introduce tu email.» en el registro.
Correo inválido: «Introduce un correo válido.» en el login y «Introduce un email válido.» en el registro.
Contraseña vacía: «Introduce tu contraseña.» en el login y «Introduce una contraseña.» en el registro.
Contraseña corta, solo numérica, común o parecida al email: solo se rechaza en el registro.
Datos inválidos: no se llama a onSubmit.
Ninguna de las dos pantallas llama a la API. No se interpretan respuestas 200, 201, 400, 401 ni 429.

## Validación

Comprobaciones de este cambio:

 Frontend: npm test — 54 pruebas, 5 ficheros, todas pasan. De ellas, el login tiene 3 y el registro 17.
 Frontend: npm run build — el build de Vite termina correctamente.
 Ruff, python manage.py check, makemigrations --check, spectacular --validate y pytest no forman parte de este cambio: no hay código Python ni endpoint nuevo. El workflow de CI los sigue ejecutando en el pull request.

## Aceptación

No se puede cumplir desde este cambio. Que la PBI cumpla sus condiciones de satisfacción y que el dueño del producto la acepte es una decisión suya, posterior a la revisión. El autor no puede darla por hecha.

## Código y revisión (peer review)

Se puede cumplir solo en parte, y la revisión todavía no. El código nuevo es JavaScript y sigue el estilo del frontend (funciones que devuelven DOM, Tailwind y pruebas junto al código). PEP 8 y ruff no se aplican a estos ficheros; no hay Python modificado. La aprobación de al menos otro integrante no se puede cumplir hasta que alguien distinto del autor apruebe el pull request.

## Pruebas automatizadas y cobertura

Se puede cumplir en GitHub Actions y ya está cumplida en local la parte de frontend. Vitest cubre la vista de login y la validación local del registro. npm test pasa. El workflow .github/workflows/ci.yml ejecuta npm test y npm run build en el pull request. No hay pruebas pytest nuevas porque no hay funcionalidad de backend. Estas pruebas no simulan lo que devuelve la API. No se afirma aquí que la ejecución de Actions ya haya terminado en verde.

## Documentación

No se puede cumplir tal como está redactada la condición, y en este cambio no corresponde actualizar la API. No hay endpoint nuevo, así que OpenAPI, Swagger y /api/schema/ no cambian. Tampoco se ha modificado el README ni una guía de usuario. Las pantallas quedan descritas en este fichero.

## Cumplimiento de GUI y usabilidad

Se cumple el diseño mobile-first en el navegador de desarrollo. Iniciar sesión se comprobó a 320 px y en escritorio: el fondo cubre la ventana, el formulario no se desborda y la pestaña Registrarme abre /registro sin recargar. Un login vacío muestra los avisos de correo y contraseña. No se puede cumplir la prueba en un móvil real con la PWA instalada: hace falta la versión servida por HTTPS en un dispositivo físico.

## Despliegue e integración

No se puede cumplir todavía. El cambio no está en main. GitHub Actions solo ejecuta la integración continua (comprobaciones, pruebas y build); no despliega. La publicación en la máquina virtual de Azure es manual, según docs/DESPLIEGUE.md, y solo tiene sentido después de integrar en main. No se puede afirmar que producción esté actualizada ni que no haya regresiones allí.

## Documentación y prueba manual

Pantallas: /login y /registro, con el servidor de frontend en marcha (npm run dev).
Prueba hecha en el navegador: el login vacío muestra los avisos y la pestaña Registrarme cambia a /registro sin recargar.
No hay página de Swagger ni esquema OpenAPI asociados a estas pantallas.

## Notas

Iniciar sesión y registrarse no crean sesión ni cuenta: solo validan y entregan los datos a onSubmit.
La aceptación del dueño del producto, la revisión de otro integrante, la prueba en un móvil real con la PWA y el despliegue en Azure quedan fuera de lo que este cambio puede cerrar.
