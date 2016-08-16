const TwitchService = require('../services/twitch')
const Component = require('../libs/component')

class ResultsComponent extends Component{
  constructor(rootSelector) {
    super(rootSelector)

    this.resultsPerPage = 5

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
        this.el.hidden = streams.length === 0
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
        this.renderList(streams)
        break
    }
  }

  renderList(streams = []) {
    let html = '<li>No results found.</li>'
    if (streams.length > 0) {
      html = ''
      streams.forEach((stream) => {
        html += `
          <li>
            <img src="${stream.preview.medium}" />
            <h1>${stream.channel.display_name}</h1>
            <h2>${stream.game} - ${stream.channel.views} viewers</h2>
            <p>${stream.channel.status}</p>
          </li>
        `
      })
    }
    this.resultList.innerHTML = html
  }

  goToPage(direction = 'next') {
    const currentPage = this.currentPage.innerText
    console.log(direction, currentPage)

    switch (direction) {
      case 'prev':
        break
      case 'next':
        break
      default:
    }
  }
}

module.exports = ResultsComponent
