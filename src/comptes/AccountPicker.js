import React from 'react';
import _ from 'lodash';
import reactStamp from 'react-stamp'; 

import ElementPicker from '../core/ElementPicker';
import {WithStreams} from '../core/rx';
import {WithHorizons} from '../core/horizon';

const AccountPicker = reactStamp(React)
  .compose(WithStreams, WithHorizons, ElementPicker)
  .compose({
    defaultProps:   {
      hintText: 'Compte'
    },
    componentWillMount() {
      const stream = this.accountsFeed
        .order('name', 'ascending')
        .watch().subscribe(
          categories => this.setState({values: categories}),
          err => console.error('Can\'t retrieve accounts', err)
        );
      this.setStream('accounts', stream);
    },
    renderEmpty() {
      return <div>No account</div>;
    }
  });

export default AccountPicker;
