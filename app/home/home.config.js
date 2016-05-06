/**
 * Created by liu on 2016/4/14 0014.
 */
var homeModule = angular.module('home.config',['ui.router','ngStorage']);

homeModule.config(function($stateProvider,$urlRouterProvider){
	$urlRouterProvider.when("",'home');
    $stateProvider
        .state('home',{
            url:'/home',
            templateUrl:'home/home.view.html',
            controller:'homeCtrl'
        })
});
homeModule.controller('homeCtrl', ['$rootScope', '$scope', '$location', '$localStorage',  function($rootScope, $scope, $location, $localStorage){
	var redirect = function(){
		if(typeof $localStorage.token !== "undefined"){
			$location.path('/me');
		}else{
			$location.path('/home');
		}
	}        
	redirect();
	$rootScope.menuHide = true;
    $rootScope.topMenuHide = false;
}]);