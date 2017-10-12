import React from 'react';
import reactStamp from 'react-stamp';
import {connect} from 'react-redux';

import ElementPicker from '../core/ElementPicker';
import actions from '../redux/actions';
import {getStateValues} from '../redux/horizonStore';

const CategoryPicker = reactStamp(React)
  .compose(ElementPicker)
  .compose({
    defaultProps: {
      hintText: 'Catégorie de la transaction'
    },
    componentWillMount() {
      this.props.listCategories();
    },
    renderEmpty() {
      return <div>No categories</div>;
    }
  });

const CATEGORY_QUERY_ID = 'categoryPicker';
const mapStateToProps = (state, props) => {
  const categories = getStateValues(state.categories, CATEGORY_QUERY_ID);

  return {
    ...props,
    values: categories
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

export default connect(mapStateToProps, mapDispatchToProps)(CategoryPicker);
export {
  CategoryPicker
};
