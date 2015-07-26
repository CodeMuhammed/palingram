angular.module('piveo')
   .factory('Posts' , function(){

   	  var query = function (tags){
   	  	return  [
   	  	   {
   	  	   	 "_id":"12344",
   	  	   	 "author":"muhammed ali",
   	  	   	 "title":"This First Post Title",
   	  	   	 "date": Date.now(),
   	  	   	 "image" : 'img/img.png',
   	  	   	 "body":"Lorem ipsun is the very best wayy if addressinnng werer ftroo mrtilllik just premore juwwer awasfff ghill jilll eueuhhfidn jdnggd",
   	  	   	 "comments_id":"234523",
   	  	   	 "voters":['username1' , 'username2'],
   	  	   	 "tags":['general']
   	  	   },
   	  	   {
   	  	   	 "_id":"12355",
   	  	   	 "author":"Isa ali",
   	  	   	 "title":"This second Post Title",
   	  	   	 "date": Date.now(),
   	  	   	 "image" : 'img/img.png',
   	  	   	 "body":"Lorem ipsun is the very best wayy if addressinnng werer ftroo mrtilllik just premore juwwer awasfff ghill jilll eueuhhfidn jdnggd",
   	  	   	 "comments_id":"234524",
   	  	   	 "voters":['username1' , 'username2'],
   	  	   	 "tags":['general']
   	  	   },
           {
             "_id":"12377",
             "author":"maryam ali",
             "title":"This is a Post Title",
             "date": Date.now(),
             "image" : 'img/img.png',
             "body":"Lorem ipsun is the very best wayy if addressinnng werer ftroo mrtilllik just premore juwwer awasfff ghill jilll eueuhhfidn jdnggd",
             "comments_id":"234524",
             "voters":['username1' , 'username2'],
             "tags":['general']
           },
           {
             "_id":"12395",
             "author":"rukkaya ali",
             "title":"This another Post Title",
             "date": Date.now(),
             "image" : 'img/img.png',
             "body":"Lorem ipsun is the very best wayy if addressinnng werer ftroo mrtilllik just premore juwwer awasfff ghill jilll eueuhhfidn jdnggd",
             "comments_id":"234524",
             "voters":['username1' , 'username2'],
             "tags":['general']
           },
   	  	   {
   	  	   	 "_id":"12366",
   	  	   	 "author":"Brymo ali",
   	  	   	 "title":"This third Post Title",
   	  	   	 "date": Date.now(),
   	  	   	 "image" : 'img/img.png',
   	  	   	 "body":"Lorem ipsun is the very best wayy if addressinnng werer ftroo mrtilllik just premore juwwer awasfff ghill jilll eueuhhfidn jdnggd",
   	  	   	 "comments_id":"234534",
   	  	   	 "voters":['username1' , 'username2'],
   	  	   	 "tags":['general']
   	  	   }
   	  	];
   	  }

   	  return {
          query : query
   	  }

   })
   
   .factory('User' , function(){
   	    var tags = ['general'];
   	    var user = {
   	       _id : '123443',
   	       fullname : 'muhammed ali',
   	       username : 'piveo',
   	       password : 'saltedpassword',
   	       email : 'codemuhammed@gmail.com',
   	       favourites : [],
   	       tags_id : '234555'
   	    };

   	    var getTags = function(){
            return tags;
   	    };

          var signedIn = function(){
              return user ? true : false;
          };

        return  {
           activeUser : user,
           tags : getTags,
           signedIn : signedIn
        }
   });