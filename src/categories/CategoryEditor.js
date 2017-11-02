import React from 'react';
import PropTypes from 'prop-types';
import reactStamp from 'react-stamp';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

import ElementEditor, {HorizonEditor} from '../core/ElementEditor';
import {setModelFromInput} from '../core/muiForm';
import {WithHorizons} from '../core/horizon';

const ELEMENT_KEY = 'category';
const CategoryEditor = reactStamp(React)
  .compose(WithHorizons, ElementEditor, HorizonEditor)
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
      instance.elementKey = ELEMENT_KEY;
    },
    getElementFeed() {
      return this.categoriesFeed;
    },
    componentWillMount() {
      this.cbks.setName = setModelFromInput.bind(
        null, 
        this.state, 
        ELEMENT_KEY, 
        newState => this.setState(newState), 
        'name');
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
