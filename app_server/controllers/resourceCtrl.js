//this holds the logic behind this specific resource
var resourceGet=function(req , res) {
	res.set('Content-Type','application/json');
    res.status(200).send({data:'GET Ok '+ req.userId , id : '33'});
};

var resourcePut=function (req , res) {
	res.set('Content-Type','application/json');
    res.status(200).send({data:'PUT Ok '+ req.userId});
};

var resourcePost=function(req , res) {
	console.log(req.body);
	res.set('Content-Type','application/json');
    res.status(200).send({data:'POST Ok '+ req.userId});
};


var resourceDelete=function(req , res) {
	res.set('Content-Type','application/json');
    res.status(200).send({data:'DELETE Ok '+ req.userId});
};

module.exports  = {
	"get" : resourceGet,
	"put" : resourcePut,
	"post" : resourcePost,
	"remove" : resourceDelete
};