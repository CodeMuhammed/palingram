'use strict';

angular.module('td.easySocialShare', [])
  .directive('share', ['$location', function ($location) {
    return {
      link: function (scope, elem, attrs) {
       
        var network = attrs.network;
        var link = attrs.link;
        var text = attrs.text;
        console.log(network+' '+link+' '+text);


        var tweetlink = 'http://twitter.com/intent/tweet?text=' +link;
      }
    };
  }]);
