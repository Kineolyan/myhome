'use strict';

angular.module('comptesApp')
  .filter('currency', function () {
    return function (value) {
      if (value === undefined) { return ''; }

      return parseInt(value / 100) + ',' + (Math.abs(value) % 100) + ' €' ;
    };
  });
