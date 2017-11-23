import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

const ElementPicker = (props) => {
  const values = props.values;
  if (_.isEmpty(values)) {
    return props.emptyElement;
  }

  const hintText = _.isString(props.hintText) ? props.hintText : null;
  const emptyItem = props.withEmpty 
    ? <MenuItem value={null} primaryText=" " /> 
    : null;

  return <SelectField
      value={props.value || null}
      onChange={(event, index, value) => props.onSelect(value)}
      hintText={props.withEmpty ? hintText : undefined}
      floatingLabelText={hintText}
      floatingLabelFixed={hintText !== null && !props.withEmpty}>
    {emptyItem}
    {values.map(value => {
      return <MenuItem key={value.id}
        value={value.id} primaryText={value.name} />;
    })}
  </SelectField>;
};

ElementPicker.propTypes = {
  values: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string
  })),
  value: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  hintText: PropTypes.string,
  withEmpty: PropTypes.bool,
  emptyElement: PropTypes.object
};

ElementPicker.defaultProps = {
  withEmpty: true,
  emptyElement: (<p>No element to pick</p>)
};

export default ElementPicker;
