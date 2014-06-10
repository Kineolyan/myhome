'use strict';

var services = angular.module('myhome.comptes.services', [ 'ngResource' ]);

services.factory('Compte', [ '$resource', function ($resource) {
  return $resource('http://localhost:3000/comptes/comptes/:id.json', { id: '@id' });
}]);

services.factory('CompteLoader', [ 'Compte', '$q', '$route',
    function(Compte, $q, $route)
{
  return function() {
    var delay = $q.defer();

    console.log('trying to get the account to ' + $route.current.params.compteId);
    Compte.get({id: $route.current.params.compteId }, function(compte) {
      console.log('resolving');
      delay.resolve(compte);
      console.log('... done');
    }, function() {
      delay.reject('Unable to fetch compte ' + $route.current.params.compte);
      console.log('... rejected');
    });

    return delay.promise;
  };
}]);

services.factory('ComptesLoader', [ 'Compte', '$q',
    function(Compte, $q)
{
  return function() {
    var delay = $q.defer();

    Compte.query(function(comptes) {
      delay.resolve(comptes);
    }, function() {
      delay.reject('Unable to fetch comptes');
    });

    return delay.promise;
  };
}]);
