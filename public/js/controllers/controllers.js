angular.module('palingram')
  .controller('loaderController' , function($rootScope , $scope  , $timeout , $modal , User){
       $scope.loading = false;
       $rootScope.$on('loading:start' , function(e , a){
            if(a.msg){
                $scope.message = a.msg;
            }
            else {
                $scope.message = '';
            }
            $scope.loading = true;
       });
       
        $rootScope.$on('loading:end' , function(e , a){
            $scope.message = a.msg;
            $timeout(function() {
                $scope.loading = false;
            }, 5000);
       });
      
      //Testing homepage pop up
      $scope.meta = {
          title : 'palingram homepage,Nigerian bitcoin blog,technological trends in 2015/2016',
          description: 'Welcome to palingram, a place where the latest trends in technology is discussed, ranging from gadgets,Bitcoin to startups, ',
          author : 'palingram blog'
      };
      
      
      // Pre-fetch an external template populated with a custom scope
      var Modal = $modal({scope: $scope, template: 'views/modal.tpl.html', show: false});
      // Show when some event occurs (use $promise property to ensure the template has been loaded)
      $scope.showModal = function() {
        Modal.$promise.then(Modal.show);
        User.modal(true);
      };
      
      if(!User.modal()){
         $scope.showModal();
      }
    
      //Dynamically change the meta description tags when a post is loaded
      $rootScope.$on('post' , function(e , a){
            $scope.meta.title = a.title;
            $scope.meta.description = a.description;
            $scope.meta.author = a.author;
            console.log($scope.meta);
       });
  })

  .controller('writerController' , function($scope , $rootScope , $state ,$timeout , Auth , Tags , Posts , User){
       $scope.form = false;
       $scope.selected = [];
       $scope.apply = {};
       $scope.interests = [];
       $scope.checked = [false , false , false];

       $scope.categories= Tags.getCategories();
       
       
       $scope.toggleCheck = function(item , index){
              $scope.checked = [false , false , false];
              $scope.checked[index] = true;
              $scope.apply.freq = item;
       }

       $scope.checks  = [
             'Twice a day',
             'Three times a week',
             'Any time i feel like writing'
        ];

        
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

     
       $scope.submit = function(){
           $rootScope.$broadcast('loading:start' , {});

           $scope.apply.interests = $scope.selected;
           $scope.apply.username = User.get().username;
           $scope.apply.lastname = User.get().lastname;
           $scope.apply.firstname = User.get().firstname;

           Auth.sendEmail('writerApplication' , $scope.apply).then(function(status){
               $rootScope.$broadcast('loading:end' , {msg : status});
               $scope.form = false;
           }, function(err){
               $rootScope.$broadcast('loading:end' , {msg : err});
           });
       }

       $scope.applyNow = function(){
           if(Auth.isAuth() && User.get().firstname != 'guest'){
               $scope.form = true;
           }
           else {
              alert('You must be signed in to apply');
           }
       }
   })

   //This ccontroller takes care of signing up as a fresh user
   .controller('authController' , function($scope , $rootScope , $state , Auth , Tags , User , Posts){
       //Logs out of the guest account before proceeding as usual
       Auth.logout().then(
          function(status){
              console.log('logged out successfully: by visiting the auth page');
          },
          function(err){
               console.log(err);
          }
       ); 

       $scope.signup = function(newUser){
            $rootScope.$broadcast('loading:start' , {msg : 'loading please wait...'});
            newUser.favourites = [];
            newUser.image = 'img/logo_s.png';
            newUser.pageViews = 0;
            newUser.lastViewed = '';
            newUser.bio = 'Write about your self here';
            newUser.emailVerified = false;
            newUser.writer = false;
            Auth.signup(newUser).then(function(status){
                $rootScope.$broadcast('loading:end' , {msg : status});
                $state.go('out.transition');
            } , function(err){
                $rootScope.$broadcast('loading:end' , {msg : err});
            });
       }

        $scope.signin = function(credentials){
           $rootScope.$broadcast('loading:start' , {msg : 'loading .. please wait'});
           Auth.signin(credentials).then(function(status){
                Tags.set(User.get().tags_id).then(function(status1){
                      Posts.set(Tags.get()).then(function(status2){
                          $rootScope.$broadcast('loading:end' , {msg : status});
                          $state.go('in.posts');
                     });
                });
            } , function(err){
                $rootScope.$broadcast('loading:end' , {msg : 'signin error'});
            }); 
       }
       
       $scope.view = 'signup';
       $scope.switch =function(view){
            $scope.view = view;
       };
   })

   .controller('transitionController' , function($scope , $rootScope , $state , Auth , Posts , Tags , User){
     $rootScope.$broadcast('loading:start' , {msg : 'loading..'});
     Tags.queryAll().then(function(data){
           $rootScope.$broadcast('loading:end' , {msg : 'done'});
           $scope.tags = data;
           $scope.selected = [];

           $scope.proceed = function(){
               $rootScope.$broadcast('loading:start' , {msg : 'loading .. please wait'});
               $rootScope.$broadcast('loading:start' , {});
               if($scope.selected.length==0){
                  $scope.selected = ['general'];
               }
                

               Tags.set($scope.selected).then(function(status){
                    Posts.set(Tags.get()).then(function(status){
                        $rootScope.$broadcast('loading:end' , {msg : status});
                        Auth.sendEmail('emailVerification').then(function(status){
                             $rootScope.$broadcast('loading:end' , {msg : status});
                             $state.go('in.posts');
                        } , function(err){
                             $rootScope.$broadcast('loading:end' , {msg : status});
                             $state.go('in.posts');
                        });
                        
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
         if(Auth.isAuth() && User.get().firstname != 'guest'){
            next();
         }
         else {
            $rootScope.$broadcast('loading:start' , {});
            Auth.signin().then(function(status){
                Tags.set(User.get().tags_id).then(function(stats){
                      Posts.set(Tags.get()).then(function(status){
                          $rootScope.$broadcast('loading:end' , {"action":"signedIn" , msg : 'auto signed in successfully'});
                          next();
                     });
                });
            } , function(err){
                  Auth.signin({"username":"palingramblog@gmail.com" , "password":"0000"}).then(function(status){
                      Tags.set(User.get().tags_id).then(function(status){
                            Posts.set(Tags.get()).then(function(status){
                                $rootScope.$broadcast('loading:end' , {"action":"signedIn" , msg : 'logged in as guest'});
                                next();
                           });
                      });
                  });
            });
         } 

        function next(){  
            var user = User.get();
            $scope.writer = user.writer;
            user.firstname =='guest' ? $scope.admin = false : $scope.admin = true ; 
            $scope.search = false; 
            $scope.nav = 'posts';
            
            $scope.toggleSearch = function(){
                 $scope.search =! $scope.search ;
            }

           
        
            if(user.firstname !='guest' && !user.emailVerified){
               $scope.alert = {
                  "visible":true, 
                  "message":"Please verify your email by clicking the link we sent to your mailbox"
               };
            }
            else {
                console.log(user);
            }
              

            $scope.closeAlert = function(){
                $scope.alert.visible = false;
            };

            $scope.sendEmail = function(){
                 $rootScope.$broadcast('loading:start' , {});
                 Auth.sendEmail('emailVerification').then(function(status){
                     $scope.alert.visible = false;
                     $rootScope.$broadcast('loading:end' , {msg : status});
                 } , function(err){
                     $rootScope.$broadcast('loading:end' , {msg : err});
                 });
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
                       $scope.nav = 'posts';
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
        }

   })

   .controller('postsController' , function($scope ,$rootScope , $location, $anchorScroll , $state , $timeout, Tags  ,Posts , User, Auth , BaseUrl){
         
		 $scope.Awebs = [
		    {
				title:'aa',
				link:'http://adfoc.us/3472381'
			},
			{
				title:'ab',
				link:'http://adfoc.us/34723858019488'
			},
			{
				title:'ac',
				link:'http://adfoc.us/34723858019490'
			},
			{
				title:'ad',
				link:'http://adfoc.us/34723858019491'
			},
			{
				title:'ae',
				link:'http://adfoc.us/34723858019496'
			},
			{
				title:'af',
				link:'http://adfoc.us/34723858019497'
			},
			{
				title:'ag',
				link:'http://adfoc.us/34723858019498'
			},
			{
				title:'ah',
				link:'http://adfoc.us/34723858019499'
			},
			{
				title:'ai',
				link:'http://adfoc.us/34723858019500'
			},
			{
				title:'aj',
				link:'http://adfoc.us/34723858019501'
			},
			{
				title:'ak',
				link:'http://adfoc.us/34723858019502'
			},
			{
				title:'al',
				link:'http://adfoc.us/34723858019531'
			}
		 ];
         //subscribe user to mailing list
          $scope.newsletter = function(email){
               $rootScope.$broadcast('loading:start' , {});
               User.newsletter(email).then(function(status){
                    $rootScope.$broadcast('loading:end' , {msg : status});
               } , function(err){
                     $rootScope.$broadcast('loading:end' , {msg : err});
               });
          };
         //
         $scope.$on('loading:end' , function(e , a){
             if(a.action == 'signedIn'){
                  next();
             }
         });

         $scope.$on('favourites' ,  function(e , a){
            $rootScope.$broadcast('loading:start' , {});
            Posts.setFavs(User.get().favourites , false).then(function(data){
                 $rootScope.$broadcast('loading:end' , {msg : 'viewing favourites'});
                 $scope.posts = data;
            });
         });

         $scope.$on('posts' ,  function(e , a){
            $rootScope.$broadcast('loading:start' , {});
            $scope.posts = Posts.get();
            $scope.tags = Tags.get();
            $rootScope.$broadcast('loading:end' , {msg : 'viewing all posts'});
         });

         var toggleSidebar = function(){
               $scope.sidebar == '' ? $scope.sidebar = 'active' : $scope.sidebar = '';
         }

         $scope.$on('toggle:posts' ,  function(e , a){
            toggleSidebar();
         });

        

        if(Auth.isAuth() ||(User.get() && User.get().username == 'guest')){
             next();
        }
        
        function next(){
           //takes care of pagination
           $scope.viewLimit = 10;
           $scope.loadMore = function(){
              $scope.viewLimit+=3;
           };

           $scope.goUp  = function(){
                $location.hash('4');
                $timeout(function() {
                   $location.hash('0');
                }, 500);
                
           }

           //Takes care of hovering effect
           $scope.hoverIndex = -1;
           $scope.setHvrIndex =  function(index){
                 $scope.hoverIndex = index;
           }

           //taking care of side menu
           $scope.sideView = 'popular';

           $scope.view = function(view){
               return $scope.sideView == view;
           }

           $scope.changeView = function(view){
               $scope.sideView = view;
           };

           $scope.posts = Posts.get();
           $scope.tags = Tags.get();
           $scope.categories= Tags.getCategories();
           $scope.sidebar = '';
           $scope.user = User.get();

           Tags.queryAll().then(function(data){
               $scope.allTags = data;
           });
          
          //
           $scope.viewPost = function(post){
                $rootScope.$broadcast('loading:start' , {});
                Tags.update(post.tags , User.get().tags_id).then(function(result){
                    $state.current.data.post = post;
                    $rootScope.$broadcast('loading:end' , {msg : 'viewing post'});
                    $state.go('in.posts.post' , {id : post._id});
                });
           };
            
           $scope.register =  function(){
               Auth.logout().then(
                  function(status){
                      $state.go('out.auth');
                  } ,
                  function(err){
                      alert(err);
                  }
               );
           }
           
             $scope.clearTags = function(category){
              $rootScope.$broadcast('loading:start' , {});
                if(category){
                  $scope.tags = [category]
                }
                else {
                  $scope.tags = ['general'];
                }
                
                Posts.set($scope.tags).then(
                    function(result){
                        $rootScope.$broadcast('loading:end' , {msg : 'done'});
                        $scope.posts = Posts.get();
                        toggleSidebar();
                    },
                    function(err){
                        alert(err);
                    }
                );
           };

           $scope.addTag = function(newTag){
               $rootScope.$broadcast('loading:start' , {});
               if(newTag && $scope.tags.length < 5 && $scope.tags.indexOf(newTag) < 0 && $scope.allTags.indexOf(newTag) > 0){
                    $scope.tags.push(newTag);
                    $scope.newTag = '';

                    Posts.set($scope.tags).then(
                        function(result){
                            $rootScope.$broadcast('loading:end' , {msg : 'tag added'});
                            $scope.posts = Posts.get();
                            $scope.viewLimit = 10;
                        }
                    );
               }
               else{
                  $rootScope.$broadcast('loading:end' , {msg : 'tags limit reached or already added or invalid'});
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
                            $rootScope.$broadcast('loading:end' , {msg : 'tag deleted'});
                            $scope.viewLimit = 10;
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
                          $rootScope.$broadcast('loading:end' , {msg : 'already showing all posts'});
                          $scope.viewLimit = 10;
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
          
      } //next function ends here
   })

   .controller('postController' , function($scope , $rootScope ,$stateParams ,  $state ,$filter , Tags , Posts , User , Auth){
        //
        $scope.contentLoaded = false;
        $scope.$on('loading:end' , function(e , a){
             if(a.action == 'signedIn'){
                 init();
             }
        });
        
        
        if(Auth.isAuth() ||(User.get() && User.get().username == 'guest')){
             init();
        }
        
        function init(){
            Posts.previewArticle($state.params.id , User.get().username).then(function(data){
               $state.current.data.post = data;
               next();
            });
        }

        function next(){
            $rootScope.$broadcast('loading:start' , {});
            $scope.post = $state.current.data.post;
            $scope.contentLoaded = true;

            //send broadcast the post to the global scope to be used in the meta section of the page
            $rootScope.$broadcast('post' , $scope.post);

            //Sets the owner of the post for authorisation purposes
            $scope.owned = User.get().username==$scope.post.username;
            
            //
            $scope.posts = Posts.get().slice(0 , 5);
            Posts.getAuthorPosts($scope.post.username).then(function(result){
               $scope.authorPosts = result;
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
                         alert(err);
                     });
                 } 
                 else{
                    $rootScope.$broadcast('loading:start' , {});
                    $rootScope.$broadcast('loading:end' , {msg : 'you cannot unfavourite your post'});
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
                      $rootScope.$broadcast('loading:end' , {msg : status});
                      $state.go('in.posts');
                  });
              };

        

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
            Posts.shortenUrl('www.palingram.com/#!/in/posts/'+$scope.post._id).then(
              function(shortenedUrl){
                 $scope.link = shortenedUrl;
              } ,
              function(err){
                 //alert(err);
              })
            
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
                return $scope.post.description.substr(0 , 100);
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
                      $rootScope.$broadcast('loading:end' , {msg : status});
                      $state.go('out.auth');
                  } ,
                  function(err){
                      $rootScope.$broadcast('loading:end' , {msg : err});
                  }
               );
            };

            $scope.save = function(){
               if(User.get().firstname == 'guest'){
                   alert('log in to save your preferences');
               }
               else{
                 $rootScope.$broadcast('loading:start' , {msg : 'updating profile'});
                 User.update($scope.user).then(function(result){
                      $rootScope.$broadcast('loading:end' , {msg : result});
                 } , function(err){
                      $rootScope.$broadcast('loading:end' , {msg : err});
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
             Tags.queryAll().then(function(data){
                 $scope.allTags = data;
             });
             var option = $scope.post.comments_id == '' ? 'new' : 'old';

             $scope.clearTags = function(){
                  $scope.tags = [];
             };


             //Watch $scope.newTag and add a tag every time a space is entered 
             $scope.addTag = function(newTag){
                 if(newTag && $scope.tags.length < 6 && $scope.tags.indexOf(newTag) < 0){
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

            //This takes care of including a category
            $scope.categories = Tags.getCategories();
            $scope.selectedCategory = '';

            $scope.addCategory = function(category){
                if($scope.selectedCategory== ''){
                     $scope.selectedCategory = category;
                     $scope.tags.push(category);
                }
                else {
                   var index = $scope.tags.indexOf($scope.selectedCategory);
                   $scope.tags.splice(index , 1);
                   $scope.selectedCategory = '';
                   $scope.addCategory(category);
                }
            };
            
             //this sends post to the server
            $scope.save = function(){
              if(User.get().firstname == 'guest'){
                  alert('Log in to save your articles');
              }
              else{
                $rootScope.$broadcast('loading:start' , {});
                 if(option == 'new'){
                   $scope.post.views = 0;
                   $scope.post.bio = User.get().bio;
                   Posts.post($scope.post).then(function(data){
                      $rootScope.$broadcast('loading:end' , {msg : 'post saved successfully'});
                      User.get().favourites.push(data._id);
                      option = 'old';
                   }, function(err){
                       alert('something went wrong');
                   });
                 }
                 else {
                    $scope.post.date = Date.now();
                    Posts.update($scope.post).then(function(result){
                      $rootScope.$broadcast('loading:end' , {msg : 'post updated'});
                   }, function(err){
                       alert(err);
                   });
                 } 
            }
          };
        }
   })

   .controller('gamblrCtrl' , function($scope , $timeout, $rootScope , $q , $http  , BaseUrl){
          $scope.title = 'Tradr.pw';
          $scope.setting = false;

          $scope.counter = 0;
          $scope.bankroll = 0;
          $scope.basebet =  0;
          $scope.odd = '';
          $scope.lossAccumulator  = [];
          $scope.completed = [];
          $scope.trade = false;
          $scope.game = false;
          $scope.teams = ['VFL Warri' , 'VFL Kaduna' , 'VFL Sagamu' , 'VFL Abuja' , 'VFL Lagos' , 'VFL Makurdi'];
          $scope.teamMenu = false;
          $scope.selectedTeam = 'Select Team';

          $scope.currentbetTpl = {
            stake : '0',
            status: '',
            gross : '0',
            net : '0',
            date: '',
            played: false
          };

          $scope.currentBet = angular.copy($scope.currentbetTpl);

          $scope.toggleSetting = function(){
              $scope.setting = ! $scope.setting;
          };

          $scope.save = function(bankroll){
              if(true/*bankroll >= 15800*/){
                 if( $scope.selectedTeam == 'Select Team'){
                     alert('please select a team first');
                 }
                 else {
                   $scope.game = true;
                   $scope.bankroll = bankroll;
                   $scope.setting = false;
                   $scope.basebet  = ($scope.bankroll/150); 
                 }
              }
              else {
                  alert('insufficient capital'); 
              }
             
          };

         
          $scope.reset = function(){
              $scope.currentBet = angular.copy($scope.currentbetTpl);
              $scope.bankroll = 0;
              $scope.basebet = 0;
              $scope.odd = '';
              $scope.counter = 0;
              $scope.lossAccumulator  = [];
              $scope.completed = [];
              $scope.trade = false;
              $scope.game = false;
              $scope.selectedTeam = 'Select Team';
              $scope.teamMenu = false;
          };

          $scope.refresh = function(){
              $scope.currentBet = angular.copy($scope.currentbetTpl);
          };
          
          $scope.bet =  function(odd){
              if($scope.counter == 8){
                  $rootScope.$broadcast('loading:start' , {msg : 'updating results on server....'});
                  $scope.updateTradrServer().then(function(status){
                      $rootScope.$broadcast('loading:end' , {msg : status});
                      $scope.reset();
                  } , function(err){
                      $rootScope.$broadcast('loading:end' , {msg : err});
                  });
              } 
              else if($scope.odd <= 1 ){
                  alert('invalid pip');
              }else {
                $scope.trade = true;
                $scope.currentBet.stake =  $scope.stakeAggregator(odd);
                $scope.currentBet.played = true;
                $scope.bankroll -= $scope.currentBet.stake;
              }
             
          };
           
          $scope.record = function (status){
               $scope.trade = false;
               $scope.odd  = '';
               if($scope.currentBet.played){
                   $scope.currentBet.status = status;
                   $scope.currentBet.date =  Date.now();
                   $scope.currentBet.gross = $scope.currentBet.stake * $scope.currentBet.odd;
                   $scope.currentBet.net = $scope.currentBet.gross - $scope.currentBet.stake;

                   if(! status){
                       $scope.lossAccumulator.push($scope.currentBet.stake);
                   } 
                   else {
                       $scope.counter ++;
                       $scope.bankroll += $scope.currentBet.gross; 
                       $scope.lossAccumulator  = [];
                       $scope.basebet  = ($scope.bankroll/150);
                   }

                   $scope.completed.push(angular.copy($scope.currentBet));

                   $scope.refresh();
               } 
               else {
                   alert('No active trade');
               }
               
          };
          //************************Algorithm core************************//

          $scope.stakeAggregator = function(odd){
               $scope.currentBet.odd = odd;
               if($scope.lossAccumulator.length == 0){
                   var temp = Math.ceil($scope.basebet / (odd - 1));
                   if(temp < 50){
                     return 50;
                   }
                   return temp;
               }
               else {
                   var totalLoss=0;
                   angular.forEach($scope.lossAccumulator , function(loss){
                        totalLoss+=loss;
                   });
                   var temp =  Math.ceil( (totalLoss +  $scope.basebet) / (odd - 1));
                   if(temp < 50){
                     return 50;
                   }
                   return temp;
               }
          };

        //Team selecctor
         $scope.toggleTeamMenu = function(){
              $scope.teamMenu = !$scope.teamMenu;
         }

         $scope.selectTeam = function (team){
             $scope.selectedTeam = team;
             $scope.teamMenu = false;
         };

         //Data synchroniser
        $scope.updateTradrServer = function(){
            var promise = $q.defer();

            var query = {
               bets : angular.copy($scope.completed),
               team : $scope.selectedTeam,
               date : Date.now()
            };

            $http({
               method : 'POST',
               url : BaseUrl+'/tradr/update',
               data : query
            })
            .success(function(result){
                promise.resolve(result);
            })
            .error(function(err){
                promise.resolve(err);
            });
            
            return promise.promise;
        };

   })

.directive('sideMenu' , function(){
           return {
              restrict: 'E',
              templateUrl : 'views/sidemenu.tpl.html'
           }
});