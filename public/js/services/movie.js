//Movie service used for movie REST endpoint (could just use $http, but that could change)
angular.module('mean.movie').factory("Movie", ['$resource', function($resource) {
    return $resource('movie/:movieId', {
        movieId: '@movieId'
    });
}]);
