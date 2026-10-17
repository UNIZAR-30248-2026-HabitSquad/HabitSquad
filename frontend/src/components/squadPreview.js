const MEMBERS = [
  { name: 'Carlos · Gimnasio', status: 'Cumplido', tone: 'text-emerald-600' },
  { name: 'Laura · Leer', status: 'Pendiente', tone: 'text-amber-600' },
  { name: 'Tú · Leer', status: 'Sin prueba', tone: 'text-ink-muted' },
]

const TABS = ['Escuadrón', 'Racha', 'Alertas']

function element(tag, className, text) {
  const node = document.createElement(tag)
  node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

function streakCard() {
  const card = element('div', 'mt-4 rounded-2xl bg-surface px-4 py-5 text-center')
  card.append(
    element('p', 'text-[3.25rem] leading-none font-semibold tracking-tight text-streak', '12'),
    element('p', 'mt-1 text-[0.8125rem] font-medium text-ink', 'días de racha'),
    element('p', 'mt-2 text-[0.6875rem] text-ink-muted', 'Hoy cumplen 2 de 3 · Cierra 23:59'),
  )
  return card
}

function habitCard() {
  const card = element('div', 'mt-3 rounded-2xl bg-surface p-3')
  card.append(
    element('p', 'text-[0.75rem] text-ink', 'Mi hábito: Leer un libro'),
    element(
      'div',
      'mt-2.5 grid h-9 place-items-center rounded-[0.625rem] bg-accent text-[0.75rem] font-semibold text-white',
      'Subir foto de prueba',
    ),
  )
  return card
}

function membersList() {
  const wrapper = element('div', 'mt-4')
  wrapper.append(
    element('p', 'px-1 text-[0.6875rem] font-medium text-ink-muted uppercase tracking-wide', 'Miembros'),
  )

  const list = element('div', 'mt-1.5 divide-y divide-hairline/70 overflow-hidden rounded-2xl bg-surface')
  for (const { name, status, tone } of MEMBERS) {
    const row = element('div', 'flex items-center justify-between gap-2 px-3 py-2.5')
    row.append(
      element('span', 'truncate text-[0.75rem] text-ink', name),
      element('span', `shrink-0 text-[0.6875rem] font-medium ${tone}`, status),
    )
    list.append(row)
  }
  wrapper.append(list)
  return wrapper
}

function tabBar() {
  const bar = element(
    'div',
    'mt-auto grid grid-cols-3 border-t border-hairline/70 bg-surface/90 px-2 pt-2 pb-5',
  )
  TABS.forEach((label, index) => {
    const tab = element('div', 'flex flex-col items-center gap-1')
    tab.append(
      element('span', `h-1.5 w-1.5 rounded-full ${index === 0 ? 'bg-accent' : 'bg-transparent'}`),
      element(
        'span',
        `text-[0.625rem] font-medium ${index === 0 ? 'text-accent' : 'text-ink-muted'}`,
        label,
      ),
    )
    bar.append(tab)
  })
  return bar
}

export function squadPreview() {
  const figure = element('figure', 'flex flex-col items-center')
  figure.setAttribute('aria-hidden', 'true')

  const device = element(
    'div',
    'w-[18.5rem] rounded-[3rem] bg-ink p-2.5 shadow-[0_40px_80px_-30px_rgba(29,29,31,0.45)]',
  )
  const screen = element('div', 'flex h-[37rem] flex-col overflow-hidden rounded-[2.5rem] bg-canvas')

  const island = element('div', 'mx-auto mt-2.5 h-[1.4rem] w-[5.5rem] shrink-0 rounded-full bg-ink')

  const content = element('div', 'px-4 pt-4')
  content.append(
    element('p', 'text-[0.6875rem] font-medium text-ink-muted uppercase tracking-wide', 'Escuadrón'),
    element('p', 'mt-0.5 text-[1.375rem] leading-tight font-semibold tracking-tight text-ink', 'Los Inquebrantables'),
    streakCard(),
    habitCard(),
    membersList(),
  )

  screen.append(island, content, tabBar())
  device.append(screen)
  figure.append(device)
  return figure
}
