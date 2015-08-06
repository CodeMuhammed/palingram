angular.module('Posts' , ['Comments'])
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
	          alert('set error in Posts');
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
              url : BaseUrl+'/api/posts/123',
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
      var updateArticle = function(post){
           var promise = $q.defer();

           $http({
                method : 'PUT',
                url : BaseUrl+'/api/posts/123',
                data : post 
           })
           .success(function(data){
               promise.resolve('post updated successfully');
           })
           .error(function(err){
               promise.reject(err);
           });

           return promise.promise;
      }

   	return {
          set : set,
          get : get,
          setFavs: setFavs,
          post : postArticle,
          update: updateArticle
   	}
 });