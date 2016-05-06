/**
 * Created by liu on 2016/4/17 0017.
 */
var signupModule = angular.module('signup.config',['ui.router','ngStorage','auth']);

signupModule.config(function($stateProvider,$urlRouterProvider,$httpProvider){
    $stateProvider
        .state('signup',{
            url:'/signup',
            templateUrl:'/signup/signup.view.html',
            controller:'signupCtrl'
        });

    $httpProvider.interceptors.push('authInterceptor');
});


signupModule.controller('signupCtrl', ['$rootScope', '$scope', '$location', '$localStorage', 'Main', function($rootScope, $scope, $location, $localStorage, Main){
    $rootScope.menuHide = true;
    $rootScope.topMenuHide = false;
    $scope.signup = function() {
            var formData = {
                email: $scope.email,
                password: $scope.password
            }

            Main.save(formData, function(res) {
                 if(res.type == false){
                    $scope.signupError = res.data;
                }else{
                    $localStorage.token = res.data.token;
                    $location.path('/me');
                };
            }, function() {
                $rootScope.error = 'Failed to signup';
            })
        };


}]);
