/**
 * Created by liu on 2016/4/11 0011.
 */
//this is used to parse the profile
var signinModule = angular.module('signin.config',['ui.router','ngStorage','auth']);

signinModule.config(function($stateProvider,$urlRouterProvider,$httpProvider){
    $stateProvider
        .state('signin',{
            url:'/signin',
            templateUrl:'/signin/signin.view.html',
            controller:'signinCtrl'
        });

    $httpProvider.interceptors.push('authInterceptor');
});


signinModule.controller('signinCtrl', ['$rootScope', '$scope', '$location', '$localStorage', 'Main','$http', function($rootScope, $scope, $location, $localStorage, Main,$http){
    $rootScope.menuHide = true;
    $rootScope.topMenuHide = false;
    $scope.signin = function() {
            var formData = {
                email: $scope.email,
                password: $scope.password
            }
            Main.signin(formData, function(res) {
                if(res.type == false){
                    $scope.signinError = res.data;
                }else{
                    $localStorage.token = res.data.token;
                    $location.path('/me');
                };
            }, function() {
                $rootScope.error = "登陆失败";

            })
        };

}]);

