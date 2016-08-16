const Service = require('../libs/service')

class TwitchService extends Service {
  constructor() {
    super([
      'getStreamsFromQuery',
    ])

    // this.useMockData = true
    this.limit = 100
    this.rootUrl = 'https://api.twitch.tv/kraken/search/streams'
  }

  onGetStreamsFromQuery(query = '') {
    var event = {
      action: 'get streams from query',
      data: null,
      query: query
    }

    // Escape if no query
    if (query.length === 0) {
      return this.trigger(event)
    }

    // Use mock data (for testing)
    if (this.useMockData) {
      event.data = require('./mockData')
      return this.trigger(event)
    }

    // Fetch our data via JSONP from Twitch API
    this.trigger({ action: 'loading streams' })
    this.jsonp(`${this.rootUrl}?limit=${this.limit}&q=${query}`, (data) => {
      event.data = data
      this.trigger(event)
    })
  }
}

module.exports = new TwitchService()
