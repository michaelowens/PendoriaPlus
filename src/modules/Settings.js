import {log} from '../utils.js'
import ModuleManager from '../ModuleManager'
import {$template, observable} from '../../lib/jQTpl'
import StatsPanel from '../modules/StatsPanel'

import settingsView from '../views/settings.vue'
import '../styles/settings.css'

const defaultScope = {
  test_version: '0.1',
  modules: {},
  tab: 'settings',
  text: '',
  radio: '',
  checkbox: '',
  select: '',
}

// TODO: load from localstorage?
export let scope = defaultScope

export default {
  methods: {
    playSound () {
      log('[Settings]', 'test sound')
      StatsPanel.playSound()
    }
  },

  init () {
    log('[Settings]', 'init')
    this.addModules()
    this.addMenuItem()
  },

  addModules () {
    let modules = ModuleManager.get()
    Object.keys(modules).forEach(name => {
      log('[Settings]', 'add module', name)
      scope.modules[name] = modules[name]
    })
  },

  addMenuItem () {
    let $item = $('<li><a href="#" id="pendoriaplus-button"> <i class="fa fa-wrench"> </i>Pendoria+</a></li>')

    $item.find('a').on('click', this.open.bind(this))

    // $("#gameframe-menu ul li:first-child").before($item)
    $("#menu ul li:last-child").before($item)
  },

  open () {
    if (this.vm) {
      this.vm.$destroy()
      this.vm = null
      setTimeout(this.open.bind(this), 1) // give Vue time to destroy
      return
    }

    this.$wrapper = $('<div id="pendoriaplus_settings"></div>')
    $('#gameframe-battle').hide()
    $('#gameframe-content').show().html(this.$wrapper)

    this.initView()
  },

  initView () {
    const ViewCtor = Vue.extend(settingsView)
    this.vm = new ViewCtor({
      el: this.$wrapper[0],
      // template: settingsView,
      data: scope,
      methods: this.methods,
      // methods: methods
    })
  },
}