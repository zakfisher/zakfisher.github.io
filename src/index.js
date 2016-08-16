const ResultsComponent = require('./components/results')
const SearchComponent = require('./components/search')
// const TwitchService = require('./services/twitch')

class App {
  constructor() {
    this.results = new ResultsComponent('main .results')
    this.search = new SearchComponent('main .search')

    // Load initial data (will render results on callback)
    // TwitchService.getStreamsFromQuery('starcraft')
    // TwitchService.getStreamsFromQuery()
  }
}

module.exports = window.App = new App()
