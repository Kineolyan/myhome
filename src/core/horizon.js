import React from 'react';

const WithHorizons = {
	contextTypes: {
		horizons: React.PropTypes.object
	},
	getValidationFeed() {
		return this.context.horizons.validations;
	},
	getTransactionFeed() {
		return this.context.horizons.transactions;
	}
};

function defineHorizons(hz) {
  return {
     messages: hz('messages'),
     accounts: hz('accounts'),
     categories: hz('categories'),
     transactions: hz('transactions'),
     validations: hz('account_validations')
   };
}

const HorizonsShape = React.PropTypes.shape({
  messages: React.PropTypes.object,
  accounts: React.PropTypes.object,
  categories: React.PropTypes.object,
  transactions: React.PropTypes.object,
  validations: React.PropTypes.object
});

export {
  defineHorizons,
  HorizonsShape,
  WithHorizons
};