angular.module('piveo')
   .constant('baseUrl' , 'http://localhost:3000')
   //.constant('baseUrl' , 'https://purslr.herokuapp.com')
   .factory('Posts' , function($q , baseUrl , $http){
      //@TODO make this service fully functional and tied to the server
   	  var query = function (tags){
        var promise = $q.defer();
        //alert('get content called');
        $http({
            method : 'POST',
            url : baseUrl+'/api/allPosts',
            data : tags 
        })
        .success(function(data){
             promise.resolve(data);
        })
        .error(function(err){
            promise.reject(err);
        });

   	  	return promise.promise;
   	  };

      var postArticle = function(post){
         var promise = $q.defer();
         $http({
              method : 'POST',
              url : baseUrl+'/api/posts/123',
              data : post 
         })
         .success(function(data){
             promise.resolve(data);
         })
         .error(function(err){
             promise.reject(err);
         });

         return promise.promise;
      };
       
       //
      var deletePost = function(post){
           var promise = $q.defer();
           $http({
                method : 'DELETE',
                url : baseUrl+'/api/posts/'+post._id,
                params : post 
           })
           .success(function(data){
               promise.resolve(data);
           })
           .error(function(err){
               promise.reject(err);
           });

           return promise.promise;
      };

      //public xposed interface 
   	  return {
          query : query,
          postArticle  : postArticle,
          deletePost : deletePost
   	  }

   })
   
   .factory('User' , function($q , $http ,$state, baseUrl){

       
   	    var tags = ['general'];
   	    var user;

        //A utility function to reser the service preferences wheen user loggs out
        function reset(){
            tags = ['general'];
            user=undefined;
        }

        function activeUser(){
            return user;
        }

         function Tags(){
            return tags; 
        }

         function signedIn(){
              return user ? true : false;
        }

/***************************FUNCTIONS WITH XHR ***************************************/
/*************************************************************************************/
        function signin(userCredential){

            var promise = $q.defer();
            $http({
               method : 'POST',
               url : baseUrl+'/auth/signin', 
               data : userCredential 
            })
            .success(function(data){
                user = data; 
                getTags(user.tags_id).then(function(result){
                     tags = result;
                     promise.resolve('all done signed in correctly');
                });
            })

            .error(function(err){
                promise.reject(err);
            });
            return promise.promise;
        }

        function signup(newUser){
            var promise = $q.defer();
            newUser.favourites = [];
            newUser.tags_id ='';
            
            $http({
               method : 'POST',
               url : baseUrl+'/auth/signup',
               data : newUser 
            })
            .success(function(data){
                alert(angular.toJson(data));
                user = data;
                getTags(user.tags_id).then(function(){
                     promise.resolve('all done signed up correctly');
                });
            })

            .error(function(err){
                promise.reject(err);
            });

            return promise.promise;
        }

        function logout(){

            var promise = $q.defer();
            $http({
               method: 'GET',
               url : baseUrl+'/auth/logout'
            })
            .success(function(status){
                reset(); 
                promise.resolve(status);
            });

            return promise.promise;
        }

         function getTags(tags_id){
            var promise = $q.defer();
            $http({
               method: 'POST',
               url : baseUrl+'/api/tags',
               data : {id : tags_id }
            })

            .success(function(data){
                promise.resolve(data);
            })

            .error(function(err){
                 alert(err);
            });

            return promise.promise;
        }
        
        function updateTags(tags){
            var promise = $q.defer();
            var query = {};
            query.id = user.tags_id;
            query.tags = tags;
            $http({
               method : 'PUT',
               url : baseUrl+'/api/tags',
               data: query
            })
            .success(function(result){
                promise.resolve(result);
            })
            .error(function(err){
                promise.reject(err);
            });
            
            return promise.promise;
        }
       
        //This updates the user object on the server
        function updateUser(updatedUser){
           var promise = $q.defer();
             
            $http({
               method : 'PUT',
               url : baseUrl+'/api/user',
               data: updatedUser
            })
            .success(function(result){
                user = updatedUser;
                promise.resolve(result);
            })
            .error(function(err){
                promise.reject(err);
            });
            
            return promise.promise;
        }

        //Initial signin with credentials from cookies
        signin(); 
        /*************************************************************************************/
        /*************************************************************************************/
        

        return  {
           activeUser : activeUser,
           updateUser : updateUser,
           tags : Tags,
           updateTags : updateTags,
           signedIn : signedIn,
           signin : signin,
           signup : signup,
           logout : logout
        }
   });