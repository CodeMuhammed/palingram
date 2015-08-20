angular.module('palingram')
  .controller('loaderController' , function($rootScope , $scope  , $timeout){
       $scope.loading = false;
      
       $rootScope.$on('loading:start' , function(e , a){
            $scope.loading = true;
       });
       
        $rootScope.$on('loading:end' , function(e , a){
            $timeout(function() {
                $scope.loading = false;
            }, 2000);
       });

  })

  .controller('homepageController' , function($scope , $rootScope , $state , Auth , Tags , Posts , User){
       $scope.hello = 'out homepage controller says hello';
       $scope.guestLogin = function(){
           $rootScope.$broadcast('loading:start' , {});
           Auth.signin({"username":"palingram@gmail.com" , "password":"0000"}).then(function(status){
                Tags.set(User.get().tags_id).then(function(status){
                      Posts.set(Tags.get()).then(function(status){
                          $rootScope.$broadcast('loading:end' , {});
                          $state.go('in.posts');
                     });
                });
            });
       };
   })

   .controller('previewController' , function($scope , $rootScope ,  $state , Posts , Comments , Auth){
        //implement auto login for when page refreshes
        $rootScope.$broadcast('loading:start' , {});
        Auth.signin().then(function(status){
            previewStart();
        } , function(err){
            previewStart();
        });
       function previewStart(){
        $scope.auth = Auth.isAuth() == false || Auth.isAuth() == undefined ? false : true;
         Posts.previewArticle($state.params.post_id , Auth.isAuth()).then(function(data){
             $scope.post = data;
              Comments.get($scope.post.comments_id).then(function(comments){
                   $rootScope.$broadcast('loading:end' , {});
                   console.log(comments);
                   $scope.comments = comments;
              });
         });

         $scope.back = function(toState){
            $state.go(toState);
         };
       }
   })

   .controller('signupController' , function($scope , $rootScope , $state , Auth){
       $scope.signup = function(newUser){
            $rootScope.$broadcast('loading:start' , {});
            newUser.favourites = [];
            newUser.image = 'img/img.png';
            newUser.pageViews = 0;
            newUser.lastViewed = '';
            newUser.bio = 'Write about your self here';
            Auth.signup(newUser).then(function(){
                $rootScope.$broadcast('loading:end' , {});
                $state.go('out.transition');
            });
       }
   })

   .controller('signinController' , function($scope , $rootScope , $state , Auth , Posts , Tags , User){
       $scope.signin = function(credentials){
          $rootScope.$broadcast('loading:start' , {});
           Auth.signin(credentials).then(function(status){
                Tags.set(User.get().tags_id).then(function(status){
                      Posts.set(Tags.get()).then(function(status){
                          $rootScope.$broadcast('loading:end' , {});
                          $state.go('in.posts');
                     });
                });
            });
       }
   })

   .controller('transitionController' , function($scope , $rootScope , $state , Auth , Posts , Tags , User){
       
     Tags.queryAll().then(function(data){
           $scope.tags = data;
           $scope.selected = [];

           $scope.proceed = function(){
               $rootScope.$broadcast('loading:start' , {});
               if($scope.selected.length==0){
                  $scope.selected = ['general'];
               }
                

               Tags.set($scope.selected).then(function(status){
                   alert(status);
                    Posts.set(Tags.get()).then(function(status){
                        $rootScope.$broadcast('loading:end' , {});
                        $state.go('in.posts');
                   });
                });
            }

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
   .controller('inController' , function($scope ,$rootScope ,  $state , Auth , Tags , User , Posts){  
         //implement auto login for when page refreshes
         if(! Auth.isAuth()){
            $rootScope.$broadcast('loading:start' , {});
            Auth.signin().then(function(status){
                Tags.set(User.get().tags_id).then(function(stats){
                      Posts.set(Tags.get()).then(function(status){
                          $rootScope.$broadcast('loading:end' , {"action":"signedIn"});
                     });
                });
            } , function(err){
                  Auth.signin({"username":"palingram@gmail.com" , "password":"0000"}).then(function(status){
                      Tags.set(User.get().tags_id).then(function(status){
                            Posts.set(Tags.get()).then(function(status){
                                $rootScope.$broadcast('loading:end' , {"action":"signedIn"});
                           });
                      });
                  });
            });
         }
       
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
                $state.go('in.editor' , {"id":"1"});
            }

            else if(nav=='profile'){
                $state.go('in.profile');
            } 
        };

        

        $scope.active = function(item){
            return $scope.nav==item;
        }

   })

   .controller('postsController' , function($scope ,$rootScope , $state , Tags  ,Posts , User, Auth){
         
         //
         $scope.$on('loading:end' , function(e , a){
             if(a.action == 'signedIn'){
                  next();
             }
         });

         $scope.$on('favourites' ,  function(e , a){
            $rootScope.$broadcast('loading:start' , {});
            Posts.setFavs(User.get().favourites).then(function(data){
                 $rootScope.$broadcast('loading:end' , {});
                 $scope.posts = data;
            });
         });

         $scope.$on('posts' ,  function(e , a){
            $rootScope.$broadcast('loading:start' , {});
            $scope.posts = Posts.get();
            $scope.tags = Tags.get();
            $rootScope.$broadcast('loading:end' , {});
         });

         $scope.$on('toggle:posts' ,  function(e , a){
            toggleSidebar();
         });
         var toggleSidebar = function(){
               $scope.sidebar == '' ? $scope.sidebar = 'active' : $scope.sidebar = '';
         }

        if(Auth.isAuth() ||(User.get() && User.get().username == 'guest')){
             next();
        }
        
        function next(){
           $scope.posts = Posts.get();
           $scope.tags = Tags.get();
           $scope.sidebar = '';
           $scope.user = User.get();

           $scope.viewPost = function(post){
                $rootScope.$broadcast('loading:start' , {});
                Tags.update(post.tags , User.get().tags_id).then(function(result){
                    console.log(result);
                    $state.current.data.post = post;
                    $rootScope.$broadcast('loading:end' , {});
                    $state.go('in.posts.post' , {id : post._id});
                });
           };

           $scope.clearTags = function(){
                $rootScope.$broadcast('loading:start' , {});
                $scope.tags = ['general'];
                Posts.set($scope.tags).then(
                    function(result){
                        $rootScope.$broadcast('loading:end' , {});
                        $scope.posts = Posts.get();
                    },
                    function(err){
                        alert(err);
                    }
                );
           };

           $scope.addTag = function(newTag){
               if(newTag && $scope.tags.length < 10 && $scope.tags.indexOf(newTag) < 0){
                    $rootScope.$broadcast('loading:start' , {});
                    $scope.tags.push(newTag);
                    $scope.newTag = '';

                    Posts.set($scope.tags).then(
                        function(result){
                            $rootScope.$broadcast('loading:end' , {});
                            $scope.posts = Posts.get();
                        }
                    );
               }
               else{
                  alert('tag not valid either the limit of ten tags has reached or the tag already exists');
               }
           };

           $scope.deleteTag = function(tag){
              var permitted = false;

              var refresh = function(){
                $rootScope.$broadcast('loading:start' , {});
                Posts.set($scope.tags).then(
                      function(result){
                          $scope.posts = Posts.get();
                          if($scope.posts.length==0){
                             Tags.set(['general']);
                             $scope.tags = Tags.get();
                             refresh();
                          }
                          else {
                            $rootScope.$broadcast('loading:end' , {});
                          }
                      },
                      function(err){
                          alert(err);
                      }
                  );
              };

              if(tag){
                  if($scope.tags.length > 1){
                    $scope.tags.splice($scope.tags.indexOf(tag) , 1);
                    refresh();
                  } 
                  else{
                      if(tag == 'general'){
                          alert('already showing all posts');
                      }
                      else{
                         $scope.tags[0] = 'general';
                         refresh();
                      }
                  }
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
              $rootScope.$broadcast('loading:start' , {});
              if(angular.isArray(a.query) && a.query[0]){
                  $scope.tags = a.query;
                  Posts.set($scope.tags).then(
                      function(result){
                          $rootScope.$broadcast('loading:end' , {});
                          $scope.posts = Posts.get();
                      }
                  );
              }
              else {
                alert('enter a valid search string');
              }
           });

        } //next function ends here
   })

   .controller('postController' , function($scope , $rootScope ,$stateParams ,  $state ,$filter , Tags , Posts , User , Auth , Comments){
        //
        $scope.$on('loading:end' , function(e , a){
             if(a.action == 'signedIn'){
                 init();
             }
        });
        
        if($state.current.data.post == undefined){
            init();
        }

        else if(Auth.isAuth() ||(User.get() && User.get().username == 'guest')){
             init();
        }
        
        function init(){
            Posts.previewArticle($state.params.id , Auth.isAuth()).then(function(data){
               $state.current.data.post = data;
               next();
            });
        }

        function next(){
            $rootScope.$broadcast('loading:start' , {});
            $scope.post = $state.current.data.post;
            $scope.owned = User.get().username==$scope.post.username;

            $scope.posts = Posts.get().slice(0 , 5);
            Posts.getAuthorPosts($scope.post.username).then(function(result){
               $scope.authorPosts = result;
               $rootScope.$broadcast('loading:end' , {});
            });
            
            $rootScope.$broadcast('loading:start' , {});
            $scope.comment = {
                body : '',
                by : User.get().firstname+' '+User.get().lastname,
                image : User.get().image,
                username: User.get().username,
                date : '',
                voters : {
                   up : [],
                   down:[]
                }
            };

            Comments.get($scope.post.comments_id).then(function(comments){
                 $scope.comments = comments;
                 $rootScope.$broadcast('loading:end' , {});
            });

            //favourite handler
            $scope.isFavourite = function(){ 
               return User.get().favourites.indexOf($scope.post._id)>=0;
            }

            $scope.toggleFavourite = function(){
                 var index = User.get().favourites.indexOf($scope.post._id);
                 var permitted = User.get().username != $scope.post.username;

                 if(index>=0 && permitted){
                     User.get().favourites.splice(index , 1);
                 }
                 else if(index<0 && permitted){
                     User.get().favourites.push($scope.post._id);
                 }
                 
                 if(permitted && User.get().firstname != 'guest'){
                    User.update(User.get()).then(function(result){
                         Posts.setFavs(User.get().favourites , true).then(function(result){
                         });
                     } , function(err){
                         console.log(err);
                     });
                 } 
                 else{
                    alert('you cannot unfavourite your post');
                 }                 
             };

             //
            $scope.back = function(){
                 $state.go('in.posts');
            }

             //edit handler
             $scope.edit = function(){
                  $state.go('in.editor' ,  {"id":$scope.post._id});
              };

              $scope.delete = function(){
                  $rootScope.$broadcast('loading:start' , {});
                  Posts.deleteArticle($scope.post).then(function(status){
                      $rootScope.$broadcast('loading:end' , {});
                      $state.go('in.posts');
                  });
              };

            //comment handler 
            $scope.postComment = function(){ 
               if(User.get().firstname == 'guest'){
                    alert('Sign up to comment on articles');
               }
               else{
                  $rootScope.$broadcast('loading:start' , {});
                  if($scope.comment.body.trim()  == ''){
                      alert('you have to type your comment into the box first');
                  }
                  else{
                      $scope.comment.date = Date.now();
                      Comments.postComment(angular.copy($scope.comment)).then(function(status){
                         $rootScope.$broadcast('loading:end' , {});
                         $scope.comment.body  = '';
                      } , function(err){
                           alert(err);
                      });
                  }
                }
            }; 
             
            $scope.deleteComment = function(comment){
                $rootScope.$broadcast('loading:start' , {});
                var isMyPost = User.get().username == comment.username;
                if(isMyPost){
                     Comments.deleteComment(comment).then(function(status){
                        $rootScope.$broadcast('loading:end' , {});
                    });
                }
                else {
                  alert('not yourr post');
                }
            };

            $scope.vote  = function(comment , count){
                 $rootScope.$broadcast('loading:start' , {});
                 var permitted = false;
                 var temp = angular.copy(comment);

                 var status = $scope.voteStatus(comment);

                 if(count == 1 && !status[0]){
                     temp.voters.up.push(User.get().username);
                     permitted = true;
                 } 
                 else if(count == -1 && !status[0]){
                      temp.voters.down.push(User.get().username); 
                      permitted = true;
                 }
                 else if(count == 1 && status[0]){
                     if(count == status[1]){
                        alert('already voted up');
                        permitted = false;
                     }
                     else{
                         var index = temp.voters.down.indexOf(User.get().username);
                         temp.voters.down.splice(index , 1);
                         temp.voters.up.push(User.get().username);
                         permitted = true;
                     }
                 }
                 else if(count == -1 && status[0]){
                     if(count == status[1]){
                        alert('already voted down');
                        permitted = false;
                     }
                     else{
                         var index = temp.voters.up.indexOf(User.get().username);
                         temp.voters.up.splice(index , 1);
                         temp.voters.down.push(User.get().username);
                         permitted = true;
                     }
                 }
                 
                 if(permitted && User.get().firstname != 'guest'){
                   Comments.updateComment(temp).then(function(status){
                       $rootScope.$broadcast('loading:end' , {});
                       var index = $scope.comments.indexOf(comment);
                       $scope.comments[index] = temp;
                   });
                 } else{
                    $rootScope.$broadcast('loading:end' , {});
                    alert('not allowed');
                 }
                 
            };

            $scope.voteStatus = function(comment){
                var up = comment.voters.up.indexOf(User.get().username) >=0;
                var down = comment.voters.down.indexOf(User.get().username) >=0;

                if(!up && !down){
                    return [false , false];
                }
                else {
                   return [
                      true,
                      up?'1':'-1'
                   ]
                }
            };

            $scope.myComment = function(comment){
                return User.get().username == comment.username;
            };

            $scope.getVoteClass = function(comment , dir){
                 var temp = $scope.voteStatus(comment);
                 if(temp[1] == dir && dir==1){
                    return 'up-vote';
                 }
                 else if(temp[1] == dir && dir==-1){
                      return 'down-vote';
                 }
                 else{
                    return '';
                 }
                
            }

            //controls sorting
            $scope.sortOptions = ['Most Popular' , 'Best Voted' , 'Most Recent'];
            $scope.sortMenu = false;
            $scope.sortCriteria = 'Most Popular';

            $scope.toggleSortMenu = function(){
                $scope.sortMenu = !$scope.sortMenu;
            }

            $scope.sort = function(criteria){
                $scope.toggleSortMenu();
                $scope.sortCriteria = criteria;
            };

            //This takes care of socialshare button
            $scope.link = 'www.palingram.com/#!/in/posts/'+$scope.post._id;
            $scope.share = function(socialtype){
                 switch(socialtype){
                     case 'link': {
                         $scope.linkshare = true;
                         break;
                     }
                     default:{
                        break;
                     }
                 }
            };

           //This computes and return the text to be shared
           $scope.shareText = function(){
                return $scope.post.description.substr(0 , 100)+' '+$scope.link;
           };

           $scope.viewPost = function(post){
                Tags.update(post.tags , User.get().tags_id).then(function(result){
                    $state.go('in.posts.post' , {id : post._id});
                });
           };
       }
   })

   .controller('profileController' , function($scope , $rootScope , $state, User  ,Auth){
         //
        $scope.$on('loading:end' , function(e , a){
             if(a.action == 'signedIn'){
                next();
             }
        });

        if(Auth.isAuth() ||(User.get() && User.get().username == 'guest')){
             next();
        }

        function next(){ 
            $scope.user =User.get();

            //Logging out a user 
            $scope.logout = function(){
                $rootScope.$broadcast('loading:start' , {});
                Auth.logout().then(
                  function(status){
                      $rootScope.$broadcast('loading:end' , {});
                      $state.go('out.homepage');
                  } ,
                  function(err){
                      alert('something went wrong while doing logout');
                  }
               );
            };

            $scope.save = function(){
               if(User.get().firstname == 'guest'){
                   alert('log in to save your preferences');
               }
               else{
                 $rootScope.$broadcast('loading:start' , {});
                 User.update($scope.user).then(function(result){
                      $rootScope.$broadcast('loading:end' , {});
                 });
               }  
            }
         }   
   })
   
   .controller('editorController' , function($scope ,$rootScope ,$state , $stateParams , User , Posts , Auth , Tags){ 
         function initData(){
             if($stateParams.id == '1' && Auth.isAuth()){
               $state.current.data =  {
                   "author": User.get().firstname + ' '+ User.get().lastname,
                   "username":User.get().username,
                   "title":"This First Post Title",
                   "date": Date.now(),
                   "coverImage" : 'img/cover.jpg',
                   "image" : User.get().image,
                   "description":"A brief description of what the post is about",
                   "body":"Lorem ipsun is the very best way if addressinnng werer ftroo mrtilllik just premore juwwer awasfff ghill jilll eueuhhfidn jdnggd",
                   "comments_id":"",
                   "tags":Tags.get()
               }; 
               next();
            }
            else if($stateParams.id.length == '24'){
                Posts.previewArticle($state.params.id , Auth.isAuth()).then(function(data){
                   $state.current.data = data;
                   if(Auth.isAuth() ||(User.get() && User.get().username == 'guest')){
                         next();
                    }
               });
            }
        }  initData();

        //
        $scope.$on('loading:end' , function(e , a){
             if(a.action == 'signedIn'){
                 initData();
             }
        });

        function next(){
             $scope.post = $state.current.data;
             $scope.tags = $scope.post.tags;
             var option = $scope.post.comments_id == '' ? 'new' : 'old';

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
              if(User.get().firstname == 'guest'){
                  alert('Log in to save your articles');
              }
              else{
                $rootScope.$broadcast('loading:start' , {});
                 $scope.post.bio = User.get().bio;
                 $scope.post.image = User.get().image;
                 if(option == 'new'){
                   $scope.post.views = 0;
                   Posts.post($scope.post).then(function(data){
                      $rootScope.$broadcast('loading:end' , {});
                      User.get().favourites.push(data._id);
                   }, function(err){
                       alert('something went wrong');
                   });
                 }
                 else {
                    $scope.post.date = Date.now();
                    Posts.update($scope.post).then(function(result){
                      $rootScope.$broadcast('loading:end' , {});
                   }, function(err){
                       console.log(err);
                   });
                 } 
            }
          };
        }
   });