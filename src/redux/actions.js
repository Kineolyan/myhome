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
		store: 'STORE_TRANSACTIONS',
		save: 'SAVE_TRANSACTION',
		delete: 'DELETE_TRANSACTIONS',
		toTemplate: 'TRANSACTION_TO_TEMPLATE'
	},
	templates: {
		query: 'QUERY_TEMPLATES',
		store: 'STORE_TEMPLATES',
		save: 'SAVE_TEMPLATES',
		delete: 'DELETE_TEMPLATE'
	},
	groups: {
		query: 'QUERY_GROUPS',
		store: 'STORE_GROUPS',
		save: 'SAVE_GROUP'
	},
	activity: {
		setState: 'SET_STATE'
	},
	activities: {
		transactions: 'LOAD_TRANSACTION_ACTIVITY',
		accounts: 'LOAD_ACCOUNT_ACTIVITY',
		export: 'LOAD_ACCOUNT_EXPORT',
		templates: 'LOAD_ACCOUNT_TEMPLATES',
		showcase: 'LOAD_SHOWCASE_ACTIVITY'
	},
	editors: {
		setup: 'EDITOR_SETUP',
		edit: 'EDITOR_EDIT',
		submit: 'EDITOR_SUBMIT',
		clear: 'EDITOR_CLEAR'
	}
};