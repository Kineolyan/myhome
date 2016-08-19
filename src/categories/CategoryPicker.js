import React from 'react';
import _ from 'lodash';

import ElementPicker from '../core/ElementPicker';

class CategoryPicker extends ElementPicker {

  get feed() {
    return this.context.horizons.categories;
  }

  componentWillMount() {
    super.componentWillMount();

    this.feed
      // .order('name')
      .watch()
      .subscribe(
        categories => this.setState({values: _.sortBy(categories, ['name'])}),
        err => console.error('Can\'t retrieve categories', err)
      );
  }

  renderEmpty() {
    return <div>No categories</div>;
  }
}

CategoryPicker.contextTypes = {
  horizons: React.PropTypes.object
};

CategoryPicker.propTypes = ElementPicker.propTypes;

CategoryPicker.defaultProps = _.assign({},
  ElementPicker.defaultProps,
  {
    hintText: 'Catégorie de la transaction'
  }
);

export default CategoryPicker;
