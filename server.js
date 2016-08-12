'use strict'

var express = require('express')

var app = express()
app.set('port', (process.env.PORT || 1105))
app.use(express.static(__dirname))
app.listen(app.get('port'), function () {
  console.log("App server is running at localhost:" + app.get('port'))
})
