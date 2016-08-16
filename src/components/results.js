const TwitchService = require('../services/twitch')
const Component = require('../libs/component')

class ResultsComponent extends Component{
  constructor(rootSelector) {
    super(rootSelector)

    this.resultsPerPage = 10

    this.loading = this.el.querySelector('.loading')
    this.resultCount = this.el.querySelector('.result-count span')
    this.pagination = this.el.querySelector('.pagination')
    this.currentPage = this.pagination.querySelector('span.current')
    this.totalPages = this.pagination.querySelector('span.total')
    this.prevPageNav = this.pagination.querySelector('.prev')
    this.nextPageNav = this.pagination.querySelector('.next')
    this.resultList = this.el.querySelector('ul.result-list')

    // Add pagination handlers
    this.prevPageNav.addEventListener('click', () => { this.goToPage('prev') })
    this.nextPageNav.addEventListener('click', () => { this.goToPage('next') })

    // Hook into Twitch Service for data updates
    TwitchService.listen(this.update.bind(this))
  }

  update(event) {
    switch (event.action) {
      case 'loading streams':
        this.el.hidden = true
        this.loading.hidden = false
        break
      case 'get streams from query':
        const streams = event.data ? event.data.streams : []
        this.results = streams
        this.el.hidden = false
        this.loading.hidden = true

        // Update pagination
        this.resultCount.innerText = streams.length
        this.currentPage.innerText = 1
        this.totalPages.innerText = streams.length ? Math.ceil(streams.length / this.resultsPerPage) : 1

        // Toggle pagination nav display
        const onlyOnePage = this.currentPage.innerText === this.totalPages.innerText
        this.prevPageNav.hidden = onlyOnePage
        this.nextPageNav.hidden = onlyOnePage

        // Render results list
        const pageOneResults = streams.slice(0, this.resultsPerPage)
        this.renderList(pageOneResults)
        break
    }
  }

  renderList(results = []) {
    let html = '<li>No results found.</li>'
    if (results.length > 0) {
      html = ''
      results.forEach((result) => {
        const background = `url(${result.preview.medium}) center center / cover no-repeat`
        html += `
          <li>
            <div class="image" style="background: ${background}"></div>
            <div class="info">
              <h1>${result.channel.display_name}</h1>
              <h2>${result.game} - ${result.channel.views} viewers</h2>
              <p>${result.channel.status}</p>
            </div>
          </li>
        `
      })
    }
    this.resultList.innerHTML = html
  }

  goToPage(direction = 'next') {
    var currentPage = this.currentPage.innerText
    const totalPages = this.totalPages.innerText

    switch (direction) {
      case 'prev':
        if (parseInt(currentPage) === 1) currentPage = totalPages
        else currentPage--
        break
      case 'next':
        if (currentPage === totalPages) currentPage = 1
        else currentPage++
        break
      default:
    }

    // Update display
    this.currentPage.innerText = currentPage

    // Render results list
    const fromIndex = --currentPage * this.resultsPerPage
    const toIndex = fromIndex + this.resultsPerPage
    const pageResults = this.results.slice(fromIndex, toIndex)
    this.renderList(pageResults)
  }
}

module.exports = ResultsComponent
