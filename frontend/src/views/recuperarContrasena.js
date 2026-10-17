import {
  clearFieldError,
  clearFormAlert,
  formAlert,
  labeledField,
  notice,
  setFieldError,
  setSubmitPending,
  showFormAlert,
  submitButton,
} from '../components/forms.js'
import { splitLayout } from '../components/layout.js'
import { backLink } from '../components/navigation.js'
import { validateEmail } from './login.js'

export function recuperarContrasenaScreen({ onSubmit } = {}) {
  const { main, content } = splitLayout({
    title: 'Recuperar contraseña',
    description:
      'Escribe el correo de tu cuenta y te enviaremos un enlace para crear una contraseña nueva.',
    top: backLink({ href: '/login', label: 'Iniciar sesión' }),
  })

  const form = document.createElement('form')
  form.className = 'flex min-w-0 flex-col gap-5'
  form.noValidate = true

  const email = labeledField({
    label: 'Correo',
    id: 'recuperar-email',
    name: 'email',
    type: 'email',
    placeholder: 'tu@correo.com',
    autocomplete: 'email',
  })

  const submit = submitButton('Enviar enlace')
  const alert = formAlert()

  email.input.addEventListener('input', () => {
    clearFieldError(email.input, email.error)
    clearFormAlert(alert)
  })

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    if (submit.disabled) return
    clearFormAlert(alert)

    const result = validateEmail(email.input.value)
    if (!result.ok) {
      setFieldError(email.input, email.error, result.error)
      email.input.focus()
      return
    }
    clearFieldError(email.input, email.error)
    if (typeof onSubmit !== 'function') return

    setSubmitPending(submit, true, 'Enviando…')
    try {
      await onSubmit(result.email)
    } catch (error) {
      showFormAlert(alert, error.message, submit)
      return
    } finally {
      setSubmitPending(submit, false, 'Enviando…')
    }

    const sent = document.createElement('div')
    sent.append(
      notice(
        `Si hay una cuenta con ${result.email}, te hemos enviado un enlace. ` +
          'Revisa también la carpeta de spam.',
      ),
    )
    form.replaceWith(sent)
  })

  form.append(email.wrapper, submit)
  content.append(form)
  return main
}
