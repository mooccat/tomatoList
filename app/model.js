var model = angular.module('model', []);

model.controller('modelCtrl', ['$rootScope','$scope', function($rootScope,$scope){
	$rootScope.taskList = [{a:2},{a:4}];
}])