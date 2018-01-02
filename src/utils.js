export let debug = true

export function log() {
  if (!debug) {
    return
  }

  console.log('[PendoriaPlus]', ...arguments)
}

export function capitalize([first, ...rest]) {
  if (!first) {
    return ''
  }
  return first.toUpperCase() + rest.join('')
}

export function guessType (setting) {
  let type = 'string'

  if (setting.type) {
    return setting.type
  }

  if ('options' in setting) {
    return 'select'
  }

  if ('constraint' in setting) {
    if ('min' in setting.constraint || 'max' in setting.constraint) {
      return 'number'
    }
  }

  if ('default' in setting && typeof setting.default === 'boolean') {
    return 'checkbox'
  }

  return type
}

export function ModuleSetting (setting) {
  const defaults = {
    type: guessType(setting),
    value: ('value' in setting ? setting.value : setting.default),
    toString () {
      return this.value || this.default
    }
  }

  let obj = Object.assign(defaults, setting)
  let oldValue = JSON.parse(JSON.stringify(obj.value))
  if ('onChange' in obj) {
    setInterval(() => {
      if (obj.value !== oldValue) {
        oldValue = JSON.parse(JSON.stringify(obj.value))
        obj.onChange(obj.value)
      }
    }, 10)
  }

  return obj
}

/*export class ModuleSetting {
  constructor (options) {
    const defaults = {
      type: this.guessType(options)
    }

    this.options = Object.assign({}, defaults, options)
  }

  get value() {
    return this.options.value
  }

  set value(value) {
    if (this.options.type === 'number') {
      this.options.value = parseInt(value, 10)
      return
    }

    this.options.value = value
  }

  guessType (options) {
    let type = 'string'

    if (options.type) {
      return options.type
    }

    if ('constraint' in options) {
      if ('min' in options.constraint || 'max' in options.constraint) {
        return 'number'
      }
    }

    if ('default' in options && typeof options.default === 'boolean') {
      return 'checkbox'
    }

    return type
  }

  toString () {
    return this.options.value
  }
}*/
