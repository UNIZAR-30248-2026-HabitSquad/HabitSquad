import { validateLogin } from './login.js'
import { validateRegistration } from './registro.js'

const fieldClass = [
  'w-full min-w-0 rounded-xl border border-[#e4e0ef] bg-white',
  'px-4 py-[clamp(0.8rem,2.5vw,1rem)] text-base text-slate-950 outline-none',
  'placeholder:text-[#b0abbf]',
  'focus:border-[#5b32ea] focus:ring-2 focus:ring-[#5b32ea]/20',
  'aria-invalid:border-2 aria-invalid:border-red-600',
  'aria-invalid:focus:border-red-600 aria-invalid:focus:ring-red-600/25',
].join(' ')

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

function labeledField({ label, id, name, type, placeholder, autocomplete }) {
  const wrapper = document.createElement('div')
  wrapper.className = 'flex min-w-0 flex-col gap-2'

  const labelElement = document.createElement('label')
  labelElement.htmlFor = id
  labelElement.className =
    'text-[clamp(0.8rem,3.2vw,0.95rem)] font-semibold text-[#211a45]'
  labelElement.textContent = label
  wrapper.append(labelElement)

  const input = document.createElement('input')
  input.id = id
  input.type = type
  input.name = name
  input.placeholder = placeholder
  input.autocomplete = autocomplete
  input.spellcheck = false
  if (type === 'email') input.inputMode = 'email'
  input.setAttribute('aria-invalid', 'false')
  input.className = fieldClass

  const error = fieldError(`${id}-error`)
  wrapper.append(input, error)
  return { wrapper, input, error }
}

function addPasswordToggle(input) {
  input.classList.add('pe-24')

  const row = document.createElement('div')
  row.className = 'relative min-w-0'
  input.replaceWith(row)

  const toggle = document.createElement('button')
  toggle.type = 'button'
  toggle.className = [
    'absolute inset-y-0 end-0 flex items-center rounded-e-xl px-4',
    'text-sm font-semibold text-[#5b32ea] hover:text-[#4c28cc]',
    'focus-visible:outline-2 focus-visible:outline-[#5b32ea]',
  ].join(' ')
  toggle.setAttribute('aria-pressed', 'false')
  toggle.setAttribute('aria-label', 'Mostrar la contraseña')
  toggle.textContent = 'Mostrar'
  toggle.addEventListener('click', () => {
    const visible = input.type === 'password'
    input.type = visible ? 'text' : 'password'
    toggle.textContent = visible ? 'Ocultar' : 'Mostrar'
    toggle.setAttribute('aria-pressed', String(visible))
    toggle.setAttribute(
      'aria-label',
      visible ? 'Ocultar la contraseña' : 'Mostrar la contraseña',
    )
    input.focus()
  })

  row.append(input, toggle)
}

function addCapsLockHint({ input, error }) {
  const hint = document.createElement('p')
  hint.className = 'hidden text-sm font-medium text-amber-700'
  hint.setAttribute('aria-live', 'polite')

  function update(event) {
    const capsLock = event.getModifierState?.('CapsLock') ?? false
    hint.textContent = capsLock ? 'Tienes activadas las mayúsculas.' : ''
    hint.classList.toggle('hidden', !capsLock)
  }

  input.addEventListener('keydown', update)
  input.addEventListener('keyup', update)
  input.addEventListener('blur', () => {
    hint.textContent = ''
    hint.classList.add('hidden')
  })
  error.before(hint)
}

function noticeBox(message) {
  const notice = document.createElement('p')
  notice.className = [
    'mt-[clamp(1.25rem,4vh,1.75rem)] rounded-xl bg-[#ece7fd] px-4 py-3',
    'text-sm font-medium text-pretty text-[#3b2a8f]',
  ].join(' ')
  notice.setAttribute('role', 'status')
  notice.textContent = message
  return notice
}

function accesoScreen({ mode, onSubmit, notice } = {}) {
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
    id: isLogin ? 'login-email' : 'registro-email',
    name: 'email',
    type: 'email',
    placeholder: 'tu@correo.com',
    autocomplete: isLogin ? 'username' : 'email',
  })
  const password = labeledField({
    label: 'Contraseña',
    id: isLogin ? 'login-password' : 'registro-password',
    name: 'password',
    type: 'password',
    placeholder: isLogin ? 'Tu contraseña' : 'Mínimo 8 caracteres',
    autocomplete: isLogin ? 'current-password' : 'new-password',
  })
  addPasswordToggle(password.input)
  addCapsLockHint(password)

  const submitLabel = isLogin ? 'Entrar' : 'Crear cuenta'
  const submitButton = document.createElement('button')
  submitButton.type = 'submit'
  submitButton.className = [
    'mt-1 flex h-[clamp(3rem,12vw,3.5rem)] w-full min-w-0 items-center',
    'justify-center rounded-xl bg-[#5b32ea] px-4',
    'text-[clamp(0.95rem,3.4vw,1.05rem)] font-bold text-white',
    'transition-colors hover:bg-[#4c28cc]',
    'disabled:cursor-wait disabled:opacity-70',
  ].join(' ')
  submitButton.textContent = submitLabel

  let formError = null

  function showFormError(message) {
    formError ??= document.createElement('p')
    formError.className =
      'rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-pretty text-red-700'
    formError.setAttribute('role', 'alert')
    formError.textContent = message
    submitButton.before(formError)
  }

  function clearFormError() {
    formError?.remove()
  }

  const note = document.createElement('p')
  note.className =
    'mt-[clamp(1rem,4vh,1.5rem)] px-1 text-center text-[clamp(0.8rem,3.2vw,0.95rem)] text-pretty text-[#5c5678]'
  note.textContent = 'Después podrás crear un escuadrón o unirte a uno.'

  email.input.addEventListener('input', () => {
    clearFieldError(email.input, email.error)
    clearFormError()
  })
  password.input.addEventListener('input', () => {
    clearFieldError(password.input, password.error)
    clearFormError()
  })

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    if (submitButton.disabled) return
    clearFormError()
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

    if (!result.ok) {
      const firstInvalid = result.errors.email ? email.input : password.input
      firstInvalid.focus()
      return
    }

    if (typeof onSubmit !== 'function') return

    submitButton.disabled = true
    submitButton.textContent = isLogin ? 'Entrando…' : 'Creando cuenta…'
    try {
      await onSubmit({ email: result.email, password: result.password })
    } catch (error) {
      showFormError(error.message)
      if (isLogin) {
        password.input.focus()
        password.input.select()
      }
    } finally {
      submitButton.disabled = false
      submitButton.textContent = submitLabel
    }
  })

  form.append(email.wrapper, password.wrapper, submitButton)
  column.append(heading, brand, tagline, tabs)
  if (notice) column.append(noticeBox(notice))
  column.append(form, note)
  main.append(column)
  return main
}

export function loginScreen(options = {}) {
  return accesoScreen({ ...options, mode: 'login' })
}

export function registroScreen(options = {}) {
  return accesoScreen({ ...options, mode: 'register' })
}
