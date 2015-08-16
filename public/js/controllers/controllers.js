angular.module('palingram')
  .controller('homepageController' , function($scope , Auth){
       $scope.hello = 'out homepage controller says hello';
   })

   .controller('previewController' , function($scope , $state , Posts , Comments , Auth){
       Posts.previewArticle($state.params.post_id , Auth.isAuth()).then(function(data){
           $scope.post = data;
            Comments.get($scope.post.comments_id).then(function(comments){
                 console.log(comments);
                 $scope.comments = comments;
            });

            $scope.auth = Auth.isAuth() == false || Auth.isAuth() == undefined ? false : true;

       });

       $scope.back = function(toState){
          $state.go(toState);
       };
   })

   .controller('signupController' , function($scope , $state , Auth){
       $scope.signup = function(newUser){
            newUser.favourites = [];
            newUser.image = 'img/img.png';
            newUser.pageViews = 0;
            newUser.lastViewed = '';
            newUser.bio = 'Write about your self here';
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
       
     Tags.queryAll().then(function(data){
           $scope.tags = data;
           $scope.selected = [];

           $scope.proceed = function(){
               if($scope.selected.length==0){
                  $scope.selected = ['general'];
               }
                

               Tags.set($scope.selected).then(function(status){
                   alert(status);
                    Posts.set(Tags.get()).then(function(status){
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
   .controller('inController' , function($scope ,$rootScope ,  $state , Auth , Tags , User){  
        if(! Auth.isAuth()){
             $state.go('out.signin');
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
                   "coverImage" : 'img/cover.jpg',
                   "image" : 'img/img.png',
                   "description":"A brief description of what the post is about",
                   "body":"Lorem ipsun is the very best way if addressinnng werer ftroo mrtilllik just premore juwwer awasfff ghill jilll eueuhhfidn jdnggd",
                   "comments_id":"",
                   "tags":Tags.get()
                 }; 
               }
           });

   })

   .controller('postsController' , function($scope ,$rootScope , $state , Tags  ,Posts , User, Auth){
       if(! Auth.isAuth()){
           $state.go('out.signin');
       }  

       $scope.posts = Posts.get();
       $scope.tags = Tags.get();
       $scope.sidebar = '';

       $scope.viewPost = function(post){
            Tags.update(post.tags , User.get().tags_id).then(function(result){
                console.log(result);
                $state.current.data.post = post;
                $state.go('in.posts.post' , {id : post._id});
            });
       };

       $scope.clearTags = function(){
            $scope.tags = ['general'];
            Posts.set($scope.tags).then(
                function(result){
                    $scope.posts = Posts.get();
                },
                function(err){
                    alert(err);
                }
            );
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
           else{
              alert('tag not valid either the limit of ten tags has reached or the tag already exists');
           }
       };

       $scope.deleteTag = function(tag){
          var permitted = false;

          var refresh = function(){
            Posts.set($scope.tags).then(
                  function(result){
                      $scope.posts = Posts.get();
                      if($scope.posts.length==0){
                         Tags.set(['general']);
                         $scope.tags = Tags.get();
                         refresh();
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

   .controller('postController' , function($scope , $state ,$filter , Tags , Posts , User , Auth , Comments){
        if(Auth.isAuth()){
            $scope.post = $state.current.data.post;
            $scope.owned = User.get().username==$scope.post.username;

            $scope.posts = Posts.get().slice(0 , 5);
            Posts.getAuthorPosts($scope.post.username).then(function(result){
               // $scope.authorPosts = result;
               alert(result);
            });
            

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
                 
                 if(permitted){
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
                  $state.go('in.editor');
              };

              $scope.delete = function(){
                  Posts.deleteArticle($scope.post).then(function(status){
                      alert(status);
                      $state.go('in.posts');
                  });
              };

               $scope.$on('$stateChangeStart'  , function(event , toState  ,toParams  ,fromState , fromParams){
                  toState.data = angular.copy($scope.post);
               });
            
            //comment handler 
            $scope.postComment = function(){

                if($scope.comment.body.trim()  == ''){
                    alert('you have to type your comment into the box first');
                }
                else{
                    $scope.comment.date = Date.now();
                    Comments.postComment(angular.copy($scope.comment)).then(function(status){
                       alert(status);
                       $scope.comment.body  = '';
                    } , function(err){
                         alert(err);
                    });
                }
            }; 
             
            $scope.deleteComment = function(comment){
                var isMyPost = User.get().username == comment.username;
                if(isMyPost){
                     Comments.deleteComment(comment).then(function(status){
                        alert(status);
                    });
                }
                else {
                  alert('not yourr post');
                }
            };

            $scope.vote  = function(comment , count){

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

                 if(permitted){
                   Comments.updateComment(temp).then(function(status){
                       alert(status);
                       var index = $scope.comments.indexOf(comment);
                       $scope.comments[index] = temp;
                   });
                 } else{
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
            $scope.link = 'www.palingram.com/#!/out/preview/'+$scope.post._id;
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
           $scope.shareText = function(network){
                switch(network){
                     case 'twitter': {
                         return  '@palingram'+' '+$scope.post.description.substr(0 , 100)+' '+$scope.link;
                     }
                     case 'facebook': {
                         return $scope.post.description+' '+$scope.link;
                     }
                     default:{
                        break;
                     }
                 }
           };

           $scope.viewPost = function(post){
                Tags.update(post.tags , User.get().tags_id).then(function(result){
                    console.log(result);
                    $scope.nextView = post;
                    $state.go('in.posts.post' , {id : post._id});
                });
           };

           $scope.$on('$stateChangeStart'  , function(event , toState  ,toParams  ,fromState , fromParams){
               toState.data.post = $scope.nextView;
           });
       }
   })

   .controller('profileController' , function($scope ,$state, User  ,Auth){
       if(! Auth.isAuth()){
             $state.go('out.signin');
        }  
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
   
   .controller('editorController' , function($scope ,$rootScope ,$state , User , Posts){

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
           if(option == 'new'){
             Posts.post($scope.post).then(function(data){
                alert('success');
                User.get().favourites.push(data._id);
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