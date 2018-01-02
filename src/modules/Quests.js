import {log, secondsToString, ModuleSetting} from '../utils'

import '../styles/quests.css'

export default {
  settings: {
    enabled: ModuleSetting({
      label: 'Enabled',
      default: true,
    }),
    showTimeRemaning: ModuleSetting({
      label: 'Show est. time remaining',
      default: true,
    }),
  },

  init () {
    log('[StatsPanel]', 'init')

    this.ranEnable = false
    this.$timeRemaining = null

    this.onSocketData = this.onSocketData.bind(this)

    if (this.settings.enabled.value) {
      this.enable()
    }
  },

  enable () {
    if (this.ranEnable) {
      return
    }

    this.ranEnable = true

    this.bindSocketMessages()

    if (this.settings.showTimeRemaning.value) {
      this.initTimeRemaning()
    }
  },

  disable () {
    if (!this.ranEnable) {
      return
    }

    this.ranEnable = false

    this.unbindSocketMessages()
    this.removeTimeRemaining()
  },

  initTimeRemaning () {
    this.$timeRemaining = $('<span id="pp_timeRemaining"></span>').insertAfter('#quest_prog')
  },

  removeTimeRemaining () {
    if (!this.$timeRemaining) {
      return
    }

    this.$timeRemaining.remove()
    this.$timeRemaining = null
  },

  bindSocketMessages () {
    socket.on('tradeskill data', this.onSocketData)
    socket.on('battle data', this.onSocketData)
  },

  unbindSocketMessages () {
    socket.off('tradeskill data', this.onSocketData)
    socket.off('battle data', this.onSocketData)
  },

  onSocketData (data) {
    if (data.quest_status !== 2) {
      this.$timeRemaining.text('')
      return
    }

    this.setRemainingTime(data.quest_count)
  },

  setRemainingTime (actions) {
    const sec_num = actions * 6
    const str = secondsToString(sec_num)

    log('[Quests]', 'setRemainingTime', actions, str)
    this.$timeRemaining.text(str ? `(${str})` : '')
  },
}
