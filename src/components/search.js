const TwitchService = require('../services/twitch')

class SearchComponent {
  constructor(rootSelector) {
    this.el = document.querySelector(rootSelector)

    // Hook into Twitch Service for data updates
    TwitchService.listen(this.update.bind(this))
  }

  update(event) {
    switch (event.action) {

    }
  }

  render() {
    this.el.innerHTML = `
      <input type="text" name="query" placeholder="Search query..." />
      <input type="submit" name="submit" value="Search" />
    `
  }

}

module.exports = SearchComponent
