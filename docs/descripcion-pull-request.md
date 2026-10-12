------------------------------------------------------------------
Resumen
Implementa la pantalla «Únete a un escuadrón»: casillas para un código de invitación de 6 caracteres, avisos de error y adaptación al ancho de la pantalla.

Cambios incluidos
Sustituye el marcador de /escuadrones/unirse por la pantalla unirseEscuadronScreen.
Añade seis casillas de un carácter:
Pasa el texto a mayúsculas y solo acepta letras y números.
Avanza el foco al escribir y, con retroceso en una casilla vacía, borra la anterior.
Reparte un código pegado entre las casillas.
Muestra el aviso «Introduce el código completo de 6 caracteres.» si se envía un código incompleto.
Marca las casillas como no válidas y las asocia al aviso.
Retira el aviso y el marcado en cuanto se corrige o se pega un código.
Permite publicar un aviso desde quien procesa el código, por ejemplo si el código no existe.
Si esa operación devuelve una promesa, desactiva el botón hasta que termina.
Si falla, muestra el mensaje del error o, si no hay mensaje, «No se ha podido unir al escuadrón. Inténtalo de nuevo.», y reactiva el botón.
Enlaza «Crear un escuadrón» con /escuadrones/nuevo.
Mantiene la columna centrada y legible desde 320 px hasta escritorio.
Añade pruebas Vitest de la introducción del código y del feedback visual.

Contrato principal
Ruta: /escuadrones/unirse.
Código válido para enviar: 6 caracteres, letras o números, en mayúsculas.
Código incompleto: aviso visible y casillas marcadas; no se entrega el código.
Código completo: se entrega el valor a onSubmit, si existe.
Fallo al unirse: aviso con el mensaje del error.
Unión en curso: el botón queda desactivado.
La pantalla no llama todavía a ninguna API. Un código completo no hace nada si no se pasa onSubmit.

Validación
Comprobaciones de este cambio:
 Frontend: npm test — 34 pruebas, 3 ficheros, todas pasan.
 Frontend: npm run build — el build de Vite termina correctamente.
 Ruff, python manage.py check, makemigrations --check, spectacular --validate y pytest no forman parte de este cambio: no hay código Python ni endpoint nuevo. El workflow de CI los sigue ejecutando en el pull request.

Condiciones de aceptación:

Aceptación. No se puede cumplir desde este cambio. Que la PBI cumpla sus condiciones de satisfacción y que el dueño del producto la acepte es una decisión suya, posterior a la revisión. El autor no puede darla por hecha.

Código y revisión (peer review). Se puede cumplir solo en parte, y la revisión todavía no. El código nuevo es JavaScript y sigue el estilo del frontend (funciones que devuelven DOM, Tailwind y pruebas junto al código). PEP 8 y ruff no se aplican a estos ficheros; no hay Python modificado. La aprobación de al menos otro integrante no se puede cumplir hasta que el pull request exista y esa persona lo apruebe.

Pruebas automatizadas y cobertura. Se puede cumplir en GitHub Actions y ya está cumplida en local la parte de frontend. Vitest cubre la introducción del código de 6 caracteres y el feedback visual; npm test pasa (34 pruebas). El workflow .github/workflows/ci.yml ejecuta npm test y npm run build en cada pull request, así que esa parte se confirma al abrirlo. No hay pruebas pytest nuevas porque no hay funcionalidad de backend. No se puede afirmar todavía que Actions haya pasado: el pull request no está abierto.

Documentación. No se puede cumplir tal como está redactada la condición, y en este cambio no corresponde actualizar la API. No hay endpoint nuevo, así que OpenAPI, Swagger y /api/schema/ no cambian. Tampoco se ha modificado el README ni una guía de usuario. La pantalla queda descrita en este fichero.

Cumplimiento de GUI y usabilidad. Se cumple el diseño mobile-first en el navegador de desarrollo. La pantalla sigue el diseño acordado y se comprobó a 320 px, a 390 px y en escritorio: el código se escribe, el aviso aparece y desaparece, y «Crear un escuadrón» navega sin recargar. No se puede cumplir la prueba en un móvil real con la PWA instalada: hace falta la versión servida por HTTPS en un dispositivo físico.

Despliegue e integración. No se puede cumplir todavía. El cambio no está en main. GitHub Actions solo ejecuta la integración continua (comprobaciones, pruebas y build); no despliega. La publicación en la máquina virtual de Azure es manual, según docs/DESPLIEGUE.md, y solo tiene sentido después de integrar en main. No se puede afirmar que producción esté actualizada ni que no haya regresiones allí.

Documentación y prueba manual
Pantalla: /escuadrones/unirse, con el servidor de frontend en marcha (npm run dev).
Prueba manual hecha en el navegador: código X8K9QL, aviso de código incompleto y enlace a crear un escuadrón.
No hay página de Swagger ni esquema OpenAPI asociados a esta pantalla.

Notas
Un código de 6 caracteres correcto no une a ningún escuadrón hasta que exista la llamada a la API.
La aceptación del dueño del producto, la revisión de otro integrante, la prueba en un móvil real con la PWA y el despliegue en Azure quedan fuera de lo que este cambio puede cerrar.
--------------------------------------------------------------------
