'use strict';

angular.module('comptesApp')
  .directive('transactions', function () {
    /**
     * <transactions /> element displaying all transactions in the scope variable 'transactions'.
     * It unherits from the parent scope.
     * Attributes:
     *   showProgress: display a progress glyphicon, related to transaction.state value.
     */
    return {
      templateUrl: 'views/porte-monnaie/transactions/_transactions.html',
      restrict: 'E',
      replace: true,
      transclude: false,
      scope: true,
      link: function(scope, elements, attributes) {
        scope.showProgress = attributes.$attr.showprogress !== undefined;
      }
    };
  });
