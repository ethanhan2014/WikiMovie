//Index service used for index REST endpoint
angular.module('mean.index').factory("Index", ['$resource', function($resource) {
    return $resource('movie/latest/:numLatest', {
        numLatest: '@numLatest'
    }, {
        get: {
            isArray: true
        }
    });
}]);
