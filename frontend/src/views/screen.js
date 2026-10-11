export function screen({ title, description, links = [] }) {
  const main = document.createElement('main')
  main.className = 'mx-auto flex min-h-screen max-w-md flex-col gap-4 p-6'

  const heading = document.createElement('h1')
  heading.className = 'text-2xl font-bold text-slate-900'
  heading.textContent = title
  main.append(heading)

  if (description) {
    const text = document.createElement('p')
    text.className = 'text-slate-600'
    text.textContent = description
    main.append(text)
  }

  if (links.length > 0) {
    const nav = document.createElement('nav')
    nav.className = 'flex flex-col gap-2'
    for (const { href, label } of links) {
      const link = document.createElement('a')
      link.href = href
      link.dataset.link = ''
      link.className = 'font-medium text-indigo-700 underline'
      link.textContent = label
      nav.append(link)
    }
    main.append(nav)
  }

  return main
}
