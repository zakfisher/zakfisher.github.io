const ResultsComponent = require('./components/results')
const SearchComponent = require('./components/search')

class App {
  constructor() {
    this.results = new ResultsComponent('main .results')
    this.search = new SearchComponent('main .search')
  }
}

module.exports = window.App = new App()
