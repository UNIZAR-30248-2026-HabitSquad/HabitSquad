const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'

function createIcon(paths, className, { strokeWidth = '2', filled = false } = {}) {
  const icon = document.createElementNS(SVG_NAMESPACE, 'svg')
  icon.setAttribute('viewBox', '0 0 24 24')
  if (filled) {
    icon.setAttribute('fill', 'currentColor')
  } else {
    icon.setAttribute('fill', 'none')
    icon.setAttribute('stroke', 'currentColor')
    icon.setAttribute('stroke-width', strokeWidth)
    icon.setAttribute('stroke-linecap', 'round')
    icon.setAttribute('stroke-linejoin', 'round')
  }
  icon.setAttribute('aria-hidden', 'true')
  icon.className.baseVal = className

  for (const d of paths) {
    const path = document.createElementNS(SVG_NAMESPACE, 'path')
    path.setAttribute('d', d)
    icon.append(path)
  }

  return icon
}

export function chevronDownIcon(className = 'h-4 w-4 shrink-0') {
  return createIcon(['m6 9 6 6 6-6'], className, { strokeWidth: '2.6' })
}

export function downloadIcon(className = 'h-5 w-5 shrink-0') {
  return createIcon(['M12 4v11', 'm7 10 5 5 5-5', 'M5 20h14'], className, {
    strokeWidth: '2.6',
  })
}

export function menuIcon(className = 'h-6 w-6 shrink-0') {
  return createIcon(['M4 7h16', 'M4 12h16', 'M4 17h16'], className, {
    strokeWidth: '2.6',
  })
}

export function closeIcon(className = 'h-6 w-6 shrink-0') {
  return createIcon(['m6 6 12 12', 'M18 6 6 18'], className, { strokeWidth: '2.6' })
}

export function flameIcon(className = 'h-7 w-7 shrink-0') {
  return createIcon(
    [
      'M12.3 2.2c.4 3-1.2 4.6-2.6 6.2C8.4 9.9 7 11.4 7 14a5 5 0 0 0 10 0c0-2.4-1.1-4-2.1-5.1-.1 1.3-.7 2.3-1.7 2.7.5-3.1-.2-6.6-.9-9.4z',
    ],
    className,
    { filled: true },
  )
}
