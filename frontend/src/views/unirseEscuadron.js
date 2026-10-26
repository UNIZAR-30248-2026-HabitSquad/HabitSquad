const CODE_LENGTH = 6
const INCOMPLETE_CODE_MESSAGE =
  'Introduce el código completo de 6 caracteres.'
const JOIN_FAILED_MESSAGE =
  'No se ha podido unir al escuadrón. Inténtalo de nuevo.'

const boxClass = [
  'aspect-[4/5] w-full min-w-0 rounded-[clamp(0.7rem,2cqi,1.25rem)]',
  'border border-[#d7d3e5] bg-white p-0',
  'text-center text-[clamp(1rem,6cqi,2.25rem)] leading-none font-bold',
  'text-slate-950 uppercase outline-none transition',
  'focus:border-[#5b32ea] focus:ring-2 focus:ring-[#5b32ea]/20',
  'aria-invalid:border-2 aria-invalid:border-red-600 aria-invalid:text-red-600',
  'aria-invalid:focus:border-red-600 aria-invalid:focus:ring-red-600/25',
].join(' ')

function alphanumeric(value) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export function unirseEscuadronScreen({ onSubmit } = {}) {
  const main = document.createElement('main')
  main.className = [
    'flex min-h-dvh w-full flex-col bg-[#f3f1ff]',
    'ps-[env(safe-area-inset-left)] pe-[env(safe-area-inset-right)]',
    'pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]',
  ].join(' ')

  const column = document.createElement('div')
  column.className = [
    '@container mx-auto flex w-full max-w-2xl min-w-0 flex-col',
    'px-[clamp(1rem,4vw,2.5rem)] pt-[clamp(1.75rem,6vh,4.5rem)]',
    'pb-[clamp(2rem,8vh,5rem)]',
  ].join(' ')

  const header = document.createElement('header')
  header.className = 'flex flex-col gap-[clamp(0.4rem,1.5cqi,0.85rem)]'

  const title = document.createElement('h1')
  title.className = [
    'text-[clamp(1.35rem,7.6cqi,2.6rem)] leading-tight font-extrabold',
    'tracking-tight text-balance text-[#5a31ea]',
  ].join(' ')
  title.textContent = 'Únete a un escuadrón'

  const description = document.createElement('p')
  description.className =
    'text-[clamp(0.95rem,3.2cqi,1.25rem)] leading-snug tracking-tight text-balance text-[#544f76]'
  description.textContent =
    'Introduce el código de 6 caracteres que te han enviado.'

  header.append(title, description)

  const form = document.createElement('form')
  form.className =
    'mt-[clamp(1.5rem,5cqi,3rem)] flex flex-col gap-[clamp(0.85rem,2.5cqi,1.35rem)]'
  form.noValidate = true

  const label = document.createElement('label')
  label.className = 'flex min-w-0 flex-col gap-[clamp(0.55rem,2cqi,1rem)]'

  const caption = document.createElement('span')
  caption.id = 'codigo-invitacion-label'
  caption.className =
    'text-[clamp(0.8rem,2.8cqi,1rem)] font-bold text-[#211a45]'
  caption.textContent = 'Código de invitación'

  const boxes = document.createElement('div')
  boxes.className =
    'grid w-full min-w-0 grid-cols-6 gap-[clamp(0.4rem,3.4cqi,1.35rem)]'
  boxes.setAttribute('role', 'group')
  boxes.setAttribute('aria-labelledby', caption.id)

  const inputs = []
  for (let index = 0; index < CODE_LENGTH; index += 1) {
    const input = document.createElement('input')
    input.type = 'text'
    input.maxLength = 1
    input.inputMode = 'text'
    input.autocomplete = index === 0 ? 'one-time-code' : 'off'
    input.spellcheck = false
    input.setAttribute('autocapitalize', 'characters')
    input.setAttribute('aria-label', `Carácter ${index + 1} del código`)
    input.setAttribute('aria-invalid', 'false')
    input.className = boxClass
    input.addEventListener('focus', () => input.select())
    inputs.push(input)
    boxes.append(input)
  }

  label.append(caption, boxes)

  const errorMessage = document.createElement('p')
  errorMessage.id = 'codigo-invitacion-error'
  errorMessage.className =
    'hidden text-[clamp(0.8rem,2.8cqi,1rem)] leading-snug font-medium text-pretty text-red-600'
  errorMessage.setAttribute('role', 'alert')
  errorMessage.setAttribute('aria-live', 'polite')

  const successMessage = document.createElement('p')
  successMessage.className =
    'hidden text-[clamp(0.8rem,2.8cqi,1rem)] leading-snug font-medium text-green-700'
  successMessage.setAttribute('role', 'status')
  successMessage.setAttribute('aria-live', 'polite')

  function showError(message) {
    const text = String(message ?? '').trim()
    if (!text) return
    successMessage.textContent = ''
    successMessage.classList.add('hidden')
    errorMessage.textContent = text
    errorMessage.classList.remove('hidden')
    boxes.setAttribute('aria-describedby', errorMessage.id)
    for (const input of inputs) {
      input.setAttribute('aria-invalid', 'true')
      input.setAttribute('aria-describedby', errorMessage.id)
    }
  }

  function clearError() {
    errorMessage.textContent = ''
    errorMessage.classList.add('hidden')
    successMessage.textContent = ''
    successMessage.classList.add('hidden')
    boxes.removeAttribute('aria-describedby')
    for (const input of inputs) {
      input.setAttribute('aria-invalid', 'false')
      input.removeAttribute('aria-describedby')
    }
  }

  function showSuccess(squad) {
    if (!squad || typeof squad.nombre !== 'string') return
    clearError()
    successMessage.textContent = `Te has unido a «${squad.nombre}».`
    successMessage.classList.remove('hidden')
  }

  function writeFrom(start, chars) {
    for (let offset = 0; offset < chars.length; offset += 1) {
      const target = start + offset
      if (target >= inputs.length) break
      inputs[target].value = chars[offset]
    }
    const next = Math.min(start + chars.length, inputs.length - 1)
    inputs[next].focus()
  }

  for (const [index, input] of inputs.entries()) {
    input.addEventListener('input', () => {
      clearError()
      const chars = alphanumeric(input.value)
      if (chars.length > 1) {
        writeFrom(index, chars)
        return
      }
      input.value = chars
      if (chars && index < inputs.length - 1) inputs[index + 1].focus()
    })

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Backspace') {
        clearError()
        if (!input.value && index > 0) {
          event.preventDefault()
          inputs[index - 1].focus()
          inputs[index - 1].value = ''
        }
        return
      }
      if (event.key === 'ArrowLeft' && index > 0) {
        event.preventDefault()
        inputs[index - 1].focus()
      } else if (event.key === 'ArrowRight' && index < inputs.length - 1) {
        event.preventDefault()
        inputs[index + 1].focus()
      }
    })

    input.addEventListener('paste', (event) => {
      event.preventDefault()
      clearError()
      const pasted = alphanumeric(
        (event.clipboardData || window.clipboardData)?.getData('text') ?? '',
      )
      if (!pasted) return
      const start = pasted.length >= inputs.length ? 0 : index
      writeFrom(start, pasted)
    })
  }

  const submitButton = document.createElement('button')
  submitButton.type = 'submit'
  submitButton.className = [
    'mt-[clamp(0.15rem,1cqi,0.5rem)] flex h-[clamp(3.75rem,13.5cqi,4.75rem)]',
    'w-full cursor-pointer items-center justify-center px-4',
    'rounded-[clamp(0.9rem,2.5cqi,1.35rem)] bg-[#ff6a13]',
    'text-[clamp(0.95rem,3.2cqi,1.2rem)] font-bold text-white',
    'transition-colors hover:bg-[#e85e0c] active:bg-[#d2540a]',
    'disabled:cursor-wait disabled:opacity-70',
  ].join(' ')
  submitButton.textContent = 'Unirme al escuadrón'

  form.append(label, errorMessage, successMessage, submitButton)

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const code = inputs.map((input) => input.value).join('')

    if (code.length < CODE_LENGTH) {
      showError(INCOMPLETE_CODE_MESSAGE)
      const empty = inputs.find((input) => input.value === '')
      empty?.focus()
      return
    }

    if (typeof onSubmit !== 'function') return

    const result = onSubmit(code, { showError, clearError })
    if (!result || typeof result.then !== 'function') return

    submitButton.disabled = true
    result.then(
      (squad) => {
        submitButton.disabled = false
        showSuccess(squad)
      },
      (error) => {
        submitButton.disabled = false
        const message =
          error instanceof Error && error.message
            ? error.message
            : JOIN_FAILED_MESSAGE
        showError(message)
      },
    )
  })

  const alternative = document.createElement('div')
  alternative.className =
    'mt-[clamp(2rem,6cqi,4rem)] flex flex-col gap-[clamp(0.85rem,2.5cqi,1.35rem)]'

  const prompt = document.createElement('p')
  prompt.className =
    'text-center text-[clamp(0.8rem,2.8cqi,1rem)] text-pretty text-[#534e70]'
  prompt.textContent = '¿Prefieres empezar uno nuevo?'

  const createLink = document.createElement('a')
  createLink.href = '/escuadrones/nuevo'
  createLink.dataset.link = ''
  createLink.className = [
    'flex h-[clamp(3.75rem,13.5cqi,4.75rem)] w-full items-center justify-center px-4',
    'rounded-[clamp(0.9rem,2.5cqi,1.35rem)] border-2 border-[#5b32ea] bg-white',
    'text-[clamp(0.95rem,3.2cqi,1.2rem)] font-bold text-[#5b32ea]',
    'transition-colors hover:bg-[#efeaff]',
  ].join(' ')
  createLink.textContent = 'Crear un escuadrón'

  alternative.append(prompt, createLink)
  column.append(header, form, alternative)
  main.append(column)
  return main
}
