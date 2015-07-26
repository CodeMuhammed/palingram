'use strict';


var app = angular.module('fileUpload', [ 'ngFileUpload' ]);
var version = '4.1.2';

app.controller('MyCtrl', [ '$scope', '$http', '$timeout', '$compile', 'Upload', function($scope, $http, $timeout, $compile, Upload) {
	$scope.usingFlash = FileAPI && FileAPI.upload != null;
	$scope.fileReaderSupported = window.FileReader != null && (window.FileAPI == null || FileAPI.html5 != false);

	$scope.angularVersion = window.location.hash.length > 1 ? (window.location.hash.indexOf('/') === 1 ? 
			window.location.hash.substring(2): window.location.hash.substring(1)) : '1.2.20';

	$scope.uploadFiles= function(files) {
		if (files != null) {
			for (var i = 0; i < files.length; i++) {
				(function(file) {
					generateThumbAndUpload(file);
				})(files[i]);
			}
		}
	};
	
	function generateThumbAndUpload(file) {
		$scope.generateThumb(file);
		uploadUsingUpload(file);
	}
	
	$scope.generateThumb = function(file) {
		if (file != null) {
			if ($scope.fileReaderSupported && file.type.indexOf('image') > -1) {
				$timeout(function() {
					var fileReader = new FileReader();
					fileReader.readAsDataURL(file);
					fileReader.onload = function(e) {
						$timeout(function() {
							file.dataUrl = e.target.result;
						});
					}
				});
			}
		}
	};
	
	function uploadUsingUpload(file){
		//get csrf token
		upload(file);
	}
	
	function upload(file) {
		
		file.upload = Upload.upload({
			method: 'POST',
			url:'http://localhost:3000/upload',
			headers: {
				'Content-Type': file.type
			},
			params: {_csrf: $scope.csrf},
			file: file,
			fileFormDataName: 'myFile'
		});

		file.upload.then(function(response) {
			$timeout(function() {
				file.result = response.data;
				
			});
		}, function(response) {
		});

		file.upload.progress(function(evt) {
			// Math.min is to fix IE which reports 200% sometimes
			file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
		});

		file.upload.xhr(function(xhr) {
			// xhr.upload.addEventListener('abort', function(){console.log('abort complete')}, false);
		});
	}

	$timeout(function(){
		$scope.capture = localStorage.getItem('capture'+ version) || 'camera';
		$scope.accept = localStorage.getItem('accept'+ version) || 'image/*,audio/*,video/*';
		$scope.acceptSelect = localStorage.getItem('acceptSelect'+ version) || 'image/*,audio/*,video/*';
		$scope.disabled = localStorage.getItem('disabled'+ version) == 'true' || false;
		$scope.multiple = localStorage.getItem('multiple'+ version) == 'true' || false;
		$scope.allowDir = localStorage.getItem('allowDir'+ version) == 'true' || true;
		$scope.$watch('capture+accept+acceptSelect+disabled+capture+multiple+allowDir', function() {
			localStorage.setItem('capture'+ version, $scope.capture);
			localStorage.setItem('accept'+ version, $scope.accept);
			localStorage.setItem('acceptSelect'+ version, $scope.acceptSelect);
			localStorage.setItem('disabled'+ version, $scope.disabled);
			localStorage.setItem('multiple'+ version, $scope.multiple);
			localStorage.setItem('allowDir'+ version, $scope.allowDir);
		});
	});

} ]);

app.directive('uploader' , function(){
	return {
		restrict:'E',
		controller : 'MyCtrl',
		templateUrl: 'views/uploader.tpl.html'
	};
});
