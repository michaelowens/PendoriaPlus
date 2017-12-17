// ==UserScript==
// @name         Pendoria+
// @description  Improve Pendoria with visual enhancements and statistics
// @namespace    http://pendoria.net/
// @version      0.2
// @author       Michael Owens (Xikeon)
// @match        http://pendoria.net/game
// @match        https://pendoria.net/game
// @match        http://www.pendoria.net/game
// @match        https://www.pendoria.net/game
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const AJAX_CALLBACKS = {
      '/guild/buildings': ajaxGuildBuildings,
      '/scraptown/details/*': ajaxScraptownDetails
    }

    function ajaxGuildBuildings() {
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
        let goalReached = from >= to
        let $statSpan = $('<span>')

        $statSpan
          .text(from.toLocaleString())
          .css('color', (goalReached ? 'rgb(29, 166, 87)' : 'red'))

        // $statsCol.append(goalReached ? $goalReached.clone() : $goalNotReached.clone())

        $statsCol.text('').append(
          $statSpan,
          ' / ' + to.toLocaleString()
        )
      })
    }


    // Enhance Scraptown building details popup
    function ajaxScraptownDetails() {
      $('.display-item span:eq(1) div:not(.dotted)').each((k, el) => {
        let $el = $(el)
        let statsText = $el.text()
        let [from, _, to, type] = statsText.split(' ')

        from = +from.replace(/[,.]/g, '')
        to = +to.replace(/[,.]/g, '')

        let goalReached = from >= to
        let $statSpan = $('<span>')
        $statSpan
          .text(from.toLocaleString())
          .css('color', (goalReached ? 'rgb(29, 166, 87)' : 'red'))

        $el.text('').append(
          $statSpan,
          ' / ' + to.toLocaleString() + ' ' + type
        )
      })
    }

    $(document).ajaxComplete((e, xhr, settings) => {
      let foundCallback = Object.keys(AJAX_CALLBACKS).find(url => settings.url.match(url))
      if (!foundCallback) {
        return
      }

      AJAX_CALLBACKS[foundCallback](e, xhr, settings)
    })
})()
