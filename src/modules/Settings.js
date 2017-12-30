import {log} from '../utils.js'
import ModuleManager from '../ModuleManager'
import {$template, observable} from '../../lib/jQTpl'
import StatsPanel from '../modules/StatsPanel'

import settingsView from '../views/settings.vue'
import '../styles/settings.css'

const defaultScope = {
  test_version: '0.1',
  modules: {},
  settings: {
    panelEnabled: true,
    lowActionNotificationEnabled: true,
    lowActionNotificationSound: 'dingaling',
    lowActionNotificationVolume: 50
  },
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
    // scope.modules.push(Object.keys(modules))
  },

  addMenuItem () {
    // let $item = $('<li style="vertical-align: top"><a id="pendoriaplus-button">Pendoria+</a></li>')
    let $item = $('<li><a href="#" id="pendoriaplus-button"> <i class="fa fa-wrench"> </i>Pendoria+</a></li>')

    $item.find('a').on('click', this.open.bind(this))

    // $("#gameframe-menu ul li:first-child").before($item)
    $("#menu ul li:last-child").before($item)
  },

  open () {
    this.$wrapper = $('<div id="pendoriaplus_settings"></div>')
    $('#gameframe-battle').hide()
    $('#gameframe-content').show().html(this.$wrapper)

    this.initView()
  },

  initView () {
    const ViewCtor = Vue.extend(settingsView)
    const ViewInstance = new ViewCtor({
      el: this.$wrapper[0],
      // template: settingsView,
      data: scope,
      methods: this.methods,
      // methods: methods
    })
    // let settingsTpl = $template(settingsView)
    // this.$view = settingsTpl(scope, this.$wrapper)

    // this.initViewBindings()
  },

  initViewBindings () {
    this.$view.find('.nav-tabs li a').on('click', function (e) {
      let link = $(e.currentTarget).data('link')

      if (!link) {
        return
      }

      scope.tab = link
    })

    this.$view
      .tplModel('[name="pendoriaplus_stats_panel_enabled"]', scope.settings.panelEnabled)
      .tplModel('[name="pendoriaplus_low_action_notification"]', scope.settings.lowActionNotificationEnabled)
      .tplModel('[name="pendoriaplus_low_action_notification_sound"]', scope.settings.lowActionNotificationSound)
      .tplModel('[name="pendoriaplus_low_action_notification_volume"]', scope.settings.lowActionNotificationVolume)
      .tplShow('[data-tab="settings"]', scope.tab, tab => tab === 'settings')
      .tplShow('[data-tab="about"]', scope.tab, tab => tab === 'about')
      .tplShow('[data-show="low_action_notification"]', scope.settings.lowActionNotificationEnabled)

    scope._onChange((k, newVal) => {
      log('[Settings]', 'key', k)
      if (k === 'settings.lowActionNotificationSound') {
        StatsPanel.setSound(newVal)
      }
    })
  },
}