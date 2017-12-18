import {log} from './utils'
import ModuleManager from './ModuleManager'

import './styles/global.css'

export default {
  isInitialized: false,

  init () {
    log('Initializing')

    this.isInitialized = true

    this.initModules()
  },

  initModules () {
    Object.values(ModuleManager.get())
      .forEach(module => {
        module.init()
      })
  },

  getSocket () {
    return window.socket
  }
}
