//Require dependencies phase
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var errorHandler = require('errorhandler');
var logger = require('morgan');
//var less = require('less-middleware');
var jade = require('jade');
var compression = require('compression');
var methodOverride = require('method-override');
var favicon = require('serve-favicon');
var path = require('path');
var busboy = require('connect-busboy');

//Instantiate a new express app
var app = express();

//Configure the express app
app.set('view cache' , true);
app.set('views' , path.join(__dirname , 'app_server' ,'views'));
app.set('view engine' , 'jade');
app.set('busboy' , busboy);
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

//app.use(less(path.join(__dirname , 'public' , 'less')));
app.use(express.static(path.join(__dirname , 'public')));


//handle errors using custom or 3rd party middle-wares
/*custom error handler can be created easily as follows
 *app.use(function(err  , req , res , next){
	 //Do something here
	 res.status(500).end(err);
 });
*/

//app.use(errorHandler());

//Start the app
app.listen(app.get('port') , function(){
	console.log('Server running on port ' ,app.get('port'));
});
