angular.module('palingram')
   .constant('baseUrl' , 'http://localhost:3000')
   //.constant('baseUrl' , 'https://purslr.herokuapp.com')
   .factory('Posts' , function($q , baseUrl , $http , User){
      //@TODO make this service fully functional and tied to the server
      var Posts;
      var Favourites;
      var PostType = 'all';

      var query = function (tags){
          var promise = $q.defer();
          if(PostType == 'all'){
             doAll();
          } 

          else if(PostType == 'favourites'){
            if(User.signedIn()){
               doFavourites();
            }
            else {
              $state.go('articles.auth');
            }
            
          }

          function doAll(){
            if(Posts){
                promise.resolve(Posts);
            }
            else {
                 $http({
                      method : 'POST',
                      url : baseUrl+'/api/allPosts',
                      data : tags 
                  })
                  .success(function(data){
                       Posts = data;
                       promise.resolve(data);
                  })
                  .error(function(err){
                      promise.reject(err);
                  });
            }
          }

          function doFavourites(){
              if(Favourites){
                  promise.resolve(Favourites);
              }
              else {
                   $http({
                        method : 'POST',
                        url : baseUrl+'/api/allFavourites',
                        data : User.activeUser().favourites
                    })
                    .success(function(data){
                         Favourites = data;
                         promise.resolve(data);
                    })
                    .error(function(err){
                        promise.reject(err);
                    });
              }
          }

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
             Posts = undefined;
             Favourites  = undefined;
             User.activeUser().favourites.push(data._id);
             promise.resolve('post inserted successfully');
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
                url : baseUrl+'/api/posts/123',
                data : post 
           })
           .success(function(data){
               Posts = undefined;
               Favourites  = undefined;
               promise.resolve('post updated successfully');
           })
           .error(function(err){
               promise.reject(err);
           });

           return promise.promise;
      }
       
       //
      var deletePost = function(post){
           var promise = $q.defer();
           $http({
                method : 'DELETE',
                url : baseUrl+'/api/posts/'+post._id,
                params : post 
           })
           .success(function(data){
               Posts.splice(Posts.indexOf(post) , 1);
               if(Favourites){
                  Favourites.splice(Favourites.indexOf(post) , 1);
               }
               
               promise.resolve(data);
           })
           .error(function(err){
               promise.reject(err);
           });

           return promise.promise;
      };

      //
      var type = function(postType){
          PostType = postType;
      };

      //
      var refresh = function(tags){
         var promise = $q.defer();

         Posts=undefined; 
         Favourites=undefined;
         query(tags ? tags : User.tags()).then(function(data){  
              if(PostType =='all'){
                   Posts = data;
                   promise.resolve();
              }
              else{
                 Favourites = data;
                 promise.resolve();
              }  
          },function(err){
               alert('refresh failed');
          }); 

          return promise.promise;
      };

      //public xposed interface 
      return {

          query : query,
          postArticle  : postArticle,
          updateArticle : updateArticle,
          deletePost : deletePost,
          type : type,
          refresh : refresh
      }

   })


   /*************************************************************************************
   *************************************************************************************/
   .factory('User' , function($q , $http ,$state, $rootScope , baseUrl){
       
        var tags;
        var user;

        //A utility function to reset the service preferences wheen user loggs out
        function reset(newTags){
            if(newTags){
                tags = newTags;
            }
            else {
               tags= undefined;
               user=undefined;
            }  
        }

        function activeUser(){
            return user;
        }

        function Tags(){
            if(signedIn()){
                return tags;
            }
            else{
                return ['general'];
            }
        }

        function signedIn(){
              return user ? true : false;
        }

/***************************FUNCTIONS WITH XHR***************************************/
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
           console.log(updatedUser);
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
        signin().then(function(){
            $rootScope.$broadcast('signedIn' , {});
        }); 
        /***************************END OF SERVICE IMPLEMENTATION**************************/
        

        return  {
           /*This returns the current signed in user */
           activeUser : activeUser,

           /*This  synchronizes any changes made by the user to thhe server*/
           updateUser : updateUser,

           /*When a user is signed in, the top ten tags or topics based on the users
             past exxperiences is used in customizing the initial contents shown to the user
           */
           tags : Tags,

           /*When ever a user clicks on a post, the tags attached to the post is synced on the server
            to help customize the user experience*/
           updateTags : updateTags,

           /*When a post is added or  edited,  the service is refereshed to sync the changges on the 
             server and on the client*/
           reset : reset,

           /*This returns aa bool indicating weather the  user is signed in or not*/
           signedIn : signedIn,

           /*This initialtes the sign in dance given the users credentials*/
           signin : signin,

           /*This takes care of signing up an new user*/
           signup : signup,

           /**/
           logout : logout
        }
   });