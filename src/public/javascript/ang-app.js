var app = angular.module('MEAN-Template-Angular', ['ngRoute']);

// Configure routes for this application
app.config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $routeProvider.when('/', {
      templateUrl: '/html/partials/home.html',
      controller: 'HomeController'
    }).when('/profile', {
      templateUrl: '/html/partials/profile.html',
      controller:'ProfileController'
    }).when('/chem/genChem', {
      templateUrl: '/html/partials/chem/genChem.html',
      controller:'ChemController'
    }).otherwise({
      redirectTo: '/'
    });
}]);

// This controll controls the home page!!!
app.controller('HomeController', ['$scope', '$location', '$http',
  function($scope, $location, $http) {

  }
]);

app.controller('ProfileController', ['$scope', '$location', '$http',
  function($scope, $location, $http) {

  }]);

app.controller('ChemController', ['$scope', '$location', '$http',
  function($scope, $location, $http) {

  }
]);

// Simple logging to make sure everything loaded correctly
console.log('Angular has been loaded!');
console.log('Test lint');
