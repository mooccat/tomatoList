var auth = angular.module('auth', ['ngStorage']);
auth.factory('Main', ['$http', '$localStorage', function($http, $localStorage){
        var baseUrl = "http://localhost:3000";
        function changeUser(user) {
            angular.extend(currentUser, user);
        }

        function urlBase64Decode(str) {
            var output = str.replace('-', '+').replace('_', '/');
            switch (output.length % 4) {
                case 0:
                    break;
                case 2:
                    output += '==';
                    break;
                case 3:
                    output += '=';
                    break;
                default:
                    throw 'Illegal base64url string!';
            }
            return window.atob(output);
        }

        function getUserFromToken() {
            var token = $localStorage.token;
            var user = {};
            if (typeof token !== 'undefined') {
                var encoded = token.split('.')[1];
                user = JSON.parse(urlBase64Decode(encoded));
            }
            return user;
        }

        var currentUser = getUserFromToken();

        return {
            save: function(data, success, error) {
                $http.post(baseUrl + '/signin', data).success(success).error(error)
            },
            signin: function(data, success, error) {
                $http.post(baseUrl + '/authenticate', data).success(success).error(error)
            },
            me: function(success, error) {
                $http.get(baseUrl + '/me/').success(success).error(error)
            },
            logout: function(success) {
                changeUser({});
                delete $localStorage.token;
                success();
            },

            addProject: function(data, success, error) {
                $http.post(baseUrl + '/addProject', data).success(success).error(error)
            },
            addTask: function(data, success, error) {
                $http.post(baseUrl + '/addTask', data).success(success).error(error)
            },
            modifyTask: function(data, success, error) {
                $http.post(baseUrl + '/modifyTask', data).success(success).error(error)
            },
            modifyProject: function(data, success, error) {
                $http.post(baseUrl + '/modifyProject', data).success(success).error(error)
            },
        };
    }
]);

auth.factory('authInterceptor', ['$q', '$location', '$localStorage', function($q,$location,$localStorage){
        return {
        'request': function (config) {
            config.headers = config.headers || {};
            if ($localStorage.token) {
                config.headers.Authorization = 'Bearer ' + $localStorage.token;
            }
            return config;
        },
        'responseError': function(response) {
            if(response.status === 401 || response.status === 403) {
                $location.path('/signin');
            }
            return $q.reject(response);
        }
    };
}]);