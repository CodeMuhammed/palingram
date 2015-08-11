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
var palingramapi = 'http://palingramapi.herokuapp.com/api';
//var palingramapi = 'http://localhost:3000/api/allPosts';

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

//configure router to use cookie-parser  ,body-parser 
app.get('/' , function(req , res){  
	 request.get(palingramapi+'/allPosts' , function(err , response , body){
         if(err){
              res.status(500).send(err);
         } 
         else {
         	res.render('index.ejs' , {posts:JSON.parse(body)});
         }
	 });
    
});

//configure router to use cookie-parser  ,body-parser 
app.get('/preview/:post_id' , function(req , res){  
	 console.log(req.params.post_id);
	 request.get(palingramapi+'/posts/'+req.params.post_id , function(err , response , body){
         if(err){
              res.status(500).send(err);
         } 
         else {
         	var post = JSON.parse(body)[0];
         	console.log(post.body);
         	res.render('post.ejs' , {post:post});
         }
	 });
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

//app.use(less(path.join(__dirname , 'public' , 'less')));
app.use(express.static(path.join(__dirname , 'public')));

//test api call from front end code


//Start the app
app.listen(app.get('port') , function(){
	console.log('Server running on port ' ,app.get('port'));
});
