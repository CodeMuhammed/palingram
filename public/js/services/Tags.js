angular.module('Tags' , [])
   .factory('Tags' , function($http , $q , BaseUrl){

          var tags;
        
          function set(tags_id){
            var promise = $q.defer();

            if(angular.isArray(tags_id)){
                 tags = tags_id;
                 promise.resolve('tags set ok');
            }
            else {
                $http({
                     method: 'POST',
                     url : BaseUrl+'/api/tags',
                     data : {
                       id : tags_id
                     }
                  })

                  .success(function(data){
                      tags  = data;
                      promise.resolve('tags gotten ok');
                  })

                  .error(function(err){
                    alert('error in tags get');
                  });
            }
    
            return promise.promise;
	        }
          
          function get(){
          	 return tags;
          }

          function update(tags , tags_id){
            var promise = $q.defer();
            var query = {};
            query.id =   tags_id;
            query.tags = tags;
            $http({
               method : 'PUT',
               url : BaseUrl+'/api/tags',
               data: query
            })
            .success(function(result){
                promise.resolve(result);
            })
            .error(function(err){
                promise.reject(err);
            });
            
            return promise.promise;
          }
          
          function queryAll(){
              var promise = $q.defer();
              $http({
                 method : 'GET',
                 url : BaseUrl+'/api/tags'
              })

              .success(function(data){
                  promise.resolve(data);
              })
              
              .error(function(err){
                  console.log(err);
              });
              return promise.promise;
          }

          //
          function getCategories() {
              return [
                   'technology',
                   'startup',
                   'programming',
                   'analytics',
                   'health',
                   'general topics',
                   'food',
                   'lifestyle',
                   'science',
                   'facts',
                   'travel',
                   'biography'
             ];
          }

          //Public interface
          return {
        	 set : set,
        	 get : get,
           queryAll : queryAll,
           update : update,
           getCategories : getCategories
          }
    });