var app = angular.module('palingram' , ['fileUpload' , 'ngResource' , 'ui.router']);

// cors configurations to enable consuming the rest api
  app.config(function($httpProvider){
     $httpProvider.defaults.useXDomain = true;
     $httpProvider.defaults.withCredentials = true;
     delete $httpProvider.defaults.headers.common['X-Requested-With'];
  });  

//state configuration and routing
  app.config(function($stateProvider , $urlRouterProvider){
      $stateProvider
         .state('articles' , { 
             abstract : true,
             url : '/articles',
             templateUrl : 'views/articles.tpl.html',
             controller : 'mainCtrl',
             data : {}
         })
        
         .state('articles.topic' , {
              url : '/:id',
               views :  {
              '@articles' : {
                  templateUrl : 'views/topic.tpl.html',
                  controller : 'topicsCtrl'
              } 
             },
             data : {} 
         })
 
         .state('articles.new' , {
              url : '/new/1', 
              views :  {
              '@articles' : {
                  templateUrl : 'views/editor.tpl.html',
                  controller : 'editorCtrl'
              }
             },
             data : {}
         }) 
         .state('articles.new.edit' , {
              url : '/edit', 
              views :  {
              '@articles' : {
                  templateUrl : 'views/post.tpl.html',
                  controller : 'postCtrl'
              }
             },
             data : {}
         })
        .state('articles.auth' , {
             url: '/auth/1',
             views : {
                '@articles' : {
                  templateUrl : 'views/auth.tpl.html',
                  controller : 'authCtrl'
                }
             }
         });

         $urlRouterProvider.otherwise('/articles/auth/1');
  }); 

 
 app.directive('sidebar' , function(){
    return {
          templateUrl : 'views/sidebar.tpl.html'
    }
 });

  app.directive('mobile' , function(){
      return {
            templateUrl : 'views/mobile.tpl.html'
      }
   });

   app.directive('desktop' , function(){
      return {
            templateUrl : 'views/desktop.tpl.html'
      }
   });

   app.controller('authCtrl' , function($scope , $state , User){
      //initial view to display based ont the authentication status

      $scope.auth = User.signedIn();
      $scope.user = User.activeUser();

      if($scope.auth){ 
         $scope.view = 'profile';
      } else {
         $scope.view = 'signin';
      }
     

      $scope.changeView = function(view){
         $scope.view = view;
      }

      //signing in user 
      $scope.signin = function(user){
          User.signin(user).then(
            function(status){
                $state.go('articles.topic' , {id : 1});
            } ,
            function(err){
                $scope.err = err;
            }
         );
      };

      //signing Up a new user
      $scope.signup = function(newUser){
          User.signup(newUser).then(
            function(status){
                $state.go('articles.topic' , {id : 1});
            } ,
            function(err){
                $scope.err = err;
            }
         );
      };

      //Logging out a user 
      $scope.logout = function(){
          User.logout().then(
            function(status){
                $scope.view = 'signin';
            } ,
            function(err){
                alert('something went wrong while doing logout');
            }
         );
      };

   });

 //
 app.controller('mainCtrl' , function($scope ,$rootScope, $state , User , Posts){

    $scope.search = false;
    
    $scope.toggleSearch = function(){
        $scope.search =! $scope.search ;
    }

    $scope.activatePosts = function(type){
        Posts.type(type);
        $rootScope.$broadcast('changeType' , {});
        $state.go('articles.topic');
    }

    $scope.searchForTopic = function(searchText){
         $rootScope.$broadcast('searchText' , {query : searchText.split(' ')});
    };

 });
 
 //
 app.controller('topicsCtrl' , function($scope , $state  ,Posts ,  User){
      if(! User.signedIn()){
          $state.go('articles.auth');
      }else{
         $scope.tags = User.tags(); 
         displayPost();
      }
      

      //
      $scope.$on('changeType' , function(e , a){
          displayPost();
      });

      //
      $scope.$on('searchText' , function(e , a){
            if(angular.isArray(a.query) && a.query[0]){
                User.reset( a.query);
                $scope.tags = a.query;
                Posts.refresh($scope.tags).then(
                    function(result){
                         displayPost();
                    }
                );
            }
            else {
              alert('enter a valid search string');
           }
      });

      //
      $scope.$on('signedIn' , function(){
          $scope.tags = User.tags();
          displayPost();
      });

      //This displays the post based on the params id when user is browsing
      //a specific post or a deffault post
      function displayPost(){
          Posts.query($scope.tags).then(
              function(result){
                  $scope.posts = result;
                  next();
              } ,
              function(err){
                 console.log(err);
              } 
          ); 
          
          function next(){
            if($state.params.id.length<10){
               $scope.active = $scope.posts[0];
             } else {
                 angular.forEach($scope.posts , function(post){
                      post._id == $state.params.id  ? $scope.active=post : '';
                 }); 
             }

             // Check if this post has beeen favourited by the user
             if(! User.signedIn()){
                $state.go('articles.auth');
             }  
          }
 
          $scope.toggleFavourite = function(){
               if(User.signedIn()){
                  var index = User.activeUser().favourites.indexOf($scope.active._id);
                  
                  if(index>=0){
                      User.activeUser().favourites.splice(index , 1);
                  }
                  else {
                      User.activeUser().favourites.push($scope.active._id);
                  }

                  User.updateUser(User.activeUser()).then(function(status){
                       Posts.refresh().then(
                            function(result){
                                 displayPost();
                            }
                       );
                      
                  }, function(err){
                      console.log(err);
                  });
                } else {
                    alert('Sign in to customize your experience');
                    $state.go('articles.auth');
                }
           };

           $scope.isFavourite = function(id){
               if(User.activeUser().favourites.indexOf(id)>=0){
                  return true;
               } else {
                  return false;
               }
           }
      }

       $scope.clearTags = function(){
            $scope.tags = [];
       };

       $scope.addTag = function(newTag){
           if(newTag && $scope.tags.length < 10 && $scope.tags.indexOf(newTag) < 0){
                $scope.tags.push(newTag);
                $scope.newTag = '';

                Posts.refresh($scope.tags).then(
                    function(result){
                         displayPost();
                    }
                );
           }
       };

       $scope.deleteTag = function(tag){
          if(tag){
            var index = $scope.tags.indexOf(tag);
            $scope.tags.splice(index , 1);
            Posts.refresh($scope.tags).then(
                function(result){
                    displayPost();
                },
                function(){
                    alert('refresh not done');
                }
            );

          }
       };

       $scope.viewPost = function(post){
          if(User.signedIn()){
              User.updateTags(post.tags).then(
                function(status){
                    $state.go('articles.topic' , {id : post._id});
                },
                function(err){
                }
              );  
          } else {
               $state.current.data.post = angular.copy(post);
               $state.go('articles.topic' , {id : post._id});
          }
          
       }

       $scope.deletePost = function(post){
            Posts.deletePost(post).then(
                function(result){
                     displayPost();
                },
                function(err){
                     alert('something wwent wronng while deleting | topicsCtrl');
                }
            );
       };
       
       var postToEdit;
       $scope.editPost = function(post){
           postToEdit  =post;
           $state.go('articles.new.edit');
       };

       $scope.$on('$stateChangeStart'  , function(event , toState  ,toParams  ,fromState , fromParams){
          toState.data = postToEdit;
       });

       $scope.editbuttons = function(bool){
          $scope.showbuttons = bool;
       };

       $scope.myPost = function(post){
           return post.username == User.activeUser().username;
       }
  });
  
  //
  app.controller('editorCtrl' , function($scope , $state , User){
      if(! User.signedIn()){
          $state.go('articles.auth');
      }
      else{
    
           $scope.tags = ['general'];
           $scope.clearTags = function(){
                $scope.tags = [];
           };

           $scope.addTag = function(newTag){
               if(newTag && $scope.tags.length < 10 && $scope.tags.indexOf(newTag) < 0){
                    $scope.tags.push(newTag);
                    $scope.newTag = '';
               }
           };

           $scope.deleteTag = function(tag){
              if(tag){
                var index = $scope.tags.indexOf(tag);
                $scope.tags.splice(index , 1);
              }
           };

           $scope.newPost = function(){
               $state.go('articles.new.edit');
           };

           $scope.$on('$stateChangeStart'  , function(event , toState  ,toParams  ,fromState , fromParams){
             toState.data = {
                   "author": User.activeUser().firstname + ' '+ User.activeUser().lastname,
                   "username":User.activeUser().username,
                   "title":"This First Post Title",
                   "date": Date.now(),
                   "image" : 'img/img.png',
                   "body":"Lorem ipsun is the very best way if addressinnng werer ftroo mrtilllik just premore juwwer awasfff ghill jilll eueuhhfidn jdnggd",
                   "comments_id":"",
                   "tags":$scope.tags
                 };
           });
       }
  });
  
  app.directive('post' , function(){
     return {
      restrict:'E',
      controller : 'postCtrl',
      templateUrl: 'views/post.tpl.html',
      scope : true
    };
  });
   
  app.controller('postCtrl' , function($scope , $state , Posts , User){
       
      if(User.signedIn()){

        $scope.post = $state.current.data; 
        var option = $state.current.data.comments_id == '' ? 'new' : 'old';
        
        //this sends post to the server
        $scope.postArticle = function(post){
           if(option == 'new'){
             Posts.postArticle(post).then(function(result){
                 alert(result);
                 $state.go('articles.topic');
             }, function(err){
                 alert('something went wrong');
             });
           }
           else {
              Posts.updateArticle(post).then(function(result){
                 alert(result);
                 $state.go('articles.topic');
             }, function(err){
                 console.log(err);
             });
           }
           
        };
      } 
      else {
          //alert('Sign in to post an article');
          $state.go('articles.auth');
      }
       
   });
  