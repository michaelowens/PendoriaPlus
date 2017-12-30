/**
 * Color resources red/green based on if you hit the goal (Guild Buildings & Scraptown)
 */

import {observable} from '../../lib/jQTpl'
import PendoriaPlus from '../PendoriaPlus'
import AjaxCallback from './AjaxCallback'
import {log, ModuleSetting} from '../utils'

export default {
  settings: {
    enabled: ModuleSetting({
      label: 'Enabled',
      default: true,
    }),
  },

  init () {
    // do I need this?
    if (!PendoriaPlus.isInitialized) {
      console.error('Module VisualResourceStatus loaded before PendoriaPlus was initialized!')
      return
    }

    log('[VisualResourceStatus]', 'init')

    this.ajaxGuildBuildings = this.ajaxGuildBuildings.bind(this)
    this.ajaxScraptownDetails = this.ajaxScraptownDetails.bind(this)

    this.ranEnable = false

    if (this.settings.enabled.value) {
      this.enable()
    }
  },

  enable () {
    if (this.ranEnable) {
      return
    }

    this.ranEnable = true
    this.setEventHandlers()
  },

  disable () {
    if (!this.ranEnable) {
      return
    }

    this.ranEnable = false
    this.removeEventHandlers()
  },

  setEventHandlers () {
    AjaxCallback.on('/guild/buildings', this.ajaxGuildBuildings)
    AjaxCallback.on('/scraptown/details/*', this.ajaxScraptownDetails)
  },

  removeEventHandlers () {
    AjaxCallback.off('/guild/buildings', this.ajaxGuildBuildings)
    AjaxCallback.off('/scraptown/details/*', this.ajaxScraptownDetails)
  },

  coloredElement (from, to) {
    let goalReached = from >= to
    let $statSpan = $('<span>')

    return $statSpan
      .text(from.toLocaleString())
      .css('color', (goalReached ? 'rgb(29, 166, 87)' : 'red'))
  },

  ajaxGuildBuildings () {
    $('.guild-overview .guild-section:nth-child(2) table tr').each((k, el) => {
      let $el = $(el)
      let $columns = $(el).find('td')

      // check if building is activated
      if ($columns.length < 2) {
        return
      }

      let $statsCol = $columns.eq(1)
      let statsText = $statsCol.text()

      // check if row has stats (x / x,xxx)
      if (!statsText.includes('/')) {
        return
      }

      let [from, to] = statsText.split(' / ').map(str => +str.replace(/[,.]/g, ''))
      let $statSpan = this.coloredElement(from, to)

      $statsCol.text('').append(
        $statSpan,
        ' / ' + to.toLocaleString()
      )
    })
  },

  // Phat arrow to keep scope
  ajaxScraptownDetails () {
    $('.display-item span:eq(1) div:not(.dotted)').each((k, el) => {
      let $el = $(el)
      let [from, _, to, type] = $el.text().split(' ')

      from = +from.replace(/[,.]/g, '')
      to = +to.replace(/[,.]/g, '')

      let $statSpan = this.coloredElement(from, to)

      $el.text('').append(
        $statSpan,
        ' / ' + to.toLocaleString() + ' ' + type
      )
    })
  }
}
