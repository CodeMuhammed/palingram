angular.module('palingram')
  .controller('homepageController' , function($scope){
       $scope.hello = 'out homepage controller says hello';
   })

   .controller('signupController' , function($scope){
       $scope.signup = function(newUser){
            alert(angular.toJson(newUser));
       }
   })

   .controller('signinController' , function($scope){
       $scope.hello = 'out signin controller says hello';
   })

   .controller('transitionController' , function($scope){
       $scope.hello = 'out transition controller says hello';
   })


   //Logged in state
   .controller('inController' , function($scope){
       $scope.hello = 'in test controller says hello';
   });