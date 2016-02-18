angular.module('mean.comment').controller('CommentController', ['$scope', '$route', '$routeParams', '$http', '$location', 'Global', 'Comment', 'Item',
    function ($scope, $route, $routeParams, $http, $location, Global, Comment, Item) {
    $scope.global = Global;

    $scope.resultsPerPage = 10;

     // We should also look when loading the page at the beginning.
    $scope.initParams = function() {
        $scope.itemId = $route.current.params.itemId;
        $scope.listPage = $route.current.params.page || 1;
    };

    // Fetch a comment
    $scope.fetchComment = function() {

        $scope.commentId = $route.current.params.commentId;

        Comment.get({
            commentId: $scope.commentId
        }, function (comment) {
            $scope.comment = comment;
            $scope.comment_content = comment.content;
        });
    }

    // List the entries for an item
    $scope.listItems = function() {

        var queryUrl = '/comment/item/list/' + $scope.itemId + '/';

        // Calculate the offset based off the page number.
        var offset = ($scope.listPage - 1) * $scope.resultsPerPage;

        // Build the search request.
        queryUrl += offset + "/" + $scope.resultsPerPage;

        // Fetch the results
        $http({
            method: 'GET',
            url: queryUrl,
        })
        .then(function(response) {
            $scope.totalResults = response.data.count;
            $scope.commentData = response.data.rows;
        });
    };

    // List the entries for a user
    $scope.listUser = function() {

        var queryUrl = '/comment/user/list/' + $routeParams.userId + '/';

        // Calculate the offset based off the page number.
        var offset = ($scope.listPage - 1) * $scope.resultsPerPage;

        // Build the search request.
        queryUrl += offset + "/" + $scope.resultsPerPage;

        // Fetch the results
        $http({
            method: 'GET',
            url: queryUrl,
        })
        .then(function(response) {
            $scope.totalResults = response.data.count;
            $scope.commentData = response.data.rows;
        });
    };

    $scope.initInfo = function() {
      var type = $routeParams.type;
      var id = $routeParams.itemId;

      if (type == 'movie' || type == 'person' || type == 'studio') {

        Item.get({ itemId: id},
            function (item) {
                $scope.item = item;
            });
      } else {
        console.error('Invalid comment type ' + type);
        return;
      }
    };

    $scope.create = function() {
      var comment = new Comment({
        item_id: $routeParams.itemId,
        content: $scope.comment_content
      });

      comment.$save(function(response) {
        console.log(response);
        $location.path($routeParams.type + "/" + $routeParams.itemId + "/comment/list");
      });
    };

    $scope.setItemPage = function () {

        // Redirect to the selected page. If the page is "1" can just omit it.
        var newPath = $routeParams.type + "/" + $routeParams.itemId + "/comment/list";

        // Use this.listPage to get the new page
        if (this.listPage != 1) {
            newPath += "/" + this.listPage;
        }

        $location.path(newPath);
    };

    $scope.setUserPage = function () {

        // Redirect to the selected page. If the page is "1" can just omit it.
        var newPath = "user/" + $routeParams.userId;

        // Use this.listPage to get the new page
        if (this.listPage != 1) {
            newPath += "/" + this.listPage;
        }

        $location.path(newPath);
    };

    $scope.delete = function() {

        if (confirm("Are you sure you would like to delete this comment? This action cannot be undone."))
        {
            Comment.delete({
                commentId: this.result.comment_id
            }, function(response) {
                console.log(response);
                $route.reload();
            });
        }
    };

    $scope.update = function() {
        Comment.save({
            commentId: $scope.comment.comment_id,
            content: $scope.comment_content,
        }, function(response) {
            console.log(response);
            $location.path($scope.comment.Subject.type + "/" + $scope.comment.item_id + "/comment/list");
        });
    };

    // Fetch the user's profile.
    $scope.userProfile = function() {

        $http({
            method: 'GET',
            url: '/user/' + $routeParams.userId + '/profile',
        })
        .then(function(response) {
            $scope.userProfile = response.data;
        });
    };

}]);
