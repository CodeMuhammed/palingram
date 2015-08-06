//Import controllers here
var mainCtrl = require('../app_server/controllers/mainCtrl.js');

module.exports = function(app){
	app.get('/' , mainCtrl.index);
}