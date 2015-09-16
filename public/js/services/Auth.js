angular.module('Auth' , ['User', 'Tags' , 'Posts'])
    //.constant('BaseUrl' , 'http://localhost:3000')
    .constant('BaseUrl' , 'https://palingramapi.herokuapp.com')
    .constant('googl_key' , 'AIzaSyBFgXT17fbaEr-POzSmbLzdzMGlKEoUH44')
   .factory('Auth' , function($http , $q , Posts , Tags , User , BaseUrl , googl_key){
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
                promise.resolve('sign up successful');
            })

            .error(function(err){
               promise.reject('invalid credentials');
            });

            return promise.promise;
         }   

         function signin(userCredential){
            console.log(userCredential);
            var promise = $q.defer();
            $http({
               method : 'POST',
               url : BaseUrl+'/auth/signin', 
               data : userCredential 
            })
            .success(function(data){
                console.log(data);
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

        function sendEmail (action , data) {
            var query;
            switch(action) {
                case 'emailVerification' : {
                    query = {
                        action : action ,
                        firstname : User.get().firstname,
                        lastname : User.get().lastname,
                        username : User.get().username
                    };
                    break;
                }
                case 'writerApplication' : {
                    query = data;
                    query.username = User.get().username;
                    query.action   = action
                    break;
                }
                default : {
                    break;
                }
            };
            
            if(query){
                var promise = $q.defer();
                $http({
                    method : 'POST',
                    url : BaseUrl+'/api/sendEmail',
                    data : query
                })
                .success(function(status){
                    promise.resolve(status);
                })
                .error(function(err){
                     promise.reject(err);
                });
                return promise.promise;
            }
            else {
                alert('invalid options');
            } 
        }

        function isAuth(){
            return isSignedIn;
        };

       return {
             signup : signup,
             signin : signin,
             logout : logout,
             sendEmail : sendEmail,
             isAuth : isAuth
         };
   });