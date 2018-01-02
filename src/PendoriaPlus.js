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
    ModuleManager.loadSettings()

    Object.values(ModuleManager.get())
      .forEach(module => {
        if ('settings' in module) {
          Object.keys(module.settings)
            .forEach(key => {
              let setting = module.settings[key]
              if (setting.onChange) {
                setting.onChange = setting.onChange.bind(module)
              }
            })
        }
        module.init()
      })
  },

  getSocket () {
    return window.socket
  }
}
