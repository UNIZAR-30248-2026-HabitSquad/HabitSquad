import { brand } from '../components/brand.js'
import { lockIcon, plusIcon } from '../components/icons.js'
import { splitLayout } from '../components/layout.js'
import { groupedList, listRow } from '../components/navigation.js'

function header(onLogout) {
  const bar = document.createElement('header')
  bar.className = 'mb-12 flex items-center justify-between gap-4'

  const logoutButton = document.createElement('button')
  logoutButton.type = 'button'
  logoutButton.className = [
    'min-h-11 shrink-0 rounded-lg px-1 text-[1.0625rem] text-accent hover:text-accent-hover',
    'focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-wait disabled:opacity-60',
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

  bar.append(brand(), logoutButton)
  return bar
}

export function inicioScreen({ onLogout } = {}) {
  const { main, content } = splitLayout({
    srTitle: 'HabitSquad',
    title: 'Empieza tu escuadrón',
    description:
      'Crea uno nuevo o únete con el código de 6 caracteres que te han pasado.',
    top: header(onLogout),
    showBrand: false,
  })

  content.append(
    groupedList('Escuadrón', [
      listRow({
        href: '/escuadrones/nuevo',
        title: 'Crear un escuadrón',
        subtitle: 'Ponle nombre y comparte el código con tu gente.',
        icon: plusIcon(),
      }),
      listRow({
        href: '/escuadrones/unirse',
        title: 'Unirme a un escuadrón',
        subtitle: 'Introduce el código que te han enviado.',
        icon: lockIcon(),
      }),
    ]),
  )

  return main
}
