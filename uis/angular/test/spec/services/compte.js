'use strict';

describe('Service: Compte', function () {

  // load the service's module
  beforeEach(module('comptesApp'));

  // instantiate service
  var Compte;
  beforeEach(inject(function (_Compte_) {
    Compte = _Compte_;
  }));

  it('should do something', function () {
    expect(!!Compte).toBe(true);
  });

});
