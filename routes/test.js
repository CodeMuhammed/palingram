//import controllers here
var testCtrl = require('../app_server/controllers/testCtrl.js');

module.exports = function(app){
	app.get('/csrf' , testCtrl.csrf);
	app.post('/csrf' , testCtrl.csrfP);
};