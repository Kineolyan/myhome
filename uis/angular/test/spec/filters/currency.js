'use strict';

describe('Filter: currency', function () {

  // load the filter's module
  beforeEach(module('comptesApp'));

  // initialize a new instance of the filter before each test
  var currency;
  beforeEach(inject(function ($filter) {
    currency = $filter('currency');
  }));

  it('formats correctly currency in euros', function () {
    expect(currency(1000)).toBe('10,00 €');
    expect(currency(249)).toBe('2,49 €');
    expect(currency(80)).toBe('0,80 €');

    expect(currency(-80)).toBe('-0,80 €');
    expect(currency(-1234)).toBe('-12,34 €');
  });

});
