import PendoriaPlus from './PendoriaPlus'

// TODO: maybe check/wait for jQuery in case script loads too early
$(function () {
  if (!window.hasPendoriaPlus) {
    window.hasPendoriaPlus = true
    PendoriaPlus.init()
  }
})
