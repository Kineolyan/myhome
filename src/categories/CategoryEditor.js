import React from 'react';
import reactStamp from 'react-stamp';
import _ from 'lodash';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

import ElementEditor, {HorizonEditor} from '../core/ElementEditor';
import {StateForm} from '../core/muiForm';
import {WithHorizons} from '../core/horizon';

const CategoryEditor = reactStamp(React)
  .compose(WithHorizons, ElementEditor, HorizonEditor, StateForm)
  .compose({
    propTypes: {
      category: React.PropTypes.object
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
