import {observable} from '../../lib/jQTpl'
import '../styles/chat.css'

export let settings = observable({
  enabled: true
})

export default {
  init () {
    this.ranEnable = false
    this.$wrapper = $('<div id="chat_wrapper"></div>')
    this.$chat = $(document).find('#chat')

    if (settings.enabled) {
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
  },

  disable () {
    if (!this.ranEnable) {
      return
    }

    this.ranEnable = false

    this.$chat.unwrap()
    this.$chat.find('.frame-vertical-left, .frame-vertical-right').remove()
  }
}