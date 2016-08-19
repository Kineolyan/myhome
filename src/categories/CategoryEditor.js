import React from 'react';
import _ from 'lodash';

import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';

import {auditItem} from '../core/auditActions';

class CategoryEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      edited: {}
    };
  }

  componentWillMount() {
    this.cbks = {
      setName: this.setModel.bind(this, 'name'),
      submit: this.submit.bind(this)
    };
  }

  get feed() {
    return this.context.horizons.categories;
  }

  setModel(key, event, value) {
    const category = this.state.edited;
    if (!_.isEmpty(value)) {
      category[key] = value;
    } else {
      Reflect.deleteProperty(category, key);
    }

    this.setState({edited: category});
  }

  getEditedCategory() {
    const category = _.clone(this.state.edited);
    return auditItem(category);
  }

  saveCategory(category) {
    return new Promise((resolve, reject) => {
      if (category.id === undefined) {
        this.feed.store(category)
          .subscribe(resolve, reject);
      } else {
        reject(new Error('Unsupported update'));
      }
    });
  }

  resetCategory() {
    this.setState({category: {}});
  }

  submit() {
    const category = this.getEditedCategory();
    this.saveCategory(category).then(() => {
        this.resetCategory();
    });
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
  category: React.PropTypes.object
};

CategoryEditor.defaultProps = {
  category: {}
};

CategoryEditor.contextTypes = {
  horizons: React.PropTypes.object
};

export default CategoryEditor;
