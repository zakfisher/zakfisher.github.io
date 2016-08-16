const TwitchService = require('../services/twitch')
const Component = require('../libs/component')

class SearchComponent extends Component{
  constructor(rootSelector) {
    super(rootSelector)

    this.query = this.el.querySelector('input[name="query"]')

    // Hook into Twitch Service for data updates
    TwitchService.listen(this.update.bind(this))

    // Add submit handler to form
    this.el.addEventListener('submit', this.submit)
  }

  submit(e) {
    e.preventDefault()
    TwitchService.getStreamsFromQuery(this.query.value.trim())
    this.query.blur()
  }
}

module.exports = SearchComponent
