import { beforeEach, describe, expect, it, vi } from 'vitest'
import { unirseEscuadronScreen } from './unirseEscuadron.js'

function fillCode(element, code) {
  const inputs = element.querySelectorAll('input')
  ;[...code].forEach((char, index) => {
    inputs[index].value = char
  })
  return inputs
}

describe('unirseEscuadronScreen', () => {
  let element

  beforeEach(() => {
    element = unirseEscuadronScreen()
    document.body.replaceChildren(element)
  })

  it('renderiza los títulos, label y las 6 casillas', () => {
    expect(element.querySelector('h1').textContent).toBe('Únete a un escuadrón')
    expect(element.textContent).toContain(
      'Introduce el código de 6 caracteres que te han enviado.',
    )
    expect(element.textContent).toContain('Código de invitación')
    expect(element.querySelectorAll('input')).toHaveLength(6)
    expect(element.querySelector('[role="alert"]').classList.contains('hidden')).toBe(
      true,
    )
  })

  it('avanza el foco automáticamente al escribir en una casilla', () => {
    const inputs = element.querySelectorAll('input')
    inputs[0].focus()
    inputs[0].value = 'x'
    inputs[0].dispatchEvent(new Event('input'))

    expect(inputs[0].value).toBe('X')
    expect(document.activeElement).toBe(inputs[1])
  })

  it('ignora caracteres que no sean letras o números', () => {
    const inputs = element.querySelectorAll('input')
    inputs[0].focus()
    inputs[0].value = '-'
    inputs[0].dispatchEvent(new Event('input'))

    expect(inputs[0].value).toBe('')
    expect(document.activeElement).toBe(inputs[0])
  })

  it('muestra aviso de error si se envía un código de menos de 6 caracteres', () => {
    const form = element.querySelector('form')
    form.dispatchEvent(new Event('submit', { cancelable: true }))

    const errorMsg = element.querySelector('[role="alert"]')
    expect(errorMsg.classList.contains('hidden')).toBe(false)
    expect(errorMsg.textContent).toContain('6 caracteres')
    expect(element.querySelector('input').getAttribute('aria-invalid')).toBe('true')
  })

  it('retira el aviso en cuanto se corrige una casilla', () => {
    element.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }))
    const input = element.querySelector('input')
    input.value = 'A'
    input.dispatchEvent(new Event('input'))

    const errorMsg = element.querySelector('[role="alert"]')
    expect(errorMsg.classList.contains('hidden')).toBe(true)
    expect(input.getAttribute('aria-invalid')).toBe('false')
  })

  it('con retroceso en una casilla vacía borra la anterior', () => {
    const inputs = element.querySelectorAll('input')
    inputs[0].value = 'A'
    inputs[1].focus()
    inputs[1].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Backspace', cancelable: true }),
    )

    expect(inputs[0].value).toBe('')
    expect(document.activeElement).toBe(inputs[0])
  })

  it('permite pegar un código de 6 caracteres distribuyéndolo en las casillas', () => {
    const inputs = element.querySelectorAll('input')
    const pasteEvent = new Event('paste', { cancelable: true })
    pasteEvent.clipboardData = {
      getData: () => 'x8k-9ql',
    }

    inputs[0].dispatchEvent(pasteEvent)

    const code = [...inputs].map((input) => input.value).join('')
    expect(code).toBe('X8K9QL')
  })

  it('con el código completo entrega el valor y permite publicar un aviso', () => {
    const onSubmit = vi.fn((_code, { showError }) => {
      showError('Ese código no corresponde a ningún escuadrón.')
    })
    const elementWithSubmit = unirseEscuadronScreen({ onSubmit })
    document.body.replaceChildren(elementWithSubmit)
    fillCode(elementWithSubmit, 'X8K9QL')
    elementWithSubmit
      .querySelector('form')
      .dispatchEvent(new Event('submit', { cancelable: true }))

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit.mock.calls[0][0]).toBe('X8K9QL')
    const errorMsg = elementWithSubmit.querySelector('[role="alert"]')
    expect(errorMsg.classList.contains('hidden')).toBe(false)
    expect(errorMsg.textContent).toBe(
      'Ese código no corresponde a ningún escuadrón.',
    )
  })

  it('muestra el aviso si unirse al escuadrón falla', async () => {
    const elementWithSubmit = unirseEscuadronScreen({
      onSubmit: () =>
        Promise.reject(new Error('Ese código no corresponde a ningún escuadrón.')),
    })
    document.body.replaceChildren(elementWithSubmit)
    fillCode(elementWithSubmit, 'X8K9QL')
    elementWithSubmit
      .querySelector('form')
      .dispatchEvent(new Event('submit', { cancelable: true }))

    const errorMsg = elementWithSubmit.querySelector('[role="alert"]')
    await vi.waitFor(() => {
      expect(errorMsg.textContent).toBe(
        'Ese código no corresponde a ningún escuadrón.',
      )
    })
    expect(elementWithSubmit.querySelector('button').disabled).toBe(false)
  })

  it('enlaza con crear un escuadrón', () => {
    const link = element.querySelector('a[data-link]')
    expect(link.getAttribute('href')).toBe('/escuadrones/nuevo')
    expect(link.textContent).toBe('Crear un escuadrón')
  })
})
