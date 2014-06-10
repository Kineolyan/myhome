'use strict';

var myhome = angular.module('comptesApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'myhome.comptes.services'
]);

myhome.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'views/main.html',
      controller: 'MainCtrl'
    })
    .when('/porte-monnaie/comptes', {
      templateUrl: 'views/porte-monnaie/comptes/index.html',
      controller: 'ComptesCtrl',
      resolve: {
        comptes: function(ComptesLoader) { return new ComptesLoader(); }
      }
    })
    .when('/porte-monnaie/comptes/new', {
      templateUrl: 'views/porte-monnaie/comptes/edit.html',
      controller: 'ComptesNewCtrl'
    })
    .when('/porte-monnaie/comptes/:compteId', {
      templateUrl: 'views/porte-monnaie/comptes/show.html',
      controller: 'ComptesShowCtrl',
      resolve: {
        compte: function(CompteLoader) { return new CompteLoader(); }
      }
    })
    .when('/porte-monnaie/transactions', {
      templateUrl: 'views/porte-monnaie/transactions/index.html',
      controller: 'TransactionsCtrl'
    })
    .when('/porte-monnaie/transactions/new', {
      templateUrl: 'views/porte-monnaie/transactions/new.html',
      controller: 'TransactionsNewCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });
});

myhome.controller('RootCtrl', [ '$scope', function($scope)
{
  $scope.actions = [];

  $scope.registerActions = function(actions) {
    $scope.actions = actions;
  };
}]);
