'use strict';

/**
 * @ngdoc service
 * @name angularApp.Transaction
 * @description
 * # Transaction
 * Service in the angularApp.
 */
angular.module('myhome.comptes.services')
  .factory('Transaction', [ '$resource', function ($resource) {
    return $resource('http://localhost:3000/comptes/transactions/:id.json'
        , { id: '@id' }
      );
  }])
  // .factory('TransactionLoader', [ 'Transaction', '$q', '$route',
  //     function(Transaction, $q, $route)
  // {
  //   return function() {
  //     var delay = $q.defer();

  //     Transaction.get({id: $route.current.params.transactionId }, function(transaction) {
  //       delay.resolve(transaction);
  //     }, function() {
  //       delay.reject('Unable to fetch transaction ' + $route.current.params.transactionId);
  //     });

  //     return delay.promise;
  //   };
  // }])
  .factory('TransactionsLoader', [ 'Transaction', '$q',
      function(Transaction, $q)
  {
    return function() {
      var delay = $q.defer();

      Transaction.query(function(transactions) {
        delay.resolve(transactions);
      }, function() {
        delay.reject('Unable to fetch transactions');
      });

      return delay.promise;
    };
  }]);
