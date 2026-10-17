const textLinkClass = [
  'rounded text-[0.9375rem] font-extrabold text-accent',
  'hover:text-accent-hover hover:underline underline-offset-4',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
].join(' ')

export function passwordRecoveryLink() {
  const link = document.createElement('a')
  link.href = '/recuperar-contrasena'
  link.dataset.link = ''
  link.className = `-mt-1 self-start ${textLinkClass}`
  link.textContent = '¿Has olvidado tu contraseña?'
  return link
}

export function backLink({ href, label }) {
  const link = document.createElement('a')
  link.href = href
  link.dataset.link = ''
  link.className = `mt-4 self-center ${textLinkClass}`
  link.textContent = label
  return link
}
