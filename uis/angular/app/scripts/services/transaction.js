'use strict';

/**
 * @ngdoc service
 * @name angularApp.Transaction
 * @description
 * # Transaction
 * Service in the angularApp.
 */
var services = angular.module('myhome.comptes.services', [ 'ngResource' ]);

services.factory('Transaction', [ '$resource', function ($resource) {
  return $resource('http://localhost:3000/comptes/transactions/:id.json'
      , { id: '@id' }
    );
}]);

services.factory('TransactionLoader', [ 'Transaction', '$q', '$route',
    function(Transaction, $q, $route)
{
  return function() {
    var delay = $q.defer();

    console.log('trying to get the account to ' + $route.current.params.transactionId);
    Transaction.get({id: $route.current.params.transactionId }, function(transaction) {
      console.log('resolving');
      delay.resolve(transaction);
      console.log('... done');
    }, function() {
      delay.reject('Unable to fetch transaction ' + $route.current.params.transactionId);
      console.log('... rejected');
    });

    return delay.promise;
  };
}]);

services.factory('TransactionsLoader', [ 'Transaction', '$q',
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
