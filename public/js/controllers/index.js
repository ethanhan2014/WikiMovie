angular.module('mean.system').controller('IndexController', ['$scope', 'Global', 'Index', 'moviePlaceholder', function ($scope, Global, Index, moviePlaceholder) {
    $scope.global = Global;

    $scope.moviePlaceholder = moviePlaceholder;

    $scope.latest = function(num) {
        Index.get({
            numLatest: num
        }, function(latest) {
            $scope.latest = latest;
        });
    };
}]);
