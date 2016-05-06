var menuModule = angular.module('menu.config', ['auth']);

menuModule.controller('menuCtrl', ['$scope','$location','Main', function($scope,$location,Main){
	 $scope.logout = function() {
            Main.logout(function() {
            	window.location.hash = "";
            }, function() {
                $rootScope.error = 'Failed to logout';
            });
        };
}])