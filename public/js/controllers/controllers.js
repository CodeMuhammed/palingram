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
   .controller('inController' , function($scope ,$rootScope ,  $state , Auth , Tags , User){       
        $scope.search = false; 
        $scope.nav = 'posts';
        
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
        
        

        $scope.toggle = function(view){
            $rootScope.$broadcast('toggle:'+ $scope.nav , {});
        }

        $scope.goto = function(nav){
            $scope.nav = nav;
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
            else if(nav=='editor'){
                $state.go('in.editor');
            }
            else if(nav=='profile'){
                $state.go('in.profile');
            } 
        };

        $scope.active = function(item){
            return $scope.nav==item;
        }


         $scope.$on('$stateChangeStart'  , function(event , toState  ,toParams  ,fromState , fromParams){
             if($scope.nav == 'editor'){
                toState.data = {
                   "author": User.get().firstname + ' '+ User.get().lastname,
                   "username":User.get().username,
                   "title":"This First Post Title",
                   "date": Date.now(),
                   "image" : 'img/img.png',
                   "description":"A brief description of what the post is about",
                   "body":"Lorem ipsun is the very best way if addressinnng werer ftroo mrtilllik just premore juwwer awasfff ghill jilll eueuhhfidn jdnggd",
                   "comments_id":"",
                   "tags":Tags.get()
                 }; 
               }
           });

   })

   .controller('postsController' , function($scope , $state , Tags  ,Posts , User){
       $scope.posts = Posts.get();
       $scope.tags = Tags.get();
       $scope.sidebar = '';

       $scope.viewPost = function(post){
            Tags.update(post.tags , User.get().tags_id).then(function(result){
                $state.current.data.post = post;
                $state.go('in.posts.post' , {id : post._id});
            });
       };

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
      
       var toggleSidebar = function(){
           $scope.sidebar == '' ? $scope.sidebar = 'active' : $scope.sidebar = '';
       }
      //
      $scope.$on('$stateChangeStart'  , function(event , toState  ,toParams  ,fromState , fromParams){
          toState.data.post = fromState.data.post;
      });

       //
       $scope.$on('searchText' , function(e , a){
          if(angular.isArray(a.query) && a.query[0]){
              $scope.tags = a.query;
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
          $scope.tags = Tags.get();
       });

       $scope.$on('toggle:posts' ,  function(e , a){
          toggleSidebar();
       });

   })

   .controller('postController' , function($scope , $state , Tags , Posts , User , Auth){
          if(Auth.isAuth()){
            $scope.post = $state.current.data.post;
            $scope.owned = User.get().username==$scope.post.username;
            
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
                 
            };

             $scope.edit = function(){
                  $state.go('in.editor');
              };

              $scope.delete = function(){
                  Posts.deleteArticle($scope.post).then(function(status){
                      $state.go('in.posts');
                  });
              };

               $scope.$on('$stateChangeStart'  , function(event , toState  ,toParams  ,fromState , fromParams){
                  toState.data = angular.copy($scope.post);
               });
                      
          }
          else{
            $state.go('out.signin');
          }
      
   })
   .controller('profileController' , function($scope ,$state, User  ,Auth){
        $scope.user =User.get();

        //Logging out a user 
        $scope.logout = function(){
            Auth.logout().then(
              function(status){
                  $state.go('out.homepage');
              } ,
              function(err){
                  alert('something went wrong while doing logout');
              }
           );
        };
        
   })
   .controller('editorController' , function($scope ,$state , User , Posts){

         $scope.post = $state.current.data;

         var option;
         function init(){
            $scope.tags = $scope.post.tags;
            option = $scope.post.comments_id == '' ? 'new' : 'old';
         }
         
         init();

         $scope.clearTags = function(){
              $scope.tags = [];
         };

         $scope.addTag = function(newTag){
             if(newTag && $scope.tags.length < 7 && $scope.tags.indexOf(newTag) < 0){
                  $scope.tags.push(newTag);
                  $scope.newTag = '';
             }
         };

         $scope.deleteTag = function(tag){
            if(tag){
              var index = $scope.tags.indexOf(tag);
              $scope.tags.splice(index , 1);
            }
         };

         $scope.edit = false;
         $scope.cancelEdit = function(){
            $state.go('in.posts');
         };

         $scope.next = function(){
              $scope.edit = true;
         }

        $scope.back = function(){
            $scope.edit = false;   
        }
        
         //this sends post to the server
        $scope.save = function(){
           if(option == 'new'){
             Posts.post($scope.post).then(function(data){
                  alert('success');
                  $scope.post = data;
                  User.get().favourites.push(data._id);
                  init();
             }, function(err){
                 alert('something went wrong');
             });
           }
           else {
              $scope.post.date = Date.now();
              Posts.update($scope.post).then(function(result){
                 alert(result);
             }, function(err){
                 console.log(err);
             });
           } 
        };


   });