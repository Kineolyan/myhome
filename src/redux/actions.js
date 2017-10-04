export default {
	location: {
		goto: 'GO_TO_URL',
		load: 'LOAD_URL'
	},
	accounts: {
		query: 'QUERY_ACCOUNTS',
		store: 'STORE_QUERY_ACCOUNTS',
		add: 'ADD_ACCOUNT'
	},
	categories: {
		query: 'QUERY_CATEGORIES',
		store: 'STORE_QUERY_CATEGORIES',
		add: 'ADD_CATEGORY'
	},
	transactions: {
		query: 'QUERY_TRANSACTIONS',
		store: 'STORE_QUERY_TRANSACTIONS'
	},
	activities: {
		transactions: 'LOAD_TRANSACTION_ACTIVITY',
		accounts: 'LOAD_ACCOUNT_ACTIVITY',
		showcase: 'LOAD_SHOWCASE_ACTIVITY'
	}
};