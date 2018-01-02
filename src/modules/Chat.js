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
    size: ModuleSetting({
      label: 'Chat size & position',
      default: 'content',
      options: ['default', 'content', 'side-by-side'],
      onChange (value) {
        this.setSize(value)
      }
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

    this.isDragging = false
    this.onMouseMove = this.onMouseMove.bind(this)

    $(document).on('mouseup', () => this.isDragging = false)
    $(document).on('mousemove', this.onMouseMove)
    this.$chat.find('#dragable').on('mousedown', (e) => {
      if (this.settings.size.value === 'content') {
        e.stopPropagation()
        window.isDragging = false
        this.isDragging = true
      }
    })

    if (this.settings.enabled) {
      this.enable()
    }
  },

  enable () {
    if (this.ranEnable) {
      return
    }

    this.ranEnable = true

    this.setSize()
    this.toggleTabs(this.settings.tabs.value)

    // log('[Chat]', 'show tabs?', JSON.stringify(this.settings.tabs.value))
    // if (this.settings.tabs.value) {
    //   this.$chat.addClass('with-tabs')
    // }
  },

  disable () {
    if (!this.ranEnable) {
      return
    }

    this.ranEnable = false

    this.setSize('default')
    this.toggleTabs(false)
  },

  setSize (value) {
    if (typeof value === 'undefined') {
      value = this.settings.size.value
    }

    if (value === 'content') {
      this.$chat.wrap(this.$wrapper)
      this.$chat
        .prepend('<div class="frame frame-vertical-left"></div>')
        .prepend('<div class="frame frame-vertical-right"></div>')
    } else {
      this.$chat.unwrap()
      this.$chat.find('.frame-vertical-left, .frame-vertical-right').remove()
    }

    $('body')[value === 'side-by-side' ? 'addClass' : 'removeClass']('pp_chat_side_by_side')
  },

  onMouseMove (e) {
    if (e) {
      e.stopPropagation()
    }

    if (this.isDragging) {
      var height = (1 - (event.clientY / $(window).height())) * 100
      if(height > 85) {
        height = '85%'
      } else if (height < 30) {
        height = '30%'
      } else {
        height = height + '%'
      }
      $('#chat_wrapper').css('height', height)
    }
  },

  toggleTabs (value) {
    if (typeof value === 'undefined') {
      value = !this.settings.tabs.value
    }

    value = !!value
    this.$chat[value ? 'addClass' : 'removeClass']('with-tabs')
  },
}