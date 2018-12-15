import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import { Form, Input, Button } from 'antd';

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
    return (
      <Form layout="inline">
        <Form.Item>
          <Input placeholder="Nom de la catégorie"
            value={this.state[ELEMENT_KEY].name || this.props.category.name}
            onChange={this.cbks.setName} />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            onClick={this.cbks.submit}>
            Ajouter
          </Button>
        </Form.Item>
      </Form>
    );
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
