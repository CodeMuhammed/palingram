var adSenseTpl1 = '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2725471983332791" data-ad-slot="8313861460" data-ad-format="auto"></ins>';
var adSenseTpl2 = '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2725471983332791" data-ad-slot="3744061064" data-ad-format="auto"></ins>';
var adSenseTpl3 = '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-2725471983332791" data-ad-slot="5220794266" data-ad-format="auto"></ins>';

angular.module('palingram' , ['ngResource' ,'mgcrea.ngStrap' , 'ngSanitize','720kb.socialshare' ,'angular-medium-editor' , 'ui.router' , 'Auth' , 'Comments'])

//Google analytics configuration
.factory('myGoogleAnalytics', [
    '$rootScope', '$window', '$location', 
    function ($rootScope, $window, $location) {

      var myGoogleAnalytics = {};

      /**
       * Set the page to the current location path
       * and then send a pageview to log path change.
       */
      myGoogleAnalytics.sendPageview = function() {
        if ($window.ga) {
          $window.ga('set', 'page', $location.path());
          $window.ga('send', 'pageview');
        } 
      }

      // subscribe to events
      $rootScope.$on('$stateChangeSuccess', myGoogleAnalytics.sendPageview);

      return myGoogleAnalytics;
    }
  ])

  // inject self
  .run([
    'myGoogleAnalytics' , '$window', 
    function(myGoogleAnalytics , $window) {
       $window.ad_init = false;
    }
  ])

// cors configurations to enable consuming the rest api
.config([
    '$httpProvider' , 
    function($httpProvider){
       $httpProvider.defaults.useXDomain = true;
       $httpProvider.defaults.withCredentials = true;
       delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
])

//state configuration and routing setup
.config([
    '$stateProvider' , '$urlRouterProvider'  , '$locationProvider',
    function($stateProvider , $urlRouterProvider  , $locationProvider){
          //enabling HTML5 mode
          $locationProvider.html5Mode(false).hashPrefix('!');

         //Logged out state
          $stateProvider
             .state('out' , { 
                 url : '/out',
                 abstract : true,
                 templateUrl : 'views/out.tpl.html'
             })

             .state('out.tradr' , {
                 url : '/tradr',
                 templateUrl : 'views/gamblr.tpl.html',
                 controller  : 'gamblrCtrl'
             })

             .state('out.auth' , {
                 url : '/auth',
                 templateUrl : 'views/out.auth.tpl.html',
                 controller  : 'authController',
                 data :{}
             })
             .state('out.writer' , {
                 url : '/writer',
                 templateUrl : 'views/out.writer.tpl.html',
                 controller  : 'writerController',
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
                 url : '/editor/:id',
                 views : {
                    'inSpace@in' : {
                       templateUrl : 'views/in.editor.tpl.html',
                       controller  : 'editorController'
                    }
                 },
                 data :{}  
             });
            
             $urlRouterProvider.otherwise('/in/posts');
        }
])

 .directive('googleAdsenseone', function($window, $compile) {

        return {
            restrict: 'A',
            transclude: true,
            template: adSenseTpl1,
            replace: false,
            link: function postLink(scope, element, iAttrs) {
                    element.html("");
                    element.append(angular.element($compile(adSenseTpl1)(scope)));
                    if (!$window.adsbygoogle) {
                        $window.adsbygoogle = [];
                    }
                    $window.adsbygoogle.push({});
            }
        };
    })
 .directive('googleAdsensetwo', function($window, $compile) {

        return {
            restrict: 'A',
            transclude: true,
            template: adSenseTpl2,
            replace: false,
            link: function postLink(scope, element, iAttrs) {
                    element.html("");
                    element.append(angular.element($compile(adSenseTpl2)(scope)));
                    if (!$window.adsbygoogle) {
                        $window.adsbygoogle = [];
                    }
                    $window.adsbygoogle.push({});
            }
        };
    })
 .directive('googleAdsensethree', function($window, $compile) {

        return {
            restrict: 'A',
            transclude: true,
            template: adSenseTpl3,
            replace: false,
            link: function postLink(scope, element, iAttrs) {
                    element.html("");
                    element.append(angular.element($compile(adSenseTpl3)(scope)));
                    if (!$window.adsbygoogle) {
                        $window.adsbygoogle = [];
                    }
                    $window.adsbygoogle.push({});
            }
        };
    });