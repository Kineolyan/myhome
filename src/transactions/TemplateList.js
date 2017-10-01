import React from 'react';

class TemplateList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {templates: []};
  }

  componentWillMount() {
    this.selection = this.feed.order('date', 'descending')
      .watch()
      .subscribe(
        templates => this.setState({templates}),
        err => {
          console.error('Cannot get templates', err);
          this.setState({templates: []});
        });
  }

  deleteTemplate(template) {
    const tId = template.id;
    this.feed.remove(tId)
      .subscribe(
        () => {
          console.log('Template removed');
          const transactionFeed = this.context.horizons.transactions;
          transactionFeed
            .findAll({templateId: tId})
            .fetch()
            .mergeMap(transactions => transactionFeed.update(
              transactions.map(transaction => ({
                id: transaction.id,
                templateId: null
              }))))
            .subscribe(
              () => console.log('Transactions unlinked from deleted template'),
              err => console.error('Failed to unlink transactions', err));
        },
        err => console.error('Failed to delete template', template, err));
  }

  get feed() {
    return this.context.horizons.templates;
  }

  render() {
    if (this.state.templates.length > 0) {
      return <ul>
        {this.state.templates.map(t => (
          <li key={t.id}>
            {t.id} -> {t.object} ({JSON.stringify(t.frequency)})
            <span onClick={() => this.deleteTemplate(t)}>&nbsp;(x)</span>
          </li>))}
      </ul>;
    } else {
      return <p>No templates</p>;
    }
  }
}

TemplateList.contextTypes = {
  horizons: React.PropTypes.object
};

export default TemplateList;
