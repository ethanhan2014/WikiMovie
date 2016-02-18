angular.module('mean.tag').controller('TagController', ['$scope', '$route', '$routeParams', '$http', '$location', 'Global', 'moviePlaceholder', 'searchResultsPerPage',
    function ($scope, $route, $routeParams, $http, $location, Global, moviePlaceholder, searchResultsPerPage) {
    $scope.global = Global;

    $scope.numTopTags = 50;

    $scope.moviePlaceholder = moviePlaceholder;
    $scope.searchResultsPerPage = searchResultsPerPage;

    // Fetch a list of top tags
    $scope.fetchList = function() {
        $http({
            method: 'GET',
            url: '/tag/list/' + $scope.numTopTags
        })
        .then(function(response) {
            $scope.tagResults = response.data;
        });
    };

    // Fetch the name of the tag
    $scope.fetchName = function() {
        $http({
            method: 'GET',
            url: '/tag/name/' + $routeParams.tag
        })
        .then(function(response) {
            $scope.tag = response.data;
        });
    };

    // Get the movies for the given tag id
    $scope.fetchMovies = function() {

        $scope.browsePage = $route.current.params.page || 1;

        // Calculate the offset based off the page number.
        var offset = ($scope.browsePage - 1) * $scope.searchResultsPerPage;

        // Fetch the results
        $http({
            method: 'GET',
            url: '/tag/browse/' + $routeParams.tag + '/' + offset + '/' +
                $scope.searchResultsPerPage,
        })
        .then(function(response) {
            $scope.totalResults = response.data.count;
            $scope.browseResults = response.data.rows;
        });
    };

    // Pagination
    $scope.setPage = function () {

        // Redirect to the selected page. If the page is "1" can just omit it.
        var newPath = "/tag/browse/" + $routeParams.tag;

        // Use this.browsePage to get the new browse page
        if (this.browsePage != 1) {
            newPath += "/" + this.browsePage;
        }

        $location.path(newPath);
    };

}]);
