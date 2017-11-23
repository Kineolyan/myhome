import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import ElementPicker from '../core/ElementPicker';
import actions from '../redux/actions';
import {getStateValues} from '../redux/horizonStore';

class CategoryPicker extends React.Component {
  componentWillMount() {
    this.props.listCategories();
  }

  render() {
    return <ElementPicker
      emptyElement={<div>No categories</div>}
      {...this.props} />;
  }

}

CategoryPicker.propTypes = {
  values: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string
  })),
  value: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  hintText: PropTypes.string,
  withEmpty: PropTypes.bool
};

CategoryPicker.defaultProps = {
  hintText: 'Catégorie de la transaction'
};

const CATEGORY_QUERY_ID = 'categoryPicker';
const mapStateToProps = (state, props) => {
  const categories = getStateValues(state.categories, CATEGORY_QUERY_ID);

  return {
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
