// Needs a rewrite
let log = (...args) => console.log(...args)
let $ = window.jQuery
let inDepTarget = null

let dotFromObject = function (obj, dotNotation) {
  return dotNotation.split('.').reduce((o,i) => {
    if (!(i in o)) {
      return ''
    }
    return o[i]
  }, obj)
}

let updateDotFromObject = function (obj, dotNotation, value) {
  var dots = dotNotation.split('.')
  var parentDataObject = dots.reduce((o, i, ci) => {
    if (ci === dots.length - 1) {
      return o
    }
    return o[i]
  }, obj)

  var lastdot = dots[dots.length - 1]
  parentDataObject[lastdot] = value
}

let $template = function (input, ...values) {
  // compile html with tmp holders for nested nodes
  let strings = input
  let html = ''
  let nodes = []
  let varFilters = {}
  let lastuid = -1

  if (typeof strings === String) {
    strings = strings.split('\n')
  }

  for (var i in strings) {
    html += strings[i]

    let value = values[i]
    if (value) {
      if (value instanceof Node || value instanceof jQuery) {
        html += `<div id="jQTpl-tmp-node-${i}"></div>`
        nodes.push(i)
      } else {
        html += value
      }
    }
  }

  // find variables
  html = html.replace(/{{(.*?)}}/g, function (m, key) {
    lastuid += 1

    // save and strip filters
    let [cleanKey, ...filters] = key.split('|')

    if (filters) {
      varFilters[cleanKey] = varFilters[cleanKey] || {}
      varFilters[cleanKey][lastuid] = filters
    }

    return `<span class="jQTpl-tmp-var-${cleanKey}" data-uid="${lastuid}"></span>`
  })

  // return function that will start the app
  return function ($data, $root) {
    let $dataFilters = {}
    if (typeof $data === 'object' && typeof $data._onChange !== 'function') {
      $dataFilters = $data.filters || {}
      $data = $data.scope
    }

    $data = $data || null
    $root = $root || $('#app')

    // add watcher for changes
    let $dataEls = {}
    let changeListeners = {}
    let showListeners = {}

    let applyFilters = function (value, datakey, uid) {
      let filters = varFilters[datakey][uid]

      if (Array.isArray(filters) && filters.length) {
        value = filters.reduce((acc, cur) => $dataFilters[cur](acc), value)
      }

      return value
    }

    if ($data) {
      $data._onChange((key, newValue, oldValue) => {
        // Update textNodes
        if (key in $dataEls) {
          $dataEls[key].forEach(node => {
            node.el.nodeValue = applyFilters(newValue, key, node.uid)
          })
        }

        // 2-way binding: from data to view
        if (key in changeListeners) {
          changeListeners[key].forEach(node => node.val(newValue))
        }

        // show/hide elements
        if (key in showListeners) {
          showListeners[key].forEach(node => node[0].toggle(node[1](newValue)))
        }
      })
    }

    let $doc = $(html)
    nodes.forEach((i) => {
      $doc.find(`#jQTpl-tmp-node-${i}`).replaceWith(values[i])
    })

    $doc.find(`[class^=jQTpl-tmp-var-]`).each((k, el) => {
      let datakey = el.className.split('-').pop()
      let value = dotFromObject($data, datakey)
      let uid = el.getAttribute('data-uid')
      value = applyFilters(value, datakey, uid)
      let t = document.createTextNode(value)
      el.replaceWith(t)
      $dataEls[datakey] = $dataEls[datakey] || []
      $dataEls[datakey].push({
        el: t,
        uid: uid
      })
    })

    let updatingRelatedRadios = false
    $doc.tplModel = function (selector, model) {
      let cleanSelector = selector.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
      // log('[jQTpl]', 'cleanSelector', cleanSelector)
      let tplModelRegex = new RegExp('tplModel[\\s]*\\([\\s]*([\'"`])' + cleanSelector + '\\1[\s]*,[\s]*(.+?)\\)', 'g')
      let tplModelCall = tplModelRegex.exec(arguments.callee.caller.toString())

      if (!tplModelCall || tplModelCall.length < 3) {
        return this;
      }

      var dots = tplModelCall[2].split('.')
      dots.shift()
      var dataDotNotation = dots.join('.')
      log('[jQTpl]', 'get', dataDotNotation, 'in', $data)
      var value = dotFromObject($data, dataDotNotation)
      var $el = this.find(selector)
      // var $dataEl = $dataEls[dataDotNotation].el

      $el
        .val(value)
        .on('input change paste deselect', (e) => {
          if (e.target.type.includes('select') && e.type === 'input') {
            // Select boxes trigger input & event, ignore one of them
            return
          }

          if (updatingRelatedRadios) {
            $(e.target).prop('checked', false)
            return
          }

          let newValue = e.target.value

          if (e.target.type === 'radio' && !updatingRelatedRadios) {
            // update other radios with same name
            let name = $el.attr('name')
            updatingRelatedRadios = true
            // $(`[type="radio"][jq-model="${dataDotNotation}"]`).not(e.target).change()
            updatingRelatedRadios = false
            newValue = $(e.target).prop('checked', true).val()
          }

          if (e.target.type === 'checkbox') {
            newValue = e.target.checked
          }

          updateDotFromObject($data, dataDotNotation, newValue)
        }) // this doesn't work for dot notation of course

      if (['radio', 'checkbox'].includes($el[0].type)) {
        $el.prop('checked', value)
      } else {
        $el.val(value)
      }

      changeListeners[dataDotNotation] = changeListeners[dataDotNotation] || []
      changeListeners[dataDotNotation].push($el)

      return this
    }

    $doc.tplShow = function (selector, model, validator) {
      if (!validator) {
        validator = (value) => value
      }

      if (typeof model === 'undefined') {
        model = selector
        selector = null
      }

      let tplShowCall
      if (selector) {
        let cleanSelector = selector.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
        let tplShowRegex = new RegExp('tplShow[\\s]*\\([\\s]*([\'"`])' + cleanSelector + '\\1[\\s]*,[\\s]*(.+)[\\s]*\\)', 'g')
        tplShowCall = tplShowRegex.exec(arguments.callee.caller.toString())
      }  else {
        let tplShowRegex = new RegExp('tplShow[\\s]*\\([\\s]*(.+)[\\s]*\\)', 'g')
        tplShowCall = tplShowRegex.exec(arguments.callee.caller.toString())
      }

      if (!tplShowCall || tplShowCall.length < 3) {
        return this;
      }

      let lastParams = tplShowCall[2].split(',')
      let m = lastParams.shift()

      let dots = m.split('.')
      dots.shift()
      let dataDotNotation = dots.join('.')
      let $el = (selector ? this.find(selector) : this)

      showListeners[dataDotNotation] = showListeners[dataDotNotation] || []
      showListeners[dataDotNotation].push([$el, validator, model])

      $el.toggle(validator(model))

      return this
    }

    $root.append($doc)

    return $doc
  }
}

let observable = function (obj) {
  let listeners = []

  const handler = function (root) {
    root = root || ''
    if (root) root += '.'

    let deps = {}

    return {
      set(target, key, value, receiver) {
        // extend proxify to appended nested object
        if(({}).toString.call(value) === "[object Object]") {
          value = deepApply(key, value)
        }

        let oldValue = target[key]
        target[key] = value

        listeners.forEach(cb => cb(`${root}${key}`, target[key], oldValue))

        if (key in deps && deps[key]) {
          deps[key].forEach(changeFunc => {
            setTimeout(changeFunc)
          })
        }

        return Reflect.set(target, key, value, receiver)
      },
      get(target, key, receiver) {
        if (key === 'toJSON') {
          return function() { return target; }
        }

        if(!(key in target)) {
          target[key] = null // new Proxy(null, handler())
        }

        if (inDepTarget) {
          deps[key] = deps[key] || []

          if (deps[key].indexOf(inDepTarget) == -1) {
            deps[key].push(inDepTarget)
          }
        }

        return Reflect.get(target, key, receiver)
      },
      deleteProperty(target, key) {
        delete target[key]
      },
      has: function(target, prop) {
        if (prop === '_onChange') {
          return false
        }

        return prop in target
      }
    }
  }

  let deepApply = function (property, data)
  {
    var proxy = new Proxy({}, handler(property))
    var props = Object.keys(data)
    var size = props.length

    for (var i = 0; i < size; i++)
    {
      property = props[i]
      proxy[property] = data[property]
    }
    return proxy
  }

  Object.defineProperty(obj, '_onChange', {
    configurable: false,
    writable: false,
    enumerable: false, // hide it from for..in
    value: function (cb) {
      listeners.push(cb) //console.log('_onChange registered')
    }
  })

  Object.keys(obj).forEach(k => {
    let v = obj[k]
    if(({}).toString.call(v) === "[object Object]") {
      v = deepApply(k, v)
    }

    obj[k] = v
  })

  let p = new Proxy(obj || {}, handler())

  Object.keys(obj).forEach(key => {
    if (typeof obj[key] !== 'function') {
      return
    }

    let f = obj[key] //.bind(p)
    let value;
    let onDependencyUpdated = function () {
      let oldValue = value
      value = f(p)
      listeners.forEach(cb => cb(key, value, oldValue))
    }

    Object.defineProperty(p, key, {
      get: function () {
        inDepTarget = onDependencyUpdated
        value = f(p)
        inDepTarget = null

        return value
      }
    })
  })

  return p
}

// return {
//   $template: $template,
//   observable: observable,
//   textNode: (text) => document.createTextNode(text)
// }
export {$template}
export {observable}
export let textNode = (text) => document.createTextNode(text)
