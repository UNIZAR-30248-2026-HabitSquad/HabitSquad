const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email = '') {
  const normalizedEmail = String(email).trim().toLowerCase()
  let error = null

  if (!normalizedEmail) {
    error = 'Introduce tu correo.'
  } else if (!EMAIL_PATTERN.test(normalizedEmail)) {
    error = 'Introduce un correo válido.'
  }

  return { ok: !error, email: normalizedEmail, error }
}

export function validateLogin({ email = '', password = '' } = {}) {
  const errors = {}
  const emailResult = validateEmail(email)

  if (emailResult.error) errors.email = emailResult.error

  if (password === '') {
    errors.password = 'Introduce tu contraseña.'
  }

  return {
    ok: !errors.email && !errors.password,
    email: emailResult.email,
    password,
    errors,
  }
}
