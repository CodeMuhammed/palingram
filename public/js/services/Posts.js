angular.module('Posts' , [])
 .factory('Posts' , function($http , $q , BaseUrl){
 	 var posts;
 	 var favourites;
 	 var set = function (tags){
          var promise = $q.defer();

          $http({
	          method : 'POST',
	          url : BaseUrl+'/api/allPosts',
	          data : tags 
	      })
	      .success(function(data){
	           posts = data;
	           promise.resolve('posts successful set');
	      })
	      .error(function(err){
	          console.log(err);
	      });

        return promise.promise;
      };

      var get = function(){
      	  return posts;
      }

      var  setFavs = function(fav_ids , bool){
      	  if(bool){
              favourites = undefined;
      	  }
      	  var promise = $q.defer();
      	  if(favourites){
               promise.resolve(favourites);
      	  }
      	  else{
      	  	$http({
	            method : 'POST',
	            url : BaseUrl+'/api/allFavourites',
	            data : fav_ids
	        })
	        .success(function(data){
                 favourites = data;
                 if(bool){
                     promise.resolve('favourites set in posts');
                 }
                 else{
                 	promise.resolve(favourites);
                 }
	            
	        })
	        .error(function(err){
	            promise.reject(err);
	        });
      	  }
	        return promise.promise;
      };

       var postArticle = function(post){
         var promise = $q.defer();
         $http({
              method : 'POST',
              url : BaseUrl+'/api/posts/1',
              data : post 
         })
         .success(function(data){
             posts.push(data);
             promise.resolve(data);
         })
         .error(function(err){
             promise.reject(err);
         });

         return promise.promise;
      };

      //
      var updateArticle = function(updatedPost){
           var promise = $q.defer();

           $http({
                method : 'PUT',
                url : BaseUrl+'/api/posts/'+updatedPost._id,
                data : updatedPost
           })
           .success(function(data){
              angular.forEach(posts , function(item){
                   var index = -1;
                   if(updatedPost._id == item._id){
                       index = posts.indexOf(item);
                        posts[index] = updatedPost;
                   }
                   
               });

              if(favourites){
                angular.forEach(favourites , function(item){
                     var index = -1;
                     if(updatedPost._id == item._id){
                         index = favourites.indexOf(item);
                         favourites[index] = updatedPost;
                     }
                     
                 });
              }

              promise.resolve('update successful');
              
           })
           .error(function(err){
               promise.reject(err);
           });

           return promise.promise;
      }


      //
      var deleteArticle = function(article){
           var promise = $q.defer();
           $http({
                method : 'DELETE',
                url : BaseUrl+'/api/posts/'+article._id,
                params : article 
           })
           .success(function(data){
               posts.splice(posts.indexOf(article) , 1);
               if(favourites){
                 favourites.splice(favourites.indexOf(article) , 1);  
               }
                            
               promise.resolve(data);
           })
           .error(function(err){
               promise.reject(err);
           });

           return promise.promise;
      };
     
     var previewArticle = function(post_id , auth){
          auth = auth == undefined || auth == 0 ? 1 : 0;
          var promise = $q.defer();
          $http({
                method : 'GET',
                url : BaseUrl+'/api/posts/'+post_id,
                params :  {'p':auth}
           })
           .success(function(data){             
               promise.resolve(data);
           })
           .error(function(err){
               alert(angular.toJson(err));
           });
          return promise.promise;
     }

     var getAuthorPosts = function(username){
         var promise = $q.defer();
          promise.resolve('Lets get getAuthorPosts yeah');

          //@TODO get authors posts from route api/authorPosts/:username  from the rest api
         return promise.promise;
     };

   	return {
          set : set,
          get : get,
          setFavs: setFavs,
          post : postArticle,
          update: updateArticle,
          deleteArticle : deleteArticle,
          previewArticle: previewArticle,
          getAuthorPosts : getAuthorPosts
   	}
 });