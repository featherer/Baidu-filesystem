process.on('uncaughtException', function (err) {
	console.log(err);
})

var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var multer = require('multer');

var routes = require('./routes/index');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/static', express.static('public'));
app.use(multer({
	dest: './uploads',
	rename: function (fieldname, filename, req, res) {
		return filename;
	}
}))

app.use('/', routes);

app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
})

app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
})

app.listen(8080);

module.exports = app;
