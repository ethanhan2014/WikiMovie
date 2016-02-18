//Studio service used for studio REST endpoint (could just use $http, but that could change)
angular.module('mean.studio').factory("Studio", ['$resource', function($resource) {
    return $resource('studio/:studioId', {
        studioId: '@studioId'
    });
}]);
