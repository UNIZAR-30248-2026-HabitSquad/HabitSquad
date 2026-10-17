import {
  clearFieldError,
  clearFormAlert,
  formAlert,
  labeledField,
  notice,
  passwordField,
  setFieldError,
  setSubmitPending,
  showFormAlert,
  submitButton,
} from '../components/forms.js'
import { splitLayout } from '../components/layout.js'
import { authTabs, passwordRecoveryLink } from '../components/navigation.js'
import { validateLogin } from './login.js'
import { validateRegistration } from './registro.js'

const COPY = {
  login: {
    title: 'Iniciar sesión',
    description: 'Cumple tu hábito. Que no caiga la racha.',
    submit: 'Entrar',
    pending: 'Entrando…',
  },
  register: {
    title: 'Registrarme',
    description: 'Un hábito al día, una racha compartida. Empieza creando tu cuenta.',
    submit: 'Crear cuenta',
    pending: 'Creando cuenta…',
  },
}

function accesoScreen({ mode, onSubmit, notice: noticeMessage } = {}) {
  const isLogin = mode === 'login'
  const copy = COPY[mode]
  const { main, content } = splitLayout({
    title: copy.title,
    description: copy.description,
  })

  const form = document.createElement('form')
  form.className = 'mt-7 flex min-w-0 flex-col gap-5'
  form.noValidate = true

  const email = labeledField({
    label: 'Correo',
    id: isLogin ? 'login-email' : 'registro-email',
    name: 'email',
    type: 'email',
    placeholder: 'tu@correo.com',
    autocomplete: isLogin ? 'username' : 'email',
  })
  const password = passwordField({
    label: 'Contraseña',
    id: isLogin ? 'login-password' : 'registro-password',
    name: 'password',
    placeholder: isLogin ? 'Tu contraseña' : 'Mínimo 8 caracteres',
    autocomplete: isLogin ? 'current-password' : 'new-password',
  })

  const submit = submitButton(copy.submit)
  const alert = formAlert()

  const note = document.createElement('p')
  note.className = 'mt-8 text-[0.875rem] leading-relaxed text-pretty text-ink-muted'
  note.textContent = 'Después podrás crear un escuadrón o unirte a uno.'

  function clearField(field) {
    clearFieldError(field.input, field.error)
    clearFormAlert(alert)
  }

  email.input.addEventListener('input', () => clearField(email))
  password.input.addEventListener('input', () => clearField(password))

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    if (submit.disabled) return
    clearFormAlert(alert)

    const values = {
      email: email.input.value,
      password: password.input.value,
    }
    const result = isLogin ? validateLogin(values) : validateRegistration(values)

    for (const field of [email, password]) {
      const message = result.errors[field.input.name]
      if (message) setFieldError(field.input, field.error, message)
      else clearFieldError(field.input, field.error)
    }

    if (!result.ok) {
      const firstInvalid = result.errors.email ? email.input : password.input
      firstInvalid.focus()
      return
    }

    if (typeof onSubmit !== 'function') return

    setSubmitPending(submit, true, copy.pending)
    try {
      await onSubmit({ email: result.email, password: result.password })
    } catch (error) {
      showFormAlert(alert, error.message, submit)
      if (isLogin) {
        password.input.focus()
        password.input.select()
      }
    } finally {
      setSubmitPending(submit, false, copy.pending)
    }
  })

  form.append(email.wrapper, password.wrapper)
  if (isLogin) form.append(passwordRecoveryLink())
  form.append(submit)

  content.append(authTabs(mode))
  if (noticeMessage) {
    const noticeWrapper = document.createElement('div')
    noticeWrapper.className = 'mt-5'
    noticeWrapper.append(notice(noticeMessage))
    content.append(noticeWrapper)
  }
  content.append(form, note)
  return main
}

export function loginScreen(options = {}) {
  return accesoScreen({ ...options, mode: 'login' })
}

export function registroScreen(options = {}) {
  return accesoScreen({ ...options, mode: 'register' })
}
