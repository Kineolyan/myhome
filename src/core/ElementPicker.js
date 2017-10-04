import React from 'react';
import _ from 'lodash';
import reactStamp from 'react-stamp';

import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

const ElementPicker = reactStamp(React).compose({
  state: {
    values: null
  },
  propTypes: {
    values: React.PropTypes.arrayOf(React.PropTypes.shape({
      id: React.PropTypes.string,
      name: React.PropTypes.string
    })),
    value: React.PropTypes.string,
    onSelect: React.PropTypes.func.isRequired,
    hintText: React.PropTypes.string,
    withEmpty: React.PropTypes.bool
  },
  defaultProps: {
    withEmpty: true
  },
  componentWillMount() {
    this.cbks = {
      select: (event, index, value) => this.props.onSelect(value)
    };
  },
  render() {
    const values = this.state.values || this.props.values;
    if (_.isEmpty(values)) {
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
      {values.map(value => {
        return <MenuItem key={value.id}
          value={value.id} primaryText={value.name} />;
      })}
    </SelectField>;
  }
});

export default ElementPicker;
