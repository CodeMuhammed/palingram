var app = angular.module('piveo' , ['fileUpload' , 'ngResource' , 'ui.router']);

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
                  controller : 'topicCtrl'
             	} 
             },
             data : {} 
         })
 
         .state('articles.new' , {
              url : '/new', 
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
         });

         $urlRouterProvider.otherwise('/articles/all');
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

   app.directive('user' , function(){
      return {
            templateUrl : 'views/user.tpl.html',
            controller : 'userController'
      }
   });

   app.controller('userController' , function($scope){
        $scope.hello = 'userprofsiginouff';
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

	  $scope.gotoState = function(state){
           $state.go(state);
	  }

    $scope.signedIn = User.signedIn();
 });
 

 app.controller('topicCtrl' , function($scope , $state  ,Posts ,  User){

      //sidemenu controls
       $scope.user = User.activeUser;
       $scope.tags = User.tags();

       $scope.clearTags = function(){
            $scope.tags = [];
       };

       $scope.addTag = function(newTag){
           if(newTag && $scope.tags.length < 10){
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

       //all the posts partaining to the given tags selection
       $scope.posts = Posts.query($scope.tags);
       
       //To handle default routed to vs user routed to
       if(angular.isDefined($state.current.data.post)){
          $scope.active = $state.current.data.post;
       } else {
           $scope.active=  $scope.posts[0];
       }

      
       $scope.viewPost = function(post){
          $state.current.data.post = angular.copy(post);
          $state.go('articles.topic' , {id : post._id});
       }

       $scope.$on('$stateChangeStart', function(event, toState , toParams , fromState , fromParams){
          if(angular.isDefined(toState.data) && angular.isDefined(fromState.data)){
             toState.data.post = fromState.data.post;
          }
       });
 });
  
  app.controller('editorCtrl' , function($scope){
	  $scope.hello = 'Editor';
  });
  
  app.directive('post' , function(){
	   return {
			restrict:'E',
			controller : 'postCtrl',
			templateUrl: 'views/post.tpl.html',
			scope : true
		};
   });
   
   app.controller('postCtrl' , function($scope){
	    $scope.hello = 'post';
   });
  