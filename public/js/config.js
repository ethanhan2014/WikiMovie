//Setting up route
angular.module('mean').config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/studio/random', {
            templateUrl: 'views/studio/random.html'
        }).
        when('/studio/:studioId', {
            templateUrl: 'views/studio/view.html'
        }).
        when('/person/random', {
            templateUrl: 'views/person/random.html'
        }).
        when('/person/:personId', {
            templateUrl: 'views/person/view.html'
        }).
        when('/person/:personId/visualize', {
            templateUrl: 'views/person/visualize.html'
        }).
        when('/movie/random', {
            templateUrl: 'views/movie/random.html'
        }).
        when('/movie/:movieId', {
            templateUrl: 'views/movie/view.html'
        }).
        when('/movie/:movieId/visualize', {
            templateUrl: 'views/movie/visualize.html'
        }).
        when('/:type/:itemId/comment/create', {
            templateUrl: 'views/comment/create.html'
        }).
        when('/:type/:itemId/comment/list/:page?', {
            templateUrl: 'views/comment/list_item.html'
        }).
        when('/search/:type/:query/:page?', {
            templateUrl: 'views/search/results.html'
        }).
        when('/comment/:commentId/edit', {
            templateUrl: 'views/comment/edit.html'
        }).
        when('/user/:userId/:page?', {
            templateUrl: 'views/comment/list_user.html'
        }).
        when('/tag/list', {
            templateUrl: 'views/tag/list.html'
        }).
        when('/tag/browse/:tag/:page?', {
            templateUrl: 'views/tag/browse.html'
        }).
        when('/', {
            templateUrl: 'views/index.html'
        }).
        otherwise({
            redirectTo: '/'
        });
    }
])
// Set the placeholder image for movies
.constant('moviePlaceholder', "http://cdn2.bigcommerce.com/n-arxsrf/fhqhzj/product_images/uploaded_images/movie-category-trivia-night.jpg")
// Show a given number of results per page
.constant('searchResultsPerPage', 10);

//Setting HTML5 Location Mode
angular.module('mean').config(['$locationProvider',
    function($locationProvider) {
        $locationProvider.hashPrefix("!");
    }
]);
