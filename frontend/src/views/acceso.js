import { validateRegistration } from './registro.js'
import { openPath } from '../navigation.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const fieldClass = [
  'w-full min-w-0 rounded-xl border border-[#e4e0ef] bg-white',
  'px-4 py-[clamp(0.8rem,2.5vw,1rem)] text-base text-slate-950 outline-none',
  'placeholder:text-[#b0abbf]',
  'focus:border-[#5b32ea] focus:ring-2 focus:ring-[#5b32ea]/20',
  'aria-invalid:border-2 aria-invalid:border-red-600',
  'aria-invalid:focus:border-red-600 aria-invalid:focus:ring-red-600/25',
].join(' ')

function validateLogin({ email = '', password = '' } = {}) {
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

function fieldError(id) {
  const error = document.createElement('p')
  error.id = id
  error.className = 'hidden text-sm font-medium text-red-600'
  error.setAttribute('role', 'alert')
  error.setAttribute('aria-live', 'polite')
  return error
}

function setFieldError(input, error, message) {
  error.textContent = message
  error.classList.remove('hidden')
  input.setAttribute('aria-invalid', 'true')
  input.setAttribute('aria-describedby', error.id)
}

function clearFieldError(input, error) {
  error.textContent = ''
  error.classList.add('hidden')
  input.setAttribute('aria-invalid', 'false')
  input.removeAttribute('aria-describedby')
}

function tab(href, label, active) {
  const link = document.createElement('a')
  link.href = href
  link.dataset.link = ''
  link.textContent = label
  link.className = [
    'min-w-0 border-b-[3px] px-1 pb-3 text-center leading-tight',
    'text-[clamp(0.8rem,3.4vw,1.05rem)] text-balance',
    active
      ? 'border-[#5b32ea] font-bold text-[#5b32ea]'
      : 'border-transparent font-semibold text-[#2a2740]',
  ].join(' ')
  if (active) link.setAttribute('aria-current', 'page')
  return link
}

function labeledField({ label, name, type, placeholder, autocomplete, errorId }) {
  const wrapper = document.createElement('label')
  wrapper.className =
    'flex min-w-0 flex-col gap-2 text-[clamp(0.8rem,3.2vw,0.95rem)] font-semibold text-[#211a45]'
  wrapper.append(label)

  const input = document.createElement('input')
  input.type = type
  input.name = name
  input.placeholder = placeholder
  input.autocomplete = autocomplete
  input.spellcheck = false
  if (type === 'email') input.inputMode = 'email'
  input.setAttribute('aria-invalid', 'false')
  input.className = fieldClass

  const error = fieldError(errorId)
  wrapper.append(input, error)
  return { wrapper, input, error }
}

function accesoScreen({ mode, onSubmit } = {}) {
  const isLogin = mode === 'login'
  const main = document.createElement('main')
  main.className = [
    'flex min-h-dvh w-full min-w-0 flex-col bg-[#f4f2fb]',
    'ps-[env(safe-area-inset-left)] pe-[env(safe-area-inset-right)]',
    'pt-[env(safe-area-inset-top)]',
  ].join(' ')

  const column = document.createElement('div')
  column.className = [
    'mx-auto flex w-full min-w-0 max-w-md flex-1 flex-col',
    'px-[clamp(1rem,5vw,2rem)] pt-[clamp(1.25rem,7vh,4.5rem)]',
    'pb-[max(1.5rem,env(safe-area-inset-bottom))]',
  ].join(' ')

  const heading = document.createElement('h1')
  heading.className = 'sr-only'
  heading.textContent = isLogin ? 'Iniciar sesión' : 'Registrarme'

  const brand = document.createElement('p')
  brand.className = [
    'text-[clamp(1.7rem,8vw,2.35rem)] leading-none font-extrabold',
    'tracking-tight text-balance text-[#5b32ea]',
  ].join(' ')
  brand.textContent = 'HabitSquad'

  const tagline = document.createElement('p')
  tagline.className =
    'mt-2 text-[clamp(0.9rem,3.4vw,1.05rem)] text-balance text-[#5c5678]'
  tagline.textContent = 'Cumple tu hábito. Que no caiga la racha.'

  const tabs = document.createElement('nav')
  tabs.className = 'mt-[clamp(1.75rem,6vh,2.75rem)] grid min-w-0 grid-cols-2 border-b border-[#e4e0ef]'
  tabs.setAttribute('aria-label', 'Acceso')
  tabs.append(
    tab('/login', 'Iniciar sesión', isLogin),
    tab('/registro', 'Registrarme', !isLogin),
  )

  const form = document.createElement('form')
  form.className = 'mt-[clamp(1.25rem,4vh,1.75rem)] flex min-w-0 flex-col gap-5'
  form.noValidate = true

  const email = labeledField({
    label: 'Correo',
    name: 'email',
    type: 'email',
    placeholder: 'tu@correo.com',
    autocomplete: 'email',
    errorId: isLogin ? 'login-email-error' : 'registro-email-error',
  })
  const password = labeledField({
    label: 'Contraseña',
    name: 'password',
    type: 'password',
    placeholder: 'Mínimo 8 caracteres',
    autocomplete: isLogin ? 'current-password' : 'new-password',
    errorId: isLogin ? 'login-password-error' : 'registro-password-error',
  })

  const submitButton = document.createElement('button')
  submitButton.type = 'submit'
  submitButton.className = [
    'mt-1 flex h-[clamp(3rem,12vw,3.5rem)] w-full min-w-0 items-center',
    'justify-center rounded-xl bg-[#5b32ea] px-4',
    'text-[clamp(0.95rem,3.4vw,1.05rem)] font-bold text-white',
    'transition-colors hover:bg-[#4c28cc]',
  ].join(' ')
  submitButton.textContent = isLogin ? 'Entrar' : 'Crear cuenta'
  submitButton.className += ' disabled:cursor-wait disabled:opacity-70'

  const requestFeedback = document.createElement('p')
  requestFeedback.id = 'login-request-feedback'
  requestFeedback.className = 'hidden text-sm font-medium text-red-600'

  function clearRequestFeedback() {
    requestFeedback.textContent = ''
    requestFeedback.classList.add('hidden')
    requestFeedback.removeAttribute('role')
  }

  function showRequestFeedback(message, ok) {
    requestFeedback.textContent = message
    requestFeedback.classList.remove('hidden')
    requestFeedback.classList.toggle('text-red-600', !ok)
    requestFeedback.classList.toggle('text-[#211a45]', ok)
    requestFeedback.setAttribute('role', ok ? 'status' : 'alert')
  }

  const note = document.createElement('p')
  note.className =
    'mt-[clamp(1rem,4vh,1.5rem)] px-1 text-center text-[clamp(0.8rem,3.2vw,0.95rem)] text-pretty text-[#5c5678]'
  note.textContent = 'Después podrás crear un escuadrón o unirte a uno.'

  email.input.addEventListener('input', () => {
    clearFieldError(email.input, email.error)
    clearRequestFeedback()
  })
  password.input.addEventListener('input', () => {
    clearFieldError(password.input, password.error)
    clearRequestFeedback()
  })

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const values = {
      email: email.input.value,
      password: password.input.value,
    }
    const result = isLogin ? validateLogin(values) : validateRegistration(values)

    if (result.errors.email) {
      setFieldError(email.input, email.error, result.errors.email)
    } else {
      clearFieldError(email.input, email.error)
    }

    if (result.errors.password) {
      setFieldError(password.input, password.error, result.errors.password)
    } else {
      clearFieldError(password.input, password.error)
    }

    clearRequestFeedback()

    if (!result.ok) {
      const firstInvalid = result.errors.email ? email.input : password.input
      firstInvalid.focus()
      return
    }

    if (typeof onSubmit !== 'function') return

    const pending = onSubmit({ email: result.email, password: result.password })
    if (!pending || typeof pending.then !== 'function') return

    submitButton.disabled = true
    pending.then(
      (response) => {
        submitButton.disabled = false
        if (response?.errors?.email) {
          setFieldError(email.input, email.error, response.errors.email)
        }
        if (response?.errors?.password) {
          setFieldError(password.input, password.error, response.errors.password)
        }
        if (response?.errors?.email || response?.errors?.password) {
          const firstInvalid = response.errors.email ? email.input : password.input
          firstInvalid.focus()
        }
        if (response?.message) {
          showRequestFeedback(response.message, response.ok === true)
        }
        if (response?.ok && response.redirect) openPath(response.redirect)
      },
      () => {
        submitButton.disabled = false
        showRequestFeedback(
          isLogin
            ? 'No se ha podido iniciar sesión. Inténtalo de nuevo.'
            : 'No se ha podido crear la cuenta. Inténtalo de nuevo.',
          false,
        )
      },
    )
  })

  form.append(email.wrapper, password.wrapper, requestFeedback, submitButton)
  column.append(heading, brand, tagline, tabs, form, note)
  main.append(column)
  return main
}

export function loginScreen(options = {}) {
  return accesoScreen({ ...options, mode: 'login' })
}

export function registroScreen(options = {}) {
  return accesoScreen({ ...options, mode: 'register' })
}
