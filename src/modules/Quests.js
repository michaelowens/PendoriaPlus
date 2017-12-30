import {log, ModuleSetting} from '../utils'

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
    let hours   = Math.floor(sec_num / 3600)
    let minutes = Math.floor((sec_num - (hours * 3600)) / 60)
    let seconds = sec_num - (hours * 3600) - (minutes * 60)

    let str = ''
    if (hours > 0) {
      if (hours < 10) hours = '0' + hours
      str += hours + 'h'
    }

    if (hours > 0 || minutes > 0) {
      if (minutes < 10) minutes = '0' + minutes
      str += minutes + 'm'
    }

    if (seconds < 10) seconds = '0' + seconds
    str += seconds + 's'

    log('[Quests]', 'setRemainingTime', actions, str)
    this.$timeRemaining.text(str ? `(${str})` : '')
  },
}
