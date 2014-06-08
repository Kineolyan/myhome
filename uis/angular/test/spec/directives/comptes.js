'use strict';

describe('Directive: comptes', function () {

  // load the directive's module
  beforeEach(module('comptesApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<comptes></comptes>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the comptes directive');
  }));
});
