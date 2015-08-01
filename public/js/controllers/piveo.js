var app = angular.module('piveo' , ['fileUpload' , 'ngResource' , 'ui.router']);

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

 app.controller('mainCtrl' , function($scope , $state , User){
	  $scope.sidebar = '';
	  $scope.dir = 'left';
	  $scope.search = false;
    
	  $scope.toggleSidebar = function(dir){
	  	  $scope.sidebar === '' ? $scope.sidebar='active' : $scope.sidebar='';
	  	  $scope.dir = dir;
	  };

	  $scope.toggleSearch = function(){
	  	  $scope.search =! $scope.search ;
	  }
 });
 

 app.controller('topicsCtrl' , function($scope , $state  ,Posts ,  User){
     
      displayPost();

      //This displays the post based on the params id when user is browsing
      //a specific post or a deffault post
      function displayPost(){

          $scope.tags = User.tags();
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
            if($state.params.id == '1'){
               $scope.active = $scope.posts[0];
             } else {
                 angular.forEach($scope.posts , function(post){
                      post._id == $state.params.id  ? $scope.active=post : '';
                 }); 
             }

             // Checck if this post has beeen favourited by the user
             if(User.signedIn()){
                var user = User.activeUser(); 
                $scope.isFavourite = ! user.favourites.indexOf($scope.active._id);
             }
          }
         
 
          $scope.toggleFavourite = function(){
               if(User.signedIn()){

                 $scope.isFavourite = !$scope.isFavourite;

                  //now update the user service so that the change is persisted
                  if($scope.isFavourite){
                      user.favourites.push($scope.active._id);
                  }
                  else {
                     var index = user.favourites.indexOf($scope.active._id);
                     user.favourites.splice(index);
                  }

                  User.updateUser(user).then(function(status){
                      alert(status);
                  }, function(err){
                      console.log(err);
                  });
                } else {
                    alert('Sign in to customize your experience');
                }
           };
           //for the mobile experience
           $scope.toggleSidebar('right');
      }

       $scope.clearTags = function(){
            $scope.tags = [];
       };

       $scope.addTag = function(newTag){
           if(newTag && $scope.tags.length < 10 && $scope.tags.indexOf(newTag) < 0){
                $scope.tags.push(newTag);
                $scope.newTag = '';
                $scope.posts = Posts.query($scope.tags);
           }
       };

       $scope.deleteTag = function(tag){
          if(tag){
            var index = $scope.tags.indexOf(tag);
            $scope.tags.splice(index , 1);
            $scope.posts = Posts.query($scope.tags);
          }
       };

       $scope.viewPost = function(post){
          if(User.signedIn()){
              User.updateTags(post.tags).then(
                function(status){
                    $state.current.data.post = angular.copy(post);
                    $state.go('articles.topic' , {id : post._id});
                },
                function(err){
                   alert(angular.toJson(err));
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
                     alert(result);
                     displayPost();
                },
                function(err){
                     alert('something wwent wronng while deleting | topicsCtrl');
                }
            );
       };


       $scope.editbuttons = function(bool){
          $scope.showbuttons = bool;
       }
 });
  
  app.controller('editorCtrl' , function($scope , $state){
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

       $scope.editPost = function(){
           $state.current.data.tags = angular.copy($scope.tags);
           $state.go('articles.new.edit');
       };

       $scope.$on('$stateChangeStart'  , function(event , toState  ,toParams  ,fromState , fromParams){
           toState.data.tags = $scope.tags;
       });
  });
  
  app.directive('post' , function(){
	   return {
			restrict:'E',
			controller : 'postCtrl',
			templateUrl: 'views/post.tpl.html',
			scope : true
		};
   });
   
   app.controller('postCtrl' , function($scope , $state , User , Posts){
       //DO ADD A WRITE A POST A PICTURE URL AND  POST
	    // alert(angular.toJson($state.current.data.tags)); 
      if(User.signedIn()){

         var user = User.activeUser();
         $scope.post = {
               "author": user.firstname + ' '+ user.lastname,
               "username":user.username,
               "title":"This First Post Title",
               "date": Date.now(),
               "image" : 'img/img.png',
               "body":"Lorem ipsun is the very best way if addressinnng werer ftroo mrtilllik just premore juwwer awasfff ghill jilll eueuhhfidn jdnggd",
               "comments_id":"",
               "tags":['general']
             };

        $scope.post.tags = $state.current.data.tags; 
        
        //this sends post to the server
        $scope.postArticle = function(post){
           Posts.postArticle(post).then(function(result){
               alert(result);
           }, function(err){
               alert('something went wrong');
           });
        };
      } 
      else {
          //alert('Sign in to post an article');
          $state.go('articles.auth');
      }
       
   });
  