import {log} from './utils'
import AjaxCallback from './modules/AjaxCallback'
import Global from './modules/Global'
import StatsPanel from './modules/StatsPanel'
import Chat from './modules/Chat'
import Quests from './modules/Quests'
import Settings from './modules/Settings'

const modules = {
  AjaxCallback,
  StatsPanel,
  Chat,
  Quests,
  Global,
  Settings,
}

window.pp_modules = modules

export default {
  init () {
    log('[ModuleManager]', 'init')
  },

  saveSettings () {
    log('[ModuleManager]', 'saveSettings')
    let settings = {}
    Object.keys(modules).forEach(moduleName => {
      if ('settings' in modules[moduleName]) {
        settings[moduleName] = {}

        let moduleSettings = modules[moduleName].settings
        Object.keys(moduleSettings).forEach(settingName => {
          settings[moduleName][settingName] = moduleSettings[settingName].value
        })
      }
    })

    localStorage.setItem('PendoriaPlus', JSON.stringify(settings))
  },

  loadSettings () {
    let settings = localStorage.getItem('PendoriaPlus')

    if (settings) {
      log('[ModuleManager]', 'Loading settings')
      try {
        settings = JSON.parse(settings)
        log('[ModuleManager]', settings)
        Object.keys(settings).forEach(moduleName => {
          const moduleSettings = settings[moduleName]
          Object.keys(moduleSettings).forEach(settingName => {
            modules[moduleName].settings[settingName].value = moduleSettings[settingName]
          })
        })
      } catch (e) {
        log('[ModuleManager]', 'Error loading settings:', e.toString())
      }
    }
  },

  get (name = '') {
    if (!name) {
      return modules
    }

    if (!(name in modules)) {
      return null
    }

    return modules[name]
  },

  add (name, module) {
    if (!name) {
      log('[ModuleManager]', 'tried to add empty module')
      return
    }

    if (!module || typeof module !== 'object') {
      log('[ModuleManager]', 'tried to add invalid module:', name)
      return
    }

    modules[name] = module
  }
}
