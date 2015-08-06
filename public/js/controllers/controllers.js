angular.module('palingram')
  .controller('homepageController' , function($scope , Auth){
       $scope.hello = 'out homepage controller says hello';
   })

   .controller('signupController' , function($scope , $state , Auth){
       $scope.signup = function(newUser){
            Auth.signup(newUser).then(function(){
                $state.go('out.transition');
            });
       }
   })

   .controller('signinController' , function($scope , $state , Auth , Posts , Tags , User){
       $scope.signin = function(credentials){
           Auth.signin(credentials).then(function(status){
                Tags.set(User.get().tags_id).then(function(status){
                      Posts.set(Tags.get()).then(function(status){
                          $state.go('in.posts');
                     });
                });
            });
       }
   })

   .controller('transitionController' , function($scope , $state , Auth , Posts , Tags , User){
       

       $scope.proceed = function(){

           if($scope.selected.length==0){
              $scope.selected = $scope.tags[0];
           }

           Tags.set($scope.selected).then(function(status){
                Posts.set(Tags.get()).then(function(status){
                    $state.go('in.posts');
               });
            });
       }

       Tags.queryAll().then(function(data){
           $scope.tags = data;
           $scope.selected = [];
       });

       $scope.select = function(tag){
           
           if($scope.selected.indexOf(tag) < 0){
                $scope.selected.push(tag);
           }
           else{
              $scope.selected.splice($scope.selected.indexOf(tag) , 1);
           };
       }

       $scope.isSelected = function(tag){
           return $scope.selected.indexOf(tag) >= 0;
       }
   })


   //Logged in state
   .controller('inController' , function($scope ,$rootScope ,  $state , Auth){       
        $scope.search = false; 
        $scope.toggleSearch = function(){
             $scope.search =! $scope.search ;
        }

        $scope.searchForTopic = function(searchText){
            var query = searchText.split(' ');
            newArr = [];
            angular.forEach(query , function(item){
                item = item.trim();
                if(! item==''){
                     newArr.push(item);
                }
            });

            $rootScope.$broadcast('searchText' , {query : newArr});
        };

        var Nav;
        $scope.goto = function(nav){
            Nav = nav;
            if(nav=='favourites'){
                if($state.is('in.posts')){
                   $rootScope.$broadcast('favourites' , {});
                }
                else {
                   $state.go('in.posts');
                }
               
            }
            else if(nav=='posts'){
                if($state.is('in.posts')){
                   $rootScope.$broadcast('posts' , {});
                }
                else {
                  $state.go('in.posts');
                }
            } 
           
        };
   })

   .controller('postsController' , function($scope , $state , Tags  ,Posts , User){
       $scope.posts = Posts.get();
       $scope.viewPost = function(post){
            $state.current.data.post = post;
            $state.go('in.posts.post' , {id : post._id});
       }

        $scope.$on('$stateChangeStart'  , function(event , toState  ,toParams  ,fromState , fromParams){
          toState.data.post = fromState.data.post;
       });

       $scope.tags = Tags.get();

       $scope.clearTags = function(){
            $scope.tags = [];
       };

       $scope.addTag = function(newTag){
           if(newTag && $scope.tags.length < 10 && $scope.tags.indexOf(newTag) < 0){
                $scope.tags.push(newTag);
                $scope.newTag = '';

                Posts.set($scope.tags).then(
                    function(result){
                        $scope.posts = Posts.get();
                    }
                );
           }
       };

       $scope.deleteTag = function(tag){
          if(tag){
            var index = $scope.tags.indexOf(tag);
            $scope.tags.splice(index , 1);
            Posts.set($scope.tags).then(
                function(result){
                    $scope.posts = Posts.get();
                },
                function(err){
                    alert(err);
                }
            );

          }
       };

       //
      $scope.$on('searchText' , function(e , a){
            if(angular.isArray(a.query) && a.query[0]){
                $scope.tags = a.query;
                alert($scope.tags);
                Posts.set($scope.tags).then(
                    function(result){
                        $scope.posts = Posts.get();
                    }
                );
            }
            else {
              alert('enter a valid search string');
           }
    });

    //
    $scope.$on('favourites' ,  function(e , a){
        Posts.setFavs(User.get().favourites).then(function(data){
             $scope.posts = data;
        });
    });
    $scope.$on('posts' ,  function(e , a){
        $scope.posts = Posts.get();
    });

   })

   .controller('postController' , function($scope , $state , Tags , Posts , User , Auth){
          if(Auth.isAuth()){
                $scope.post = $state.current.data.post;
                $scope.isFavourite = function(){ 
                   return User.get().favourites.indexOf($scope.post._id)>=0;
                }

                $scope.toggleFavourite = function(){
                     var index = User.get().favourites.indexOf($scope.post._id);
                     
                     if(index>=0){
                         User.get().favourites.splice(index , 1);
                     }
                     else {
                         User.get().favourites.push($scope.post._id);
                     }
                     
                     User.update(User.get()).then(function(result){
                         Posts.setFavs(User.get().favourites , true).then(function(result){
                         });
                     } , function(err){
                         console.log(err);
                     });
                     
                }
              
          }
          else{
            $state.go('out.signin');
          }
      
   })
   .controller('profileController' , function($scope){
        $scope.hello ='This profile controller';
   })
   .controller('editorController' , function($scope){
        $scope.hello ='This editor controller';
   });