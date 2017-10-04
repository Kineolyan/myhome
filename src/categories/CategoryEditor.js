import React from 'react';
import PropTypes from 'prop-types';
import reactStamp from 'react-stamp';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

import ElementEditor, {HorizonEditor} from '../core/ElementEditor';
import {StateForm} from '../core/muiForm';
import {WithHorizons} from '../core/horizon';

const CategoryEditor = reactStamp(React)
  .compose(WithHorizons, ElementEditor, HorizonEditor, StateForm)
  .compose({
    propTypes: {
      category: PropTypes.object
    },
    defaultProps: {
      category: {}
    },
    state: {
      category: {}
    },
    init(props, {instance}) {
      const elementKey = 'category';
      instance.elementKey = elementKey;
      instance.formStateKey = elementKey;
    },
    getElementFeed() {
      return this.categoriesFeed;
    },
    componentWillMount() {
      this.cbks.setName = this.setModelFromInput.bind(this, 'name');
    },
    render() {
      return <div>
        <TextField hintText="Nom de la catégorie"
          defaultValue={this.props.category.name}
          onChange={this.cbks.setName} />
        <RaisedButton label="Ajouter" primary={true}
          onClick={this.cbks.submit} />
      </div>;
    }
  });

export default CategoryEditor;
