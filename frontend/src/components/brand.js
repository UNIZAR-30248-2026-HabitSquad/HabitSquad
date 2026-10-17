export function appMark(className = 'h-14 w-14') {
  const mark = document.createElement('img')
  mark.src = '/icons/icon-192.png'
  mark.alt = ''
  mark.width = 192
  mark.height = 192
  mark.decoding = 'async'
  mark.className = `${className} shrink-0 rounded-[22%]`
  return mark
}

export function brand({ large = false } = {}) {
  const wrapper = document.createElement('div')
  wrapper.className = `flex min-w-0 items-center ${large ? 'gap-3' : 'gap-2.5'}`

  const name = document.createElement('span')
  name.className = [
    'truncate font-semibold tracking-tight text-ink',
    large ? 'text-[1.25rem]' : 'text-[1.0625rem]',
  ].join(' ')
  name.textContent = 'HabitSquad'

  wrapper.append(appMark(large ? 'h-11 w-11' : 'h-8 w-8'), name)
  return wrapper
}
