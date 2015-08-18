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

app.get('/' ,  function(req , res , next){
     if(req.query._escaped_fragment_){
          console.log(req.query._escaped_fragment_);
          var fragmentPathId = req.query._escaped_fragment_.split('/').reverse()[0].trim();

          if(fragmentPathId.length > 15){
              request.get(palingramapi+'/posts/'+fragmentPathId , function(err , response , body){
                     if(err){
                          console.log('called');
                          var post = require('fs').readFileSync('post.txt');
                          res.render('post.ejs' , {post:JSON.parse(post) , BaseUrl:BaseUrl});
                     } 
                     else {
                          res.render('post.ejs' , {post:JSON.parse(body) , BaseUrl:BaseUrl});
                     } 
               });
          }
 
          else{
            //serves the index page for links that were
            //accidentally included but not supposed to be 
            //crawled by search engines
            console.log(fragmentPathId);
            res.render('index.ejs');
          }    
     }
     else{
         console.log('normal non crawler url requested');
         next();
     }
     
});

//configure express static
app.use(express.static(path.join(__dirname , 'public')));

//configure router to use cookie-parser  ,body-parser 
app.get('/allPosts' , function(req , res){ 
	 console.log('gotten all');
	 request.get(palingramapi+'/allPosts' , function(err , response , body){
         if(err){
              var all = require('fs').readFileSync('all.txt');
              res.render('all.ejs' , {posts:JSON.parse(all) , BaseUrl : BaseUrl});
         } 
         else {
         	res.render('all.ejs' , {posts:JSON.parse(body) , BaseUrl : BaseUrl});
         }
	 });
});

//Start the app
app.listen(app.get('port') , function(){
	console.log('Server running on port ' ,app.get('port'));
});
