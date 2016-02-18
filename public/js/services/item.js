//Movie service used for item REST endpoint (could just use $http, but that could change)
angular.module('mean.item').factory("Item", ['$resource', function($resource) {
    return $resource('item/:itemId', {
        itemId: '@itemId'
    });
}]);
