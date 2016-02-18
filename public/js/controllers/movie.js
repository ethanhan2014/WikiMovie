angular.module('mean.movie').controller('MovieController', ['$scope', '$routeParams', '$location', '$http', 'Global', 'Movie', function ($scope, $routeParams, $location, $http, Global, Movie) {
    $scope.global = Global;

    $scope.random = function() {
      $http({
        method: 'GET',
        url: '/movie/random',
      })
      .then(function(response) {
        // Redirect to the random id generated, use replace so that we don't
        // get stuck in a redirect loop when hitting the back button
        $location.path('/movie/'+response.data.id).replace();
      });
    };

    $scope.findOne = function() {

        var movieId = $routeParams.movieId;
        // It's much faster to use several concurrent queries than trying to
        // build a massive single query.
        Movie.get({
            movieId: movieId
        }, function(movie) {
            $scope.movie = movie;
        });

        // Get involved people.
        $http({
          method: 'GET',
          url: '/person/movie_involved/' + movieId
        }).then(function(response) {
          var involved = response.data;
          $scope.cast = [];
          $scope.crew = [];

          // Given the involved people, need to divide into cast and crew.
          for (var i in involved) {
            var involvement = involved[i];

            var inv_obj = { cast_order: involvement.cast_order,
                role_name : involvement.role_name, item_id : involvement.person_id,
                name : involvement.InvolvedPeople.name };

            // If cast order is not null, then its cast, otherwise crew
            if (involvement.cast_order !== null) {
              $scope.cast.push(inv_obj);
            } else {
              $scope.crew.push(inv_obj);
            }
          }

          // Sort the cast in order of cast_order
          $scope.cast.sort(function (a, b) {
            return (a.cast_order < b.cast_order) ? -1 : ((a.cast_order > b.cast_order) ? 1 : 0);
          });
        });

        // Get related tags.
        $http({
          method: 'GET',
          url: '/tag/movie_tag/' + movieId
        }).then(function(response) {
          $scope.tags = response.data;
        });

        // Get studio info.
        $http({
          method: 'GET',
          url: '/studio/movie_create/' + movieId
        }).then(function(response) {
          $scope.creators = response.data;
        });
    };

    // Get the visualization data.
    $scope.visualize = function() {

      Movie.get({
        movieId: $routeParams.movieId
      }, function(movie) {
        $scope.movie = movie;

        var d = modelgraph.getNode(tmdb.Movie, $scope.movie.tmdb_id, addViewNode);
        $.when(d).then(function (startNode) {
            addViewNode(startNode);
            refocus(startNode);
        });
      });
    };
}]);
