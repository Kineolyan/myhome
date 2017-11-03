export default {
	location: {
		goto: 'GO_TO_URL',
		load: 'LOAD_URL'
	},
	accounts: {
		query: 'QUERY_ACCOUNTS',
		store: 'STORE_ACCOUNTS',
		save: 'SAVE_ACCOUNT',
		delete: 'DELETE_ACCOUNT'
	},
	categories: {
		query: 'QUERY_CATEGORIES',
		store: 'STORE_CATEGORIES',
		save: 'SAVE_CATEGORY'
	},
	transactions: {
		query: 'QUERY_TRANSACTIONS',
		store: 'STORE_TRANSACTIONS'
	},
	templates: {
		query: 'QUERY_TEMPLATES',
		store: 'STORE_TEMPLATES',
		delete: 'DELETE_TEMPLATE'
	},
	activities: {
		transactions: 'LOAD_TRANSACTION_ACTIVITY',
		accounts: 'LOAD_ACCOUNT_ACTIVITY',
		showcase: 'LOAD_SHOWCASE_ACTIVITY'
	},
	editors: {
		setup: 'EDITOR_SETUP',
		edit: 'EDITOR_EDIT',
		submit: 'EDITOR_SUBMIT',
		clear: 'EDITOR_CLEAR'
	}
};