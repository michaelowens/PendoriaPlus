import {log, capitalize} from '../utils'
import {scope as SettingsScope} from './Settings'

import '../styles/stats-panel.css'
import appView from '../views/stats-panel.html'
import dingalingSound from '../sounds/dingaling.mp3'
import popSound from '../sounds/pop.wav'
import tingSound from '../sounds/ting.wav'

import {$template, observable, textNode} from '../../lib/jQTpl'

export let sounds = {
  dingaling: dingalingSound,
  pop: popSound,
  ting: tingSound
}

export let settings = observable({
  enabled: true,
  lowActionSoundEnabled: true,
  lowActions: 10,
  sound: 'dingaling',
  volume: 50
})

function perHour(total, actions) {
  let hours = (actions * 6) / 3600
  return Math.round(total / hours)
}

export let scope = observable({
  panelEnabled: SettingsScope.settings.panelEnabled,
  type: 'battle',
  skill: '',
  stats: {
    actions: 0,
    exp: 0,
    wins: 0,
    losses: 0,
    gold: 0,
    quints: 0,
    resources: 1,
  },
  resetStatsDate: +new Date(),
  quintsPercentage (data) {
    if (data.stats.actions === 0 || data.stats.quints === 0) {
      return 0
    }

    return (100 / data.stats.actions * data.stats.quints).toFixed(2)
  },
  resourcesPerHour (data) {
    // let passedHours = Math.abs(new Date(data.resetStatsDate) - new Date()) / 36e5
    // return Math.round(data.stats.resources / passedHours);
    if (data.stats.actions === 0) {
      return 0
    }

    return perHour(data.stats.resources, data.stats.actions)
  },
  goldPerHour (data) {
    // let passedHours = Math.abs(new Date(data.resetStatsDate) - new Date()) / 36e5
    // return Math.round(data.stats.gold / passedHours);
    if (data.stats.gold === 0) {
      return 0
    }

    return perHour(data.stats.gold, data.stats.actions)
  },
})

export let filters = {
  toLocaleString: (value) => value.toLocaleString(),
  ucfirst: capitalize
}

export default {
  init () {
    log('[StatsPanel]', 'init')
    log('[StatsPanel]', 'sounds', sounds)

    this.ranEnable = false

    SettingsScope._onChange((k, newVal) => {
      if (k === 'settings.lowActionNotificationVolume') {
        this.setVolume(newVal)
      }
    })

    if (settings.enabled) {
      this.enable()
    }
  },

  enable () {
    if (this.ranEnable) {
      return
    }

    this.ranEnable = true

    this.bindSocketMessages()
    this.initPanel()
    this.setSound(settings.sound)
    this.setVolume(SettingsScope.settings.lowActionNotificationVolume)
  },

  disable () {
    if (!this.ranEnable) {
      return
    }

    this.ranEnable = false

    this.unbindSocketMessages()
    this.removePanel()
    this.removeSound()
  },

  bindSocketMessages () {
    socket.on('tradeskill data', this.onTradeskillData.bind(this))
    socket.on('battle data', this.onBattleData.bind(this))
  },

  unbindSocketMessages () {
    socket.off('tradeskill data', this.onTradeskillData.bind(this))
    socket.off('battle data', this.onBattleData.bind(this))
  },

  setSound (name) {
    this.audio = new Audio(sounds[name])
  },

  setVolume (volume) {
    if (volume < 0 || volume > 100) {
      return
    }

    this.audio.volume = volume / 100
  },

  playSound() {
    if (!this.audio || !settings.lowActionSoundEnabled) {
      return
    }

    this.audio.play()
  },

  removeSound () {
    this.audio = null
  },

  initPanel () {
    this.$wrapper = $('<div id="pendoriaplus_stats"></div>').insertAfter($('#profile'))
    let app = $template(appView)
    this.$app = app({scope, filters}, this.$wrapper)

    this.initPanelBindings()
  },

  removePanel () {
    this.$wrapper.remove()
    this.$wrapper = null
    this.$app = null
  },

  initPanelBindings () {
    this.$app.find('.pendoriaplus_reset_stats').on('click', e => {
      e.preventDefault()
      Object.keys(scope.stats).forEach(k => {
          scope.stats[k] = 0
      })
      scope.resetStatsDate = +new Date()
    })

    // TODO: find a solution for this...
    SettingsScope._onChange((k, newVal) => {
      if (k === 'settings.enabled') {
        scope.panelEnabled = newVal
      }
    })

    this.$app
      .tplShow('> div', scope.panelEnabled)
      .tplShow('#pendoriaplus_stats_battle', scope.type, type => type === 'battle')
      .tplShow('#pendoriaplus_stats_ts', scope.type, type => type === 'tradeskill')
  },

  checkActionsRemaining (data) {
    if (!SettingsScope.settings.lowActionNotificationEnabled) {
      return
    }

    // TODO: improve check so if it skips a number magically, it will still play
    if (data.actionsRemaining === settings.lowActions) {
      this.playSound()
    }
  },

  onTradeskillData (data) {
    log('[StatsPanel]', 'got tradeskill data', data)

    if (scope.type !== 'tradeskill') {
      this.resetStats()
    }

    this.checkActionsRemaining(data)

    scope.type = 'tradeskill'
    scope.skill = data.skill
    scope.stats.actions += 1

    if (data.quintProc) {
        scope.stats.quints += 1
    }

    if (data.gainedAmount) {
        scope.stats.resources += data.gainedAmount
        scope.stats.exp += data.gainedExp
    }
  },

  onBattleData (data) {
    log('[StatsPanel]', 'got battle data', data)

    if (scope.type !== 'battle') {
      this.resetStats()
    }

    this.checkActionsRemaining(data)

    scope.type = 'battle'
    scope.stats.actions += 1

    if (data.victory) {
      scope.stats.wins++
    } else {
      scope.stats.losses++
    }

    if (data.gainedgold) {
      scope.stats.gold += data.gainedgold
      scope.stats.exp += data.gainedexp
    }
  },

  resetStats () {
    Object.keys(scope.stats).forEach(stat => scope.stats[stat] = 0)
  }
}