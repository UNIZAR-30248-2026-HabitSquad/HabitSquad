export const INSTALL_AVAILABILITY_EVENT = 'habitsquad:install-availability'

let deferredPrompt = null

function setDeferredPrompt(event) {
  deferredPrompt = event
  window.dispatchEvent(new Event(INSTALL_AVAILABILITY_EVENT))
}

// Solo los navegadores Chromium avisan de que la PWA se puede instalar.
window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault()
  setDeferredPrompt(event)
})
window.addEventListener('appinstalled', () => setDeferredPrompt(null))

export function canInstall() {
  return deferredPrompt !== null
}

export async function promptInstall() {
  const prompt = deferredPrompt
  if (!prompt) return
  setDeferredPrompt(null)
  await prompt.prompt()
  await prompt.userChoice
}
