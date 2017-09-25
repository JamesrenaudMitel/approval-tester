var express         = require('express')
var expressLayouts  = require('express-ejs-layouts')
var app             = express()
var port            = 8080

// Set the view engine to EJS
app.set('view engine', 'ejs')
app.use(expressLayouts)

// Use the app routes
var router = require('./app/routes')
app.use('/', router)

// Set the static files directory
app.use(express.static(__dirname + '/public'))

// Start the server
app.listen(port, function() {
    console.log(`App started on port ${port}`)
})