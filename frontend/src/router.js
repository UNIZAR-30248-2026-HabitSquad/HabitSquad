export function matchRoute(routes, pathname) {
  return routes.find((route) => route.path === pathname) ?? null
}

export function createRouter({ routes, notFound, root, guard }) {
  function render() {
    const route = matchRoute(routes, window.location.pathname) ?? notFound
    const redirect = guard?.(route)
    if (redirect && redirect !== window.location.pathname) {
      window.history.replaceState({}, '', redirect)
      render()
      return
    }
    root.replaceChildren(route.view({ navigate }))
    document.title =
      route.title === 'HabitSquad' ? route.title : `${route.title} · HabitSquad`
  }

  function navigate(path) {
    if (path !== window.location.pathname) {
      window.history.pushState({}, '', path)
    }
    render()
  }

  function handleClick(event) {
    const link = event.target.closest('a[data-link]')
    if (
      !link ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }
    event.preventDefault()
    navigate(link.getAttribute('href'))
  }

  function start() {
    window.addEventListener('popstate', render)
    document.addEventListener('click', handleClick)
    render()
  }

  function stop() {
    window.removeEventListener('popstate', render)
    document.removeEventListener('click', handleClick)
  }

  return { navigate, start, stop }
}
