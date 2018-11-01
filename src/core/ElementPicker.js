import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import reactStamp from 'react-stamp';
import {Select} from 'antd';

const ElementPicker = reactStamp(React).compose({
  state: {
    values: null
  },
  propTypes: {
    values: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string
    })),
    value: PropTypes.string,
    onSelect: PropTypes.func.isRequired,
    hintText: PropTypes.string,
    withEmpty: PropTypes.bool
  },
  defaultProps: {
    withEmpty: true
  },
  render() {
    const values = this.state.values || this.props.values;
    if (_.isEmpty(values)) {
      return this.renderEmpty();
    }

    const hintText = _.isString(this.props.hintText) ? this.props.hintText : null;

    const filterOption = (input, option) => option.props.children.toLowerCase().includes(input.toLowerCase());
		return <Select
        showSearch
        filterOption={filterOption}
        optionFilterProp="children"
        style={{ width: 300 }}
        value={this.props.value || null}
        onChange={this.props.onSelect}
        placeholder={this.props.withEmpty ? hintText : undefined}>
      {values.map(value => 
        <Select.Option 
            key={value.id}
            value={value.id}>
          {value.name}
        </Select.Option>
      )}
    </Select>;
  }
});

export default ElementPicker;
