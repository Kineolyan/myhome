import React from 'react';
import _ from 'lodash';
import reactStamp from 'react-stamp';

const FEEDS = {
  messages: 'messages',
  accounts: 'accounts',
  categories: 'categories',
  transactions: 'transactions',
  validations: 'account_validations'
};

const HorizonsShape = React.PropTypes.shape(
  _(FEEDS).keys()
    .reduce((shape, feedName, feed) => {
      shape[feed] = React.PropTypes.object
      return shape;
    }, {})
);

const WithHorizons = reactStamp(React).compose({
	contextTypes: {
		horizons: HorizonsShape
	},
  init(props, {instance}) {
    _(FEEDS).keys().forEach(feed => {
      Reflect.defineProperty(instance, `${feed}Feed`, {
        get: function() {
          return this.context.horizons[feed]();
        }
      });
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
  return _.mapValues(FEEDS, feed => hz(feed));
}

export {
  defineHorizons,
  HorizonsShape,
  WithHorizons
};