const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'

function createIcon({ paths = [], circles = [] }, className = 'h-5 w-5') {
  const icon = document.createElementNS(SVG_NAMESPACE, 'svg')
  icon.setAttribute('viewBox', '0 0 24 24')
  icon.setAttribute('fill', 'none')
  icon.setAttribute('stroke', 'currentColor')
  icon.setAttribute('stroke-width', '2')
  icon.setAttribute('stroke-linecap', 'round')
  icon.setAttribute('stroke-linejoin', 'round')
  icon.setAttribute('aria-hidden', 'true')
  icon.className.baseVal = className

  for (const { cx, cy, r } of circles) {
    const circle = document.createElementNS(SVG_NAMESPACE, 'circle')
    circle.setAttribute('cx', String(cx))
    circle.setAttribute('cy', String(cy))
    circle.setAttribute('r', String(r))
    icon.append(circle)
  }

  for (const d of paths) {
    const path = document.createElementNS(SVG_NAMESPACE, 'path')
    path.setAttribute('d', d)
    icon.append(path)
  }

  return icon
}

export function checkIcon(className = 'h-4 w-4 shrink-0') {
  return createIcon({ paths: ['m5 12 4 4L19 6'] }, className)
}

export function arrowRightIcon(className = 'h-4 w-4 shrink-0') {
  return createIcon({ paths: ['M5 12h14', 'm13 6 6 6-6 6'] }, className)
}
