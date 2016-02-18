// Credit to: http://stackoverflow.com/questions/30207272/capitalize-the-first-letter-of-string-in-angularjs
angular.module('mean').filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});

// Credit to: https://gist.github.com/jeffjohnson9046/9470800
angular.module('mean').filter('percentage', ['$filter', function ($filter) {
  return function (input, decimals) {
    return $filter('number')(input * 100, decimals) + '%';
  };
}]);
