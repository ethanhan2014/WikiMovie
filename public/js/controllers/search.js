angular.module('mean.search').controller('SearchController', ['$scope', '$route', '$http', '$location', 'Global', 'moviePlaceholder', 'searchResultsPerPage',
    function ($scope, $route, $http, $location, Global, moviePlaceholder, searchResultsPerPage) {
    $scope.global = Global;

    $scope.moviePlaceholder = moviePlaceholder;
    $scope.searchResultsPerPage = searchResultsPerPage;

    $scope.searchParam = null;
    $scope.searchQuery = "";

    // When changing pages, update parameters.
    $scope.$on('$locationChangeSuccess', function(event) {
        // routeParams is not initialized at this point, but route.current.params is.
        $scope.searchParam = $route.current.params.type;
        $scope.searchQuery = $route.current.params.query;
    });

    // We should also look when loading the page at the beginning.
    $scope.initParams = function() {
        $scope.searchParam = $route.current.params.type;
        $scope.searchQuery = $route.current.params.query;
        $scope.searchPage = $route.current.params.page || 1;
    };

    // Get the results!
    $scope.getResults = function() {

        var queryUrl;

        if ($scope.searchParam == 'person') {
            queryUrl = '/search/person/';
        }
        else if ($scope.searchParam == 'movie') {
            queryUrl = '/search/movie/';
        }
        else {
            console.error("Unknown search type: " + $scope.searchParam);
            return;
        }

        // Calculate the offset based off the page number.
        var offset = ($scope.searchPage - 1) * $scope.searchResultsPerPage;

        // Build the search request.
        queryUrl += encodeURIComponent($scope.searchQuery) + "/" +
            offset + "/" + $scope.searchResultsPerPage;

        // Fetch the results
        $http({
            method: 'GET',
            url: queryUrl,
        })
        .then(function(response) {
            $scope.totalResults = response.data.count;
            $scope.searchResults = response.data.rows;
        });
    };

    // Performs a search
    $scope.performSearch = function() {
        $location.path('/search/'+ $scope.searchParam + "/" + $scope.searchQuery);
    };

    // Handles "I'm feeling lucky!", simply redirects to a random page.
    $scope.redirectRandom = function() {
        $location.path('/' + $scope.searchParam + "/random");
    };

    // Pagination
    $scope.setPage = function () {

        // Redirect to the selected page. If the page is "1" can just omit it.
        var newPath = "/search/" + $scope.searchParam + "/" + $scope.searchQuery;

        // Use this.searchPage to get the new search page
        if (this.searchPage != 1) {
            newPath += "/" + this.searchPage;
        }

        $location.path(newPath);
    };

    // Handles autocomplete
    $scope.autocomplete = function(val) {

        var queryUrl;
        var limit = 8;

        if ($scope.searchParam == 'person') {
            queryUrl = '/autocomplete/person/';
        }
        else if ($scope.searchParam == 'movie') {
            queryUrl = '/autocomplete/movie/';
        }
        else {
            // Nothing selected, just exit
            return;
        }

        // Build the autocomplete request.
        queryUrl += encodeURIComponent(val) + "/" +
            limit;

        // Fetch the results
        return $http({
            method: 'GET',
            url: queryUrl,
        })
        .then(function(response) {
            return response.data;
        });
    };
}]);
