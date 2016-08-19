import React from 'react';
import _ from 'lodash';

import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

class ElementPicker extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      values: []
    };
  }

  componentWillMount() {
    this.cbks = {
      select: (event, index, value) => this.props.onSelect(value)
    };
  }

  render() {
    if (_.isEmpty(this.state.values)) {
      return this.renderEmpty();
    }

    const hintText = _.isString(this.props.hintText) ?
      this.props.hintText : null;
    const emptyItem = this.props.withEmpty ?
      <MenuItem value={null} primaryText=" " /> : null;

    return <SelectField
        value={this.props.value || null}
        onChange={this.cbks.select}
        hintText={this.props.withEmpty ? hintText : undefined}
        floatingLabelText={hintText}
        floatingLabelFixed={hintText !== null && !this.props.withEmpty}>
      {emptyItem}
      {this.state.values.map(value => {
        return <MenuItem key={value.id}
          value={value.id} primaryText={value.name} />;
      })}
    </SelectField>;
  }
}

ElementPicker.propTypes = {
  value: React.PropTypes.string,
  onSelect: React.PropTypes.func.isRequired,
  hintText: React.PropTypes.string,
  withEmpty: React.PropTypes.bool
};

ElementPicker.defaultProps = {
  withEmpty: true
};

export default ElementPicker;
