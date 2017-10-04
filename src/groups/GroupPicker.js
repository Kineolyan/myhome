import React from 'react';
import reactStamp from 'react-stamp';

import ElementPicker from '../core/ElementPicker';
import {WithStreams} from '../core/rx';
import {WithHorizons} from '../core/horizon';

const GroupPicker = reactStamp(React)
  .compose(WithStreams, WithHorizons, ElementPicker)
  .compose({
    defaultProps:   {
      hintText: 'Group'
    },
    componentWillMount() {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const stream = this.groupsFeed
        .above({createdAt: lastMonth.getTime()}, 'closed')
        .order('createdAt', 'descending')
        .watch().subscribe(
          groups => this.setState({values: groups}),
          err => console.error('Can\'t retrieve groups', err)
        );
      this.setStream('groups', stream);
    },
    renderEmpty() {
      return <div>No groups</div>;
    }
  });

export default GroupPicker;
