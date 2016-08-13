import React from 'react';
import _ from 'lodash';

class CategoryList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      categories: []
    };
  }

  get feed() {
    return this.context.horizons.categories;
  }

  componentWillMount() {
    this.feed
      .order('name', 'ascending')
      .watch().subscribe(
        categories => this.setState({categories}),
        err => console.error('Can\'t retrieve categories', err)
      );
  }

  render() {
    if (_.isEmpty(this.state.categories)) {
      return <p>No categories</p>;
    }

    return <ul>
      {this.state.categories.map(category => {
        return <li key={category.id}>{category.name}</li>;
      })}
    </ul>;
  }
}

CategoryList.contextTypes = {
  horizons: React.PropTypes.object
};

export default CategoryList;
