import React from 'react';

import AccountEditor from '../comptes/AccountEditor';
import AccountList from '../comptes/AccountList';
import CategoryList from '../categories/CategoryList';
import CategoryEditor from '../categories/CategoryEditor';
import TransactionList from '../transactions/TransactionList';
import TransactionEditor from '../transactions/TransactionEditor';
import TransactionHistory from '../transactions/TransactionHistory';
import TemplateList from '../transactions/TemplateList';

import Messages from './Messages';

class Showcase extends React.Component {
  render() {
    return <div style={{borderTop: 'solid 2px #000'}}>
      <h3>Showcase</h3>
      <div className="grid">
        <div className="block">
          <Messages />
        </div>
        <div className="block">
          <AccountEditor />
        </div>
        <div className="block">
          <AccountList />
        </div>
        <div className="block">
          <CategoryEditor />
          <CategoryList />
        </div>
        <div className="block">
          <TransactionEditor />
        </div>
        <div className="block">
          <TransactionList />
        </div>
        <div className="block">
          <TransactionHistory />
        </div>
        <div className="block">
          <TemplateList />
        </div>
      </div>
    </div>;
  }
}

export default Showcase;
