//Require dependencies phase
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var errorHandler = require('errorhandler');
var logger = require('morgan');
//var less = require('less-middleware');

var compression = require('compression');
var methodOverride = require('method-override');
var favicon = require('serve-favicon');
var path = require('path');

var request = require('request');

var palingramapi = 'https://palingramapi.herokuapp.com/api';


//ONLINE MODE
var BaseUrl = 'http://www.palingram.com';

//OFFLINE MODE
//var BaseUrl = 'http://localhost:3002';

//Instantiate a new express app
var app = express();

//Configure the express app
app.set('view cache' , true);
app.set('views' , 'views');
app.set('view engine' , 'ejs');
app.set('port' , process.env.PORT || 3002);

app.use(compression({threshold:1}));
app.use(methodOverride('_method'));
app.use(favicon(path.join(__dirname , 'public', 'favicon.ico')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(require('prerender-node'));

//configure express static
app.use(express.static(path.join(__dirname , 'public')));

//configure router to use cookie-parser  ,body-parser 
app.get('/allPosts' , function(req , res){ 
	 request.get(palingramapi+'/allPosts' , function(err , response , body){
         if(err){
             res.status(500).send('Internal server error');
         } 
         else {
          res.render('all.ejs' , {posts:JSON.parse(body) , BaseUrl : BaseUrl});
         }
     });
});

app.get('/test' , function(req , res){
	 console.log('test requested');
	 res.status(200).send('<a>For test</a>');
});

//Start the app
app.listen(app.get('port') , function(){
	console.log('Server running on port ' ,app.get('port'));
});
