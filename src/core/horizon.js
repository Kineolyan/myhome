import React from 'react';
import reactStamp from 'react-stamp';

const HorizonsShape = React.PropTypes.shape({
  messages: React.PropTypes.object,
  accounts: React.PropTypes.object,
  categories: React.PropTypes.object,
  transactions: React.PropTypes.object,
  validations: React.PropTypes.object
});

const WithHorizons = reactStamp(React).compose({
	contextTypes: {
		horizons: HorizonsShape
	},
  init(props, {instance}) {
    Reflect.defineProperty(instance, 'accountFeed', {
      get: function() {
        return this.context.horizons.accounts();
      }
    });
    Reflect.defineProperty(instance, 'transactionFeed', {
      get: function() {
        return this.getTransactionFeed();
      }
    });
  },
	getValidationFeed() {
		return this.context.horizons.validations;
	},
	getTransactionFeed() {
		return this.context.horizons.transactions;
	}
});

function defineHorizons(hz) {
  return {
     messages: hz('messages'),
     accounts: hz('accounts'),
     categories: hz('categories'),
     transactions: hz('transactions'),
     validations: hz('account_validations')
   };
}

export {
  defineHorizons,
  HorizonsShape,
  WithHorizons
};