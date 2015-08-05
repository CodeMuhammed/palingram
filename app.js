//Require dependencies phase
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var logger = require('morgan');
var compression = require('compression');
var methodOverride = require('method-override');
var favicon = require('serve-favicon');
var path = require('path');

//Instantiate a new express app
var app = express();

//Configure the express app
app.set('port' , process.env.PORT || 3000);
app.use(compression({threshold:1}));
app.use(logger('combined'));
app.use(methodOverride('_method'));
app.use(favicon(path.join(__dirname , 'public', 'favicon.ico')));

//configure router to use cookie-parser  ,body-parser 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(session({resave:true , secret:'this string' , saveUninitialized:true}));
app.use(express.static(path.join(__dirname , 'public')));

//Start the app
app.listen(app.get('port') , function(){
	console.log('Server running on port ' ,app.get('port'));
});
