'use strict';

var myhome = angular.module('comptesApp');

myhome.controller('ComptesCtrl', [ '$scope', 'comptes',
    function ($scope, comptes)
{
  $scope.comptes = comptes;

  //~ registerActions([
    //~ { name: 'Créer un compte', path: '#/comptes/new' },
    //~ { name: 'Liste des comptes', path: '#/comptes' }
  //~ ]);
}]);

myhome.controller('ComptesShowCtrl', [ '$scope', 'compte',
    function ($scope, compte)
{
  $scope.compte = compte;
  $scope.transactions = [
    { titre: 'test',  }
  ];
}]);

myhome.controller('ComptesNewCtrl', [ 'Compte', '$scope', '$location',
    function(Compte, $scope, $location)
{
  $scope.compte = new Compte();

  $scope.hasErrors = function() {
    return false;
  };

  $scope.creer = function() {
    $location.path('comptes/1');
  };
}]);
