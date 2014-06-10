'use strict';

angular.module('comptesApp')
  .controller('TransactionsCtrl', function ($scope, transactions) {
    $scope.transactions = transactions;
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
