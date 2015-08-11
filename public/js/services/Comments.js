angular.module('Comments' , [])
   .factory('Comments' , function($http , $q , BaseUrl){
   	   var comments;
   	   var get = function(id){
           var promise = $q.defer();
           
           $http({
           	  method: 'GET',
           	  url: BaseUrl+'/api/comments/'+id
           })
           .success(function(data){
           	  comments  = data[0];
   	   	      promise.resolve(comments.comments);
           })
           .error(function(err){
           	  alert('comments get error');
              promise.reject(err);
           });

   	   	   return promise.promise;
   	   }
       
       var postComment = function(newComment){
       	   var promise = $q.defer();
       	   var exists = false
       	   angular.forEach(comments.comments , function(comment){
                if(comment.body == newComment.body){
                	exists = true;
                }    
       	   });
           
           if(exists){
              promise.reject('You have posted exactly this comment before');
           }
           else {
           	  $http({
	           	   method : 'POST',
	           	   url : BaseUrl+'/api/comments/'+comments._id,
	           	   data : newComment 
	           })
	           .success(function(status){
                   comments.comments.push(newComment); 
                   promise.resolve(status);
	           })
	           .error(function(err){
	           	   promise.reject(err);
                   alert('something went wrong when posting comment');
	           });
           }
           
           return promise.promise;
       }

       var updateComment = function(comment){
            var promise = $q.defer();
            $http({
                 method : 'PUT',
                 url : BaseUrl+'/api/comments/'+comments._id,
                 data : comment 
             })
             .success(function(status){
                   promise.resolve(status);
             })
             .error(function(err){
                 promise.reject(err);
                   alert('something went wrong when posting comment');
             });
            return promise.promise;

       };

       var deleteComment = function(comment){
       	   var promise = $q.defer();
       	   $http({
       	   	  method:'DELETE',
       	   	  url : BaseUrl+'/api/comments/'+comments._id,
       	   	  params : comment
       	   })
       	   .success(function(status){
               var index = comments.comments.indexOf(comment);
               comments.comments.splice(index , 1);
               promise.resolve(status);
       	   })
       	   .error(function(err){
           	   promise.reject(err);
               alert('something went wrong when deleting comment');
           });
           return promise.promise;
       };

       
   	   return{
   	   	   get : get,
   	   	   postComment : postComment,
   	   	   deleteComment: deleteComment,
           updateComment : updateComment
   	   }
   })

   .filter('commentFilter' , function($filter){
       return function(data , criteria){
            if(data && angular.isArray(data)){
                var sorted;
                if(criteria == 'Most Popular'){
                    var customSort = function(item){
                       return item.voters.up.length + item.voters.down.length;
                    }
                    sorted = $filter('orderBy')(data , customSort);
                }
                
                else if(criteria == 'Best Voted'){
                   var customSort  = function(item){
                        return item.voters.up.length;
                   }
                   sorted =  $filter('orderBy')(data , customSort);
                }

                else if(criteria == 'Most Recent'){
                   sorted =  $filter('orderBy')(data , 'date');
                }

                return sorted.reverse();
            }
            else{
                return data;
            }
       }
   });