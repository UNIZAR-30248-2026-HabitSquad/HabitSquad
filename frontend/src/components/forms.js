const fieldClass = [
  'w-full min-w-0 rounded-2xl border border-[#ded9ee] bg-white px-4 py-3.5',
  'text-base text-slate-950 shadow-[0_1px_2px_rgba(33,26,69,0.04)] outline-none transition',
  'placeholder:text-[#aaa4bf] hover:border-[#c9c0e8]',
  'focus:border-[#5b32ea] focus:ring-4 focus:ring-[#5b32ea]/15',
  'aria-invalid:border-red-500 aria-invalid:ring-4 aria-invalid:ring-red-500/10',
].join(' ')

function fieldError(id) {
  const error = document.createElement('p')
  error.id = id
  error.className = 'hidden text-sm leading-snug font-medium text-red-600'
  error.setAttribute('role', 'alert')
  error.setAttribute('aria-live', 'polite')
  return error
}

export function setFieldError(input, error, message) {
  error.textContent = message
  error.classList.remove('hidden')
  input.setAttribute('aria-invalid', 'true')
  input.setAttribute('aria-describedby', error.id)
}

export function clearFieldError(input, error) {
  error.textContent = ''
  error.classList.add('hidden')
  input.setAttribute('aria-invalid', 'false')
  input.removeAttribute('aria-describedby')
}

export function labeledField({ label, id, name, type, placeholder, autocomplete }) {
  const wrapper = document.createElement('div')
  wrapper.className = 'flex min-w-0 flex-col gap-2'

  const labelElement = document.createElement('label')
  labelElement.htmlFor = id
  labelElement.className = 'text-sm font-semibold text-[#211a45]'
  labelElement.textContent = label

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
  wrapper.append(labelElement, input, error)
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
    'absolute inset-y-0 end-0 flex min-w-20 items-center justify-center rounded-r-2xl px-3',
    'text-sm font-semibold text-[#5b32ea] transition-colors hover:text-[#4c28cc]',
    'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#5b32ea]',
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
  hint.className = 'hidden text-sm leading-snug font-medium text-amber-700'
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

export function passwordField(options) {
  const field = labeledField({ ...options, type: 'password' })
  addPasswordToggle(field.input)
  addCapsLockHint(field)
  return field
}

export function submitButton(label) {
  const button = document.createElement('button')
  button.type = 'submit'
  button.className = [
    'mt-1 flex h-12 w-full min-w-0 items-center justify-center rounded-2xl bg-[#5b32ea] px-4',
    'text-base font-bold text-white shadow-lg shadow-[#5b32ea]/25 transition',
    'hover:bg-[#4c28cc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5b32ea]',
    'active:scale-[0.99] disabled:cursor-wait disabled:opacity-70 disabled:shadow-none',
  ].join(' ')
  button.textContent = label
  button.dataset.label = label
  return button
}

export function setSubmitPending(button, pending, pendingLabel) {
  button.disabled = pending
  button.textContent = pending ? pendingLabel : button.dataset.label
}

export function formAlert() {
  const alert = document.createElement('p')
  alert.className = [
    'rounded-2xl border border-red-200 bg-red-50 px-4 py-3',
    'text-sm leading-snug font-medium text-pretty text-red-700',
  ].join(' ')
  alert.setAttribute('role', 'alert')
  return alert
}

export function showFormAlert(alert, message, anchor) {
  alert.textContent = message
  anchor.before(alert)
}

export function clearFormAlert(alert) {
  alert.remove()
}

export function notice(message, tone = 'info') {
  const element = document.createElement('p')
  element.className = [
    'rounded-2xl border px-4 py-3 text-sm leading-snug font-medium text-pretty',
    tone === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : 'border-[#d9ceff] bg-[#f0ebff] text-[#3b2a8f]',
  ].join(' ')
  element.setAttribute('role', 'status')
  element.textContent = message
  return element
}
