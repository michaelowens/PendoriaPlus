import {log} from './utils'
import AjaxCallback from './modules/AjaxCallback'
import VisualResourceStatus from './modules/VisualResourceStatus'
import StatsPanel from './modules/StatsPanel'
import Chat from './modules/Chat'
import Settings from './modules/Settings'

const modules = {
  AjaxCallback,
  VisualResourceStatus,
  StatsPanel,
  Chat,
  Settings,
}

window.pp_modules = modules

export default {
  init () {
    log('[ModuleManager]', 'init')
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
