import React from 'react';
import _ from 'lodash';
import reactStamp from 'react-stamp';

import ElementPicker from '../core/ElementPicker';
import {WithStreams} from '../core/rx';
import {WithHorizons} from '../core/horizon';

const CategoryPicker = reactStamp(React)
  .compose(ElementPicker, WithStreams, WithHorizons)
  .compose({
    defaultProps: {
      hintText: 'Catégorie de la transaction'
    },
    componentWillMount() {
      const stream = this.categoriesFeed
        // .order('name')
        .watch()
        .subscribe(
          categories => this.setState({values: _.sortBy(categories, ['name'])}),
          err => console.error('Can\'t retrieve categories', err)
        );
      this.setStream('categories', stream);
    },
    renderEmpty() {
      return <div>No categories</div>;
    }
  });

export default CategoryPicker;
