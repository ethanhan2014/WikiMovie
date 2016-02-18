angular.module('mean.person').controller('PersonController', ['$scope', '$routeParams', '$location', '$http', 'Global', 'Person', function ($scope, $routeParams, $location, $http, Global, Person) {
    $scope.global = Global;

    $scope.random = function() {
      $http({
        method: 'GET',
        url: '/person/random',
      })
      .then(function(response) {
        // Redirect to the random id generated, use replace so that we don't
        // get stuck in a redirect loop when hitting the back button
        $location.path('/person/'+response.data.id).replace();
      });
    };

    $scope.findOne = function() {
        Person.get({
            personId: $routeParams.personId
        }, function(person) {
            $scope.person = person;
        });
    };

    // Get the visualization data.
    $scope.visualize = function() {
      $http({
        method: 'GET',
        url: '/person/visualize/' + $routeParams.personId,
      })
      .then(function(response) {
        $scope.person = response.data;

        var d = modelgraph.getNode(tmdb.Person, $scope.person.tmdb_id, addViewNode);
        $.when(d).then(function (startNode) {
            addViewNode(startNode);
            refocus(startNode);
        });
      });
    };
}]);
