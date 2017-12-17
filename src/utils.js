export let debug = true

export function log() {
  if (!debug) {
    return
  }

  console.log('[PendoriaPlus]', ...arguments)
}

export function capitalize([first, ...rest]) {
  if (!first) {
    return ''
  }
  return first.toUpperCase() + rest.join('')
}
