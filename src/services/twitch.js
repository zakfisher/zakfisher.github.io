const data = require('./mockData')

class TwitchService {
  constructor() {
    this.data = {}
    this.listeners = []
    this.actions = [
      'getData'
    ]
    this._initActionCallbacks()
  }

  _initActionCallbacks() {
    // Hook each action to an on<ActionName> callback
    // i.e. `getData` will fire `onGetData`
    this.actions.forEach((action) => {
      this[action] = () => {
        const onAction = `on${action[0].toUpperCase()}${action.substr(1)}`
        if (this[onAction]) {
          this[onAction]()
        }
      }
    })
  }

  onGetData() {
    this.trigger({
      action: 'get data',
      data: data
    })
  }

  listen(listener) {
    if (typeof listener === 'function') {
      this.listeners.push(listener)
    }
  }

  trigger(data) {
    this.listeners.forEach((listener) => {
      listener(data)
    })
  }

}

module.exports = new TwitchService()
