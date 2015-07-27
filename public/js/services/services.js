angular.module('piveo')
   .constant('baseUrl' , 'http://localhost:3000')
   .factory('Posts' , function($q , baseUrl , $http){
      //@TODO make this service fully functional and tied to the server
   	  var query = function (tags){
   	  	return  [
   	  	   {
   	  	   	 "_id":"12344",
   	  	   	 "author":"muhammed ali",
   	  	   	 "title":"This First Post Title",
   	  	   	 "date": Date.now(),
   	  	   	 "image" : 'img/img.png',
   	  	   	 "body":"Lorem ipsun is the very best wayy if addressinnng werer ftroo mrtilllik just premore juwwer awasfff ghill jilll eueuhhfidn jdnggd",
   	  	   	 "comments_id":"234523",
   	  	   	 "tags":['general']
   	  	   },
   	  	   {
   	  	   	 "_id":"12355",
   	  	   	 "author":"Isa ali",
   	  	   	 "title":"This second Post Title",
   	  	   	 "date": Date.now(),
   	  	   	 "image" : 'img/img.png',
   	  	   	 "body":"Lorem ipsun is the very best wayy if addressinnng werer ftroo mrtilllik just premore juwwer awasfff ghill jilll eueuhhfidn jdnggd",
   	  	   	 "comments_id":"234524",
   	  	   	 "tags":['startup']
   	  	   },
           {
             "_id":"12377",
             "author":"maryam ali",
             "title":"This is a Post Title",
             "date": Date.now(),
             "image" : 'img/img.png',
             "body":"Lorem ipsun is the very best wayy if addressinnng werer ftroo mrtilllik just premore juwwer awasfff ghill jilll eueuhhfidn jdnggd",
             "comments_id":"234524",
             "tags":[' bitcoin']
           },
           {
             "_id":"12395",
             "author":"rukkaya ali",
             "title":"This another Post Title",
             "date": Date.now(),
             "image" : 'img/img.png',
             "body":"Lorem ipsun is the very best wayy if addressinnng werer ftroo mrtilllik just premore juwwer awasfff ghill jilll eueuhhfidn jdnggd",
             "comments_id":"234524",
             "tags":['medicine']
           },
   	  	   {
   	  	   	 "_id":"12366",
   	  	   	 "author":"Brymo ali",
   	  	   	 "title":"This third Post Title",
   	  	   	 "date": Date.now(),
   	  	   	 "image" : 'img/img.png',
   	  	   	 "body":"Lorem ipsun is the very best wayy if addressinnng werer ftroo mrtilllik just premore juwwer awasfff ghill jilll eueuhhfidn jdnggd",
   	  	   	 "comments_id":"234534",
   	  	   	 "tags":['general']
   	  	   }
   	  	];
   	  }

   	  return {
          query : query
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
                $state.go('articles.topic' , {id : 1});
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