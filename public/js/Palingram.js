angular.module('palingram' , ['ngResource' , 'ui.router' , 'Auth' , 'User' , 'Posts' , 'Tags' , 'Comments'])

// cors configurations to enable consuming the rest api
.config(function($httpProvider){
   $httpProvider.defaults.useXDomain = true;
   $httpProvider.defaults.withCredentials = true;
   delete $httpProvider.defaults.headers.common['X-Requested-With'];
})

//state configuration and routing setup
.config(function($stateProvider , $urlRouterProvider){
  $stateProvider
     .state('out' , { 
         url : '/out',
         abstract : true,
         templateUrl : 'views/out.tpl.html'
     })
     .state('out.homepage' , {
         url : '/homepage',
         templateUrl : 'views/out.homepage.tpl.html',
         controller  : 'homepageController'
     })
     .state('out.signup' , {
         url : '/signup',
         templateUrl : 'views/out.signup.tpl.html',
         controller  : 'signupController'
     })
     .state('out.signin' , {
         url : '/signin',
         templateUrl : 'views/out.signin.tpl.html',
         controller  : 'signinController'
     })
     .state('out.transition' , {
         url : '/transition',
         templateUrl : 'views/out.transition.tpl.html',
         controller  : 'transitionController'
     });
    
    $stateProvider
     .state('in' , { 
         url : '/in',
         abstract : true,
         templateUrl : 'views/in.tpl.html'
     })
     .state('in.test' , {
         url : '/test',
         templateUrl : 'views/in.test.tpl.html',
         controller  : 'inController'
     });
     
    
     $urlRouterProvider.otherwise('/out/homepage');
}); 
