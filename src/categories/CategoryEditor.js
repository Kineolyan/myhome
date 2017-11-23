import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

import {submitElement, prepareElement} from '../core/ElementEditor';
import {setModelFromInput} from '../core/muiForm';
import actions from '../redux/actions';

const ELEMENT_KEY = 'category';
class CategoryEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {[ELEMENT_KEY]: {}};
  }

  componentWillMount() {
    this.cbks = {
      setName: setModelFromInput.bind(
        null,
        this.state,
        ELEMENT_KEY,
        newState => this.setState(newState),
        'name'),
      submit: () => {
        return submitElement(
          prepareElement(
            this.state[ELEMENT_KEY],
            {}),
          this.props.saveCategory,
          () => this.setState({[ELEMENT_KEY]: {}}),
          this.props.onSubmit
        );
      }
    };
  }

  render() {
    return <div>
      <TextField hintText="Nom de la catégorie"
        defaultValue={this.props.category.name}
        onChange={this.cbks.setName} />
      <RaisedButton label="Ajouter" primary={true}
        onClick={this.cbks.submit} />
    </div>;
  }
}

CategoryEditor.propTypes = {
  category: PropTypes.object,
  onSubmit: PropTypes.func
};

CategoryEditor.defaultProps = {
  category: {},
  onSubmit: () => {}
};

function mapStateToProps(state, props) {
  return props;
};

function mapDispatchToProps(dispatch) {
  return {
    saveCategory: (category) => dispatch({
      type: actions.categories.save,
      queryId: 'save-category',
      value: category
    })
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CategoryEditor);
export {
  CategoryEditor
}
