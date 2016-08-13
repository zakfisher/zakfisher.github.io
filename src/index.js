const ResultsComponent = require('./components/results')
const SearchComponent = require('./components/search')
const TwitchService = require('./services/twitch')

class App {
  constructor() {
    this.results = new ResultsComponent('main .results')
    this.search = new SearchComponent('main .search')
    this.render()

    // Load initial data
    TwitchService.getData()
  }

  render() {
    this.results.render()
    this.search.render()
  }
}

module.exports = window.App = new App()
