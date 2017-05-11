var http         = require('http'),
	express      = require('express'),
	path         = require('path'),
	bodyParser   = require('body-parser'),
	index        = require('./routes/index');

var app = express();

// Setup ejs
var ejs = require('ejs');
app.engine('.html', ejs.__express);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.use(express.static(path.join(__dirname, 'bower_components')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Setup routes
app.use('/', index);

http.createServer(app).listen(8080);
