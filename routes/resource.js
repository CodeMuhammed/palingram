//import resource controllers here
var rCtrl = require('../app_server/controllers/resourceCtrl.js');

module.exports = function(app){
	//extracts parameters from the route
	app.param('userId' , function(req  , res  , next  , userId){
		req.userId  = userId;
		return next();
	});
	
   app.get('/users/:userId' ,rCtrl.get);
   app.put('/users/:userId' , rCtrl.put);
   app.post('/users/:userId' ,rCtrl.post);
   app.delete('/users/:userId' , rCtrl.remove);
};