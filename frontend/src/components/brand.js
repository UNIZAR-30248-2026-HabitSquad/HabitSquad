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
