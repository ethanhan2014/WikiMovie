angular.module('mean.studio').controller('StudioController', ['$scope', '$routeParams', '$location', '$http', 'Global', 'Studio', function ($scope, $routeParams, $location, $http, Global, Studio) {
    $scope.global = Global;

    $scope.random = function() {
      $http({
        method: 'GET',
        url: '/studio/random',
      })
      .then(function(response) {
        // Redirect to the random id generated, use replace so that we don't
        // get stuck in a redirect loop when hitting the back button
        $location.path('/studio/'+response.data.id).replace();
      });
    };

    $scope.findOne = function() {
        Studio.get({
            studioId: $routeParams.studioId
        }, function(studio) {
            $scope.studio = studio;
            console.log(studio);
        });
    };
}]);
