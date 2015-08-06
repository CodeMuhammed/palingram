angular.module('palingram' , ['ngResource' , 'ui.router' , 'Auth'])

// cors configurations to enable consuming the rest api
.config(function($httpProvider){
   $httpProvider.defaults.useXDomain = true;
   $httpProvider.defaults.withCredentials = true;
   delete $httpProvider.defaults.headers.common['X-Requested-With'];
})

//state configuration and routing setup
.config(function($stateProvider , $urlRouterProvider){
 //Logged out state
  $stateProvider
     .state('out' , { 
         url : '/out',
         abstract : true,
         templateUrl : 'views/out.tpl.html'
     })
     .state('out.homepage' , {
         url : '/homepage',
         templateUrl : 'views/out.homepage.tpl.html',
         controller  : 'homepageController',
         data :{}
     })
     .state('out.signup' , {
         url : '/signup',
         templateUrl : 'views/out.signup.tpl.html',
         controller  : 'signupController',
         data :{}
     })
     .state('out.signin' , {
         url : '/signin',
         templateUrl : 'views/out.signin.tpl.html',
         controller  : 'signinController',
         data :{}
     })
     .state('out.transition' , {
         url : '/transition',
         templateUrl : 'views/out.transition.tpl.html',
         controller  : 'transitionController',
         data :{}
     });
    
    //Logged in state
    $stateProvider
     .state('in' , { 
         url : '/in',
         abstract : true,
         templateUrl : 'views/in.tpl.html',
         controller  : 'inController'
     })
     .state('in.posts' , {
         url : '/posts',
         views : {
            'inSpace@in' : {
               templateUrl : 'views/in.posts.tpl.html',
               controller  : 'postsController'
            }
         },
         data :{}
         
     })
     .state('in.posts.post' , {
         url : '/:id',
         views : {
            'inSpace@in' : {
               templateUrl : 'views/in.post.tpl.html',
               controller  : 'postController'
            }
         },
         data :{}  
     })
    .state('in.profile' , {
         url : '/profile',
         views : {
            'inSpace@in' : {
               templateUrl : 'views/in.profile.tpl.html',
               controller  : 'profileController'
            }
         },
         data :{}  
     })
    .state('in.editor' , {
         url : '/editor',
         views : {
            'inSpace@in' : {
               templateUrl : 'views/in.editor.tpl.html',
               controller  : 'editorController'
            }
         },
         data :{}  
     });
    
     $urlRouterProvider.otherwise('/out/homepage');
}); 
