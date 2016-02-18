//Person service used for person REST endpoint (could just use $http that could change)
angular.module('mean.person').factory("Person", ['$resource', function($resource) {
    return $resource('person/:personId', {
        personId: '@personId'
    });
}]);
