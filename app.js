///////////////////////////////////////////////////
// Okta terraform service

var cors = require('cors')

const express = require('express')

var bodyParser = require('body-parser')

///////////////////////////////////////////////////

const app = express();

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

app.use(cors())

///////////////////////////////////////////////////

require('./routes.js')(app);

var port = process.env.PORT || 3890;

app.listen(port, function () {
	console.log('App listening on port ' + port);
});
