'use strict';

angular.module('comptesApp')
  .controller('TransactionsCtrl', function ($scope) {
    $scope.transactions = [
      {'id':1, 'titre':'achat', 'somme':1000, 'jour':'2014-05-03', 'notes':null, 'compte_id':1, 'created_at':'2014-05-03T17:50:01.570Z','updated_at':'2014-05-03T17:50:01.570Z','type_paiement':0},
      {'id':2, 'titre':'retrait', 'somme':2050, 'jour':'2014-05-03', 'notes':null, 'compte_id':1, 'created_at':'2014-05-03T17:50:01.570Z','updated_at':'2014-05-03T17:50:01.570Z','type_paiement':0}
    ];
  })
  .controller('TransactionsNewCtrl', function ($scope) {
    $scope.transaction = {};

    $scope.transactions = [];

    $scope.comptes = [
      { id: 1, nom: 'Olivier', solde: 1234, transactions: [] },
      { id: 2, nom: 'Colombe', solde: 5678, transactions: [] }
    ];

    $scope.hasErrors = function() { return false; };

    $scope.ajouter = function() {
      var lastTransaction = $scope.transaction;
      var newTransaction = {
        jour: lastTransaction.jour,
        compte_id: lastTransaction.compte_id
      };

      lastTransaction.state = "refresh";
      lastTransaction.somme = parseInt(parseFloat(lastTransaction.somme) * 100);

      $scope.transactions.push(lastTransaction);
      $scope.transaction = newTransaction;
    };

    $scope.supprimer = function(index) {
      $scope.transactions.splice(index, 1);
    };

    $scope.setOk = function(index) {
      $scope.transactions[index].state = "ok";
    };
  });
