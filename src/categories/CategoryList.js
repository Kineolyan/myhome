import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {connect} from 'react-redux';

import actions from '../redux/actions';

class CategoryList extends React.Component {
  componentWillMount() {
    this.props.listCategories();
  }

  render() {
    if (_.isEmpty(this.props.categories)) {
      return <p>No categories</p>;
    }

    return <ul>
      {this.props.categories.map(category => {
        return <li key={category.id}>{category.name}</li>;
      })}
    </ul>;
  }
}

CategoryList.propTypes = {
  categories: PropTypes.array,
  listCategories: PropTypes.func.isRequired
};

const CATEGORY_QUERY_ID = 'categoryList';
const mapStateToProps = (state, props) => {
  const categories = _(state.categories.queries[CATEGORY_QUERY_ID])
    .map(cId => state.categories.values[cId])
    .filter(category => category)
    .value();

  return {
    ...props,
    categories
  };
};

const mapDispatchToProps = (dispatch) => ({
  listCategories() {
    dispatch({
      type: actions.categories.query,
      queryId: CATEGORY_QUERY_ID,
      order: 'name ascending'
    });
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(CategoryList);
export {
  CategoryList
};
