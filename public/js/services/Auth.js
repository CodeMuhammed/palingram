angular.module('Auth' , ['User', 'Tags' , 'Posts'])
   //.constant('BaseUrl' , 'http://localhost:3000')
   .constant('BaseUrl' , 'https://palingramapi.herokuapp.com')
   .factory('Auth' , function($http , $q ,$state ,$rootScope ,  Posts , Tags , User , BaseUrl){
         var isSignedIn;

         function signup(newUser){
            var promise = $q.defer();         
            $http({
               method : 'POST',
               url : BaseUrl+'/auth/signup',
               data : newUser 
            })
            .success(function(data){
                User.set(data);
                isSignedIn = true;
                promise.resolve('sign up done');
            })

            .error(function(err){
                alert('error in auth signup');
            });

            return promise.promise;
         }

         function signin(userCredential){
            var promise = $q.defer();
            $http({
               method : 'POST',
               url : BaseUrl+'/auth/signin', 
               data : userCredential 
            })
            .success(function(data){
                User.set(data);
                isSignedIn = true;
                promise.resolve('sign in done');
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
               url : BaseUrl+'/auth/logout'
            })
            .success(function(status){
                User.unset();
                isSignedIn = false;
                promise.resolve(status);
            })
            .error(function(err){
                 alert('error in auth logout');
            });
            return promise.promise;
        }

        function isAuth(){
            return isSignedIn;
        };

       return {
             signup : signup,
             signin : signin,
             logout : logout,
             isAuth : isAuth
         };
   });