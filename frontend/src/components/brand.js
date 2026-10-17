export function brand({ inverse = false, compact = false } = {}) {
  const wrapper = document.createElement('div')
  wrapper.className = 'flex min-w-0 items-center gap-3'

  const mark = document.createElement('span')
  mark.className = [
    'grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-sm font-black tracking-tight',
    'shadow-lg shadow-[#5b32ea]/25',
    inverse ? 'bg-white text-[#5b32ea]' : 'bg-[#5b32ea] text-white',
  ].join(' ')
  mark.textContent = 'HS'
  mark.setAttribute('aria-hidden', 'true')

  const text = document.createElement('span')
  text.className = 'min-w-0'

  const name = document.createElement('span')
  name.className = [
    'block truncate text-xl leading-none font-extrabold tracking-tight',
    inverse ? 'text-white' : 'text-[#211a45]',
  ].join(' ')
  name.textContent = 'HabitSquad'

  text.append(name)

  if (!compact) {
    const tagline = document.createElement('span')
    tagline.className = [
      'mt-1 block text-sm leading-tight',
      inverse ? 'text-white/75' : 'text-[#5c5678]',
    ].join(' ')
    tagline.textContent = 'Cumple tu hábito. Que no caiga la racha.'
    text.append(tagline)
  }

  wrapper.append(mark, text)
  return wrapper
}
