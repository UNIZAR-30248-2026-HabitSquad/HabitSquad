const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'

function createIcon(paths, className) {
  const icon = document.createElementNS(SVG_NAMESPACE, 'svg')
  icon.setAttribute('viewBox', '0 0 24 24')
  icon.setAttribute('fill', 'none')
  icon.setAttribute('stroke', 'currentColor')
  icon.setAttribute('stroke-width', '2')
  icon.setAttribute('stroke-linecap', 'round')
  icon.setAttribute('stroke-linejoin', 'round')
  icon.setAttribute('aria-hidden', 'true')
  icon.className.baseVal = className

  for (const d of paths) {
    const path = document.createElementNS(SVG_NAMESPACE, 'path')
    path.setAttribute('d', d)
    icon.append(path)
  }

  return icon
}

export function chevronLeftIcon(className = 'h-4 w-4 shrink-0') {
  return createIcon(['m15 6-6 6 6 6'], className)
}
