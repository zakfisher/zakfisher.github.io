const TwitchAPI = require('./twitchAPI')

class App {
  constructor() {
    console.log('twitch', TwitchAPI)
  }
}

module.exports = window.App = new App()
