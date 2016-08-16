class Service {
  constructor(actions = []) {
    this.actions = actions
    this.data = {}
    this.listeners = []
    this.initActions()
  }

  initActions() {
    // Hook each action to an on<ActionName> callback
    // i.e. `getData` will fire `onGetData`
    this.actions.forEach((action) => {
      this[action] = (data) => {
        const onAction = `on${action[0].toUpperCase()}${action.substr(1)}`
        if (this[onAction]) {
          this[onAction](data)
        }
      }
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

  jsonp(url, callback) {
    const timeoutLimit = 10000 // timeout request after 5 seconds
    var isLoaded = false

    // Create script with url and callback (if specified)
    var ref = window.document.getElementsByTagName('script')[0]
    var script = window.document.createElement('script')
    script.src = url + (url.indexOf('?') > -1 ? '&' : '?') + 'callback=next'
    window.next = callback

    // Insert script tag into the DOM (append to <head>)
    ref.parentNode.insertBefore(script, ref)

    // After the script is loaded (and executed), remove it
    script.onload = () => {
      script.remove()
      isLoaded = true
    }

    // If request times out...
    setTimeout(() => {
      if (!isLoaded) {
        console.warn('Request timed out.', url)
        script.remove()
        next()
      }
    }, timeoutLimit)
  }
}

module.exports = Service
