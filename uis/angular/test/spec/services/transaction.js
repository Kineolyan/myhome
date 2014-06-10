'use strict';

describe('Service: Transaction', function () {

  // load the service's module
  beforeEach(module('angularApp'));

  // instantiate service
  var Transaction;
  beforeEach(inject(function (_Transaction_) {
    Transaction = _Transaction_;
  }));

  it('should do something', function () {
    expect(!!Transaction).toBe(true);
  });

});
