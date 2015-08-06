/*test route implementations*/
var csrf = function(req , res){
	res.send(req.csrfToken());
};

var csrfP = function(req , res){
	res.status(200).send('ok csrf validated');
}

module.exports = {
	csrf : csrf,
	csrfP : csrfP
};