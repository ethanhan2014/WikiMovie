//Studio service used for comment REST endpoint
angular.module('mean.comment').factory("Comment", ['$resource', function($resource) {
    return $resource('comment/:commentId', {
        commentId: '@commentId'
    });
}]);
