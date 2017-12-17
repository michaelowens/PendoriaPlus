/**
 * Hook onto jQuery.ajaxComplete and be able to attach events to ajax calls
 */

import {log} from '../utils.js'

let AJAX_CALLBACKS = {};

export default {
  init () {
    $(document).ajaxComplete((e, xhr, settings) => {
      let foundPath = Object.keys(AJAX_CALLBACKS).find(path => settings.url.match(path))
      if (!foundPath) {
        return
      }

      AJAX_CALLBACKS[foundPath].forEach(cb => {
        cb(e, xhr, settings)
      })
    })
  },

  on (path, fn) {
    if (!fn) {
      return
    }

    AJAX_CALLBACKS[path] = AJAX_CALLBACKS[path] || []
    AJAX_CALLBACKS[path].push(fn)
  },

  off (path, fn) {
    if (!fn) {
      return
    }

    let cbs = AJAX_CALLBACKS[path]

    if (!cbs) {
      return
    }

    let i = cbs.findIndex(currentCallback => currentCallback === fn)

    if (i > -1) {
      AJAX_CALLBACKS[path].splice(i, 1)
      log('[AjaxCallback]', 'after splice', AJAX_CALLBACKS[path])
    }
  }
}