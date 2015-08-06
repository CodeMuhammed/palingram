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
         
         return {
             set : set,
             unset:unset,
             get : get,
             update : update
         };
   });