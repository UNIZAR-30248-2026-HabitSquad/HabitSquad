const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateLogin({ email = '', password = '' } = {}) {
  const errors = {}
  const normalizedEmail = String(email).trim().toLowerCase()

  if (!normalizedEmail) {
    errors.email = 'Introduce tu correo.'
  } else if (!EMAIL_PATTERN.test(normalizedEmail)) {
    errors.email = 'Introduce un correo válido.'
  }

  if (password === '') {
    errors.password = 'Introduce tu contraseña.'
  }

  return {
    ok: !errors.email && !errors.password,
    email: normalizedEmail,
    password,
    errors,
  }
}
