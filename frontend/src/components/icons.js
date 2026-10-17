const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'

export function flameIcon(className = 'h-7 w-7 shrink-0') {
  const icon = document.createElementNS(SVG_NAMESPACE, 'svg')
  icon.setAttribute('viewBox', '0 0 24 24')
  icon.setAttribute('fill', 'currentColor')
  icon.setAttribute('aria-hidden', 'true')
  icon.className.baseVal = className

  const path = document.createElementNS(SVG_NAMESPACE, 'path')
  path.setAttribute(
    'd',
    'M12.3 2.2c.4 3-1.2 4.6-2.6 6.2C8.4 9.9 7 11.4 7 14a5 5 0 0 0 10 0c0-2.4-1.1-4-2.1-5.1-.1 1.3-.7 2.3-1.7 2.7.5-3.1-.2-6.6-.9-9.4z',
  )
  icon.append(path)
  return icon
}
