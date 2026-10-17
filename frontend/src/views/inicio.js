const actionClass = [
  'flex h-[clamp(3rem,12vw,3.5rem)] w-full min-w-0 items-center justify-center',
  'rounded-xl px-4 text-center text-[clamp(0.95rem,3.4vw,1.05rem)] font-bold',
  'transition-colors',
].join(' ')

function action(href, label, primary) {
  const link = document.createElement('a')
  link.href = href
  link.dataset.link = ''
  link.textContent = label
  link.className = [
    actionClass,
    primary
      ? 'bg-[#5b32ea] text-white hover:bg-[#4c28cc]'
      : 'border border-[#e4e0ef] bg-white text-[#5b32ea] hover:border-[#5b32ea]',
  ].join(' ')
  return link
}

export function inicioScreen({ onLogout } = {}) {
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
    'text-[clamp(1.7rem,8vw,2.35rem)] leading-none font-extrabold',
    'tracking-tight text-balance text-[#5b32ea]',
  ].join(' ')
  heading.textContent = 'HabitSquad'

  const tagline = document.createElement('p')
  tagline.className =
    'mt-2 text-[clamp(0.9rem,3.4vw,1.05rem)] text-balance text-[#5c5678]'
  tagline.textContent = 'Cumple tu hábito. Que no caiga la racha.'

  const intro = document.createElement('p')
  intro.className =
    'mt-[clamp(1.75rem,6vh,2.75rem)] text-[clamp(0.95rem,3.6vw,1.1rem)] font-semibold text-pretty text-[#211a45]'
  intro.textContent = 'Crea un escuadrón o únete a uno con el código que te han pasado.'

  const actions = document.createElement('nav')
  actions.className = 'mt-[clamp(1rem,3vh,1.5rem)] flex min-w-0 flex-col gap-3'
  actions.setAttribute('aria-label', 'Escuadrón')
  actions.append(
    action('/escuadrones/nuevo', 'Crear un escuadrón', true),
    action('/escuadrones/unirse', 'Unirme a un escuadrón', false),
  )

  const logoutButton = document.createElement('button')
  logoutButton.type = 'button'
  logoutButton.className = [
    'mt-auto self-center px-4 py-3 text-[clamp(0.85rem,3.2vw,0.95rem)] font-semibold',
    'text-[#5c5678] underline-offset-4 hover:text-[#211a45] hover:underline',
    'disabled:cursor-wait disabled:opacity-70',
  ].join(' ')
  logoutButton.textContent = 'Cerrar sesión'
  logoutButton.addEventListener('click', async () => {
    if (typeof onLogout !== 'function') return
    logoutButton.disabled = true
    logoutButton.textContent = 'Cerrando sesión…'
    try {
      await onLogout()
    } finally {
      logoutButton.disabled = false
      logoutButton.textContent = 'Cerrar sesión'
    }
  })

  column.append(heading, tagline, intro, actions, logoutButton)
  main.append(column)
  return main
}
