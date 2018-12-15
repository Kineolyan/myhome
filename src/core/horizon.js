import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import reactStamp from 'react-stamp';

const FEEDS = {
  accounts: 'accounts',
  categories: 'categories',
  transactions: 'transactions',
  validations: 'account_validations',
  groups: 'transactions_groups',
  templates: 'transaction_templates'
};

const HorizonsShape = PropTypes.shape(
  _(FEEDS).keys()
    .reduce((shape, feedName, feed) => {
      shape[feed] = PropTypes.object
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
          return this.context.horizons[feed];
        }
      });
    });
  },
	getValidationFeed() {
		return this.context.horizons.validations;
	},
	getTransactionFeed() {
		return this.context.horizons.transactions;
  },
  getTemplateFeed() {
    return this.context.horizons.templates;
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