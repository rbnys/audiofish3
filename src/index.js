import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { compose } from 'redux';
import thunk from 'redux-thunk';

import App from './components/App';
import reducers from './reducers';
import { INITIAL_STATE as AUTH_INITIAL_STATE } from './reducers/authReducer';

import './css/style.css';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
	reducers,
	{
		auth: {
			...AUTH_INITIAL_STATE,
			token: localStorage.getItem('token'),
			userId: parseInt(localStorage.getItem('userId')),
			username: localStorage.getItem('username')
		}
	},
	composeEnhancers(applyMiddleware(thunk))
);

render(
	<Provider store={store}>
		<App />
	</Provider>,
	document.getElementById('root')
);
