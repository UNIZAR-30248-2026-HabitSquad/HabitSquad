import { clearFieldError, labeledField, setFieldError } from './acceso.js'
import { validateEmail } from './login.js'

function backToLogin() {
  const link = document.createElement('a')
  link.href = '/login'
  link.dataset.link = ''
  link.className = [
    'self-start text-[clamp(0.85rem,3.2vw,0.95rem)] font-semibold text-[#5b32ea]',
    'underline-offset-4 hover:underline',
  ].join(' ')
  link.textContent = '‹ Volver a iniciar sesión'
  return link
}

export function recuperarContrasenaScreen({ onSubmit } = {}) {
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
  heading.className = [
    'mt-[clamp(1.25rem,5vh,2rem)] text-[clamp(1.5rem,7vw,2rem)] leading-tight',
    'font-extrabold tracking-tight text-balance text-[#211a45]',
  ].join(' ')
  heading.textContent = 'Recuperar contraseña'

  const intro = document.createElement('p')
  intro.className =
    'mt-2 text-[clamp(0.9rem,3.4vw,1.05rem)] text-pretty text-[#5c5678]'
  intro.textContent =
    'Escribe el correo de tu cuenta y te enviaremos un enlace para crear una contraseña nueva.'

  const form = document.createElement('form')
  form.className = 'mt-[clamp(1.25rem,4vh,1.75rem)] flex min-w-0 flex-col gap-5'
  form.noValidate = true

  const email = labeledField({
    label: 'Correo',
    id: 'recuperar-email',
    name: 'email',
    type: 'email',
    placeholder: 'tu@correo.com',
    autocomplete: 'email',
  })

  const submitLabel = 'Enviar enlace'
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

  const formError = document.createElement('p')
  formError.className =
    'rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-pretty text-red-700'
  formError.setAttribute('role', 'alert')

  email.input.addEventListener('input', () => {
    clearFieldError(email.input, email.error)
    formError.remove()
  })

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    if (submitButton.disabled) return
    formError.remove()

    const result = validateEmail(email.input.value)
    if (!result.ok) {
      setFieldError(email.input, email.error, result.error)
      email.input.focus()
      return
    }
    clearFieldError(email.input, email.error)
    if (typeof onSubmit !== 'function') return

    submitButton.disabled = true
    submitButton.textContent = 'Enviando…'
    try {
      await onSubmit(result.email)
    } catch (error) {
      formError.textContent = error.message
      submitButton.before(formError)
      return
    } finally {
      submitButton.disabled = false
      submitButton.textContent = submitLabel
    }

    const sent = document.createElement('p')
    sent.className = [
      'mt-[clamp(1.25rem,4vh,1.75rem)] rounded-xl bg-[#ece7fd] px-4 py-3',
      'text-sm font-medium text-pretty text-[#3b2a8f]',
    ].join(' ')
    sent.setAttribute('role', 'status')
    sent.textContent =
      `Si hay una cuenta con ${result.email}, te hemos enviado un enlace. ` +
      'Revisa también la carpeta de spam.'
    form.replaceWith(sent)
  })

  form.append(email.wrapper, submitButton)
  column.append(backToLogin(), heading, intro, form)
  main.append(column)
  return main
}
