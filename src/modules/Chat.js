import {observable} from '../../lib/jQTpl'
import {log, ModuleSetting} from '../utils'
import '../styles/chat.css'

export default {
  // ranEnable: false,

  settings: {
    enabled: ModuleSetting({
      label: 'Enabled',
      default: true,
    }),
    tabs: ModuleSetting({
      label: 'Channels as tabs',
      default: true,
      onChange (value) {
        this.toggleTabs(value)
      },
    })
  },

  init () {
    this.ranEnable = false
    this.$wrapper = $('<div id="chat_wrapper"></div>')
    this.$chat = $(document).find('#chat')

    if (this.settings.enabled) {
      this.enable()
    }
  },

  enable () {
    if (this.ranEnable) {
      return
    }

    this.ranEnable = true

    this.$chat.wrap(this.$wrapper)
    this.$chat
      .prepend('<div class="frame frame-vertical-left"></div>')
      .prepend('<div class="frame frame-vertical-right"></div>')

    log('[Chat]', 'show tabs?', JSON.stringify(this.settings.tabs.value))
    if (this.settings.tabs.value) {
      this.$chat.addClass('with-tabs')
    }
  },

  disable () {
    if (!this.ranEnable) {
      return
    }

    this.ranEnable = false

    this.$chat.unwrap()
    this.$chat.removeClass('with-tabs')
    this.$chat.find('.frame-vertical-left, .frame-vertical-right').remove()
  },

  toggleTabs (value) {
    if (typeof value == 'undefined') {
      value = !this.settings.tabs
    }

    value = !!value
    this.$chat[value ? 'addClass' : 'removeClass']('with-tabs')
  },
}