const TwitchService = require('../services/twitch')

class ResultsComponent {
  constructor(rootSelector) {
    this.el = document.querySelector(rootSelector)
    this.pagination = this.el.querySelector('.pagination')
    this.list = this.el.querySelector('ul.result-list')

    // Hook into Twitch Service for data updates
    TwitchService.listen(this.update.bind(this))
  }

  update(event) {
    switch (event.action) {
      case 'get data':
        this.renderList(event.data.streams || [])
        break
    }
  }

  render() {
    this.renderPagination()
    this.renderList()
  }

  renderPagination() {
    let html = ''
    this.pagination.innerHTML = html
  }

  renderList(items = []) {
    console.log('render list', items)
    let html = '<li>No results found.</li>'
    if (items.length > 0) {
      html = ''
      items.forEach((item) => {
        html +=     `
          <li>
            <img src="" />
            <h1>Stream display name</h1>
            <h2>Game name - 1234 viewers</h2>
            <p>description...</p>
          </li>
        `
      })
    }
    this.list.innerHTML = html
  }
}

module.exports = ResultsComponent
