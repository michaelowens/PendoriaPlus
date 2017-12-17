import AjaxCallback from './modules/AjaxCallback'
import VisualResourceStatus from './modules/VisualResourceStatus'
import StatsPanel from './modules/StatsPanel'
import Chat from './modules/Chat'
import Settings from './modules/Settings'
import {log} from './utils'

import './styles/global.css'

// TODO: Handle this with a ModuleManager
export const MODULES = {
  VisualResourceStatus, AjaxCallback, StatsPanel, Chat, Settings
}

window._MODULES = MODULES

export default {
  isInitialized: false,

  init () {
    log('Initializing')

    this.isInitialized = true

    this.initModules()
  },

  initModules () {
    Object.keys(MODULES).forEach(name => {
      MODULES[name].init()
    })
  },

  getSocket () {
    return window.socket
  }
}
