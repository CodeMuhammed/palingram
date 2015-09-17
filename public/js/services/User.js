angular.module('User' , [])
   .factory('User' , function($http , $q , BaseUrl){
   	     var user;

         function set(data){
              user = data;
         };

         function unset(){
              user=undefined;
         };

         function get(){
         	return user;
         }

         function update(updatedUser){
           var promise = $q.defer();
            $http({
               method : 'PUT',
               url : BaseUrl+'/api/user',
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

         function newsletter(email){
            var promise = $q.defer();
              if(angular.isDefined(email)){
                  $http({
                     method : 'GET',
                     url : BaseUrl+'/api/newsletter/'+email
                  })
                  .success(function(status){
                      promise.resolve(status);
                  })
                  .error(function(err){
                      promise.reject(err);
                  });
            }
            else{
               promise.reject('invalid email format');
            }
            return promise.promise;
         }

         return {
             set : set,
             unset:unset,
             get : get,
             update : update,
             newsletter : newsletter
         };
   });