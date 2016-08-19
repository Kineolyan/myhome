import React from 'react';
import _ from 'lodash';

import ElementPicker from '../core/ElementPicker';

class AccountPicker extends ElementPicker {

  get feed() {
    return this.context.horizons.accounts;
  }

  componentWillMount() {
    super.componentWillMount();

    this.feed
      .order('name', 'ascending')
      .watch().subscribe(
        categories => this.setState({values: categories}),
        err => console.error('Can\'t retrieve accounts', err)
      );
  }

  renderEmpty() {
    return <div>No account</div>;
  }
}

AccountPicker.contextTypes = {
  horizons: React.PropTypes.object
};

AccountPicker.propTypes = ElementPicker.propTypes;

AccountPicker.defaultProps = _.assign({},
  ElementPicker.defaultProps,
  {
    hintText: 'Compte'
  }
);

export default AccountPicker;
