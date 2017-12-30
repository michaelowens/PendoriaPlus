import {log, capitalize, ModuleSetting} from '../utils'
import {scope as SettingsScope} from './Settings'

import '../styles/stats-panel.css'
import appView from '../views/stats-panel.html'
// import dingalingSound from '../sounds/dingaling.mp3'
// import popSound from '../sounds/pop.wav'
// import tingSound from '../sounds/ting.wav'

import {$template, observable, textNode} from '../../lib/jQTpl'

export let sounds = {
  plucky: 'https://notificationsounds.com/soundfiles/1728efbda81692282ba642aafd57be3a/file-sounds-1101-plucky.wav',
  openEnded: 'https://notificationsounds.com/soundfiles/8eefcfdf5990e441f0fb6f3fad709e21/file-sounds-1100-open-ended.wav',
  ping: 'https://notificationsounds.com/soundfiles/4e4b5fbbbb602b6d35bea8460aa8f8e5/file-sounds-1096-light.wav',
}

function perHour(total, actions) {
  let hours = (actions * 6) / 3600
  return Math.round(total / hours)
}

export let scope = observable({
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
  settings: {
    enabled: ModuleSetting({
      label: 'Enabled',
      default: true,
    }),
    panelEnabled: ModuleSetting({
      label: 'Show panel under mini profile',
      default: true,
      onChange (value) {
        if (!this.settings.enabled.value) {
          return
        }

        if (value) {
          this.initPanel()
        } else {
          this.removePanel()
        }
      },
    }),
    lowActionSoundEnabled: ModuleSetting({
      label: 'Low action sound enabled',
      default: true,
    }),
    lowActions: ModuleSetting({
      label: 'Low action sound at actions remaining',
      default: 10,
      constraint: {
        min: 1,
        max: 100,
      },
    }),
    sound: ModuleSetting({
      label: 'Low action sound',
      default: 'plucky',
      options: Object.keys(sounds)
    }),
    volume: ModuleSetting({
      label: 'Low action sound volume',
      default: 50,
      constraint: {
        min: 0,
        max: 100,
      },
    }),
  },

  init () {
    log('[StatsPanel]', 'init')
    log('[StatsPanel]', 'sounds', sounds)

    this.ranEnable = false

    this.onTradeskillData = this.onTradeskillData.bind(this)
    this.onBattleData = this.onBattleData.bind(this)

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
    this.initPanel()
    this.setSound(this.settings.sound.value)
    this.setVolume(this.settings.volume.value)
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
    socket.on('tradeskill data', this.onTradeskillData)
    socket.on('battle data', this.onBattleData)
  },

  unbindSocketMessages () {
    socket.off('tradeskill data', this.onTradeskillData)
    socket.off('battle data', this.onBattleData)
  },

  setSound (name) {
    this.audio = new Audio(sounds[name])
    this.audio.setAttribute('name', name)
  },

  setVolume (volume) {
    if (volume < 0 || volume > 100) {
      return
    }

    this.audio.volume = volume / 100
  },

  playSound() {
    if (!this.audio || !this.settings.lowActionSoundEnabled.value) {
      return
    }

    if (this.audio.getAttribute('name') != this.settings.sound.value) {
      this.setSound(this.settings.sound.value)
    }

    if (this.audio.volume !== this.settings.volume.value / 100) {
      this.setVolume(this.settings.volume.value)
    }

    this.audio.play()
  },

  removeSound () {
    this.audio = null
  },

  initPanel () {
    if (this.$wrapper || !this.settings.panelEnabled.value) {
      return
    }

    this.$wrapper = $('<div id="pendoriaplus_stats"></div>').insertAfter($('#profile'))
    let app = $template(appView)
    this.$app = app({scope, filters}, this.$wrapper)

    this.initPanelBindings()
  },

  removePanel () {
    if (!this.$wrapper) {
      return
    }

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

    this.$app
      // .tplShow('> div', this.settings.panelEnabled.value)
      .tplShow('#pendoriaplus_stats_battle', scope.type, type => type === 'battle')
      .tplShow('#pendoriaplus_stats_ts', scope.type, type => type === 'tradeskill')
  },

  checkActionsRemaining (data) {
    // if (!this.settings.lowActionSoundEnabled.value) {
    //   return
    // }

    // TODO: improve check so if it skips a number magically, it will still play
    log('[StatsPanel]', 'lowActions', data.actionsRemaining, '===', this.settings.lowActions.value, data.actionsRemaining === this.settings.lowActions.value)
    if (data.actionsRemaining === this.settings.lowActions.value) {
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