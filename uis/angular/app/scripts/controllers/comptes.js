'use strict';

var myhome = angular.module('comptesApp');

myhome.controller('ComptesCtrl', [ '$scope',
    function ($scope)
{
  $scope.comptes = [
    { id: 1, nom: 'Olivier', solde: 1234, transactions: [] },
    { id: 2, nom: 'Colombe', solde: 5678, transactions: [] }
  ];
  
  //~ registerActions([
    //~ { name: 'Créer un compte', path: '#/comptes/new' },
    //~ { name: 'Liste des comptes', path: '#/comptes' }
  //~ ]);
}]);

myhome.controller('ComptesShowCtrl',
    function ($scope)
{
  $scope.compte = {
    id: 1,
    nom: 'Olivier',
    solde: 1234
  };
  $scope.transactions = [
    { titre: 'test',  }
  ];
});

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
