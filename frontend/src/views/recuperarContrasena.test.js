import { describe, it } from 'vitest'

// T12: pruebas pendientes de recuperar contraseña.
describe('recuperarContrasenaScreen', () => {
  it.todo('no envía un correo inválido')
  it.todo('envía el correo y confirma sin revelar si la cuenta existe')
  it.todo('avisa si el servicio aún no está disponible (404) o hay demasiados intentos (429)')
})
