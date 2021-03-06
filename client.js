import React from 'react';
import { hydrate } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import { BrowserRouter } from 'react-router-dom';
import createSagaMiddleware from 'redux-saga';
import { Reducers, Sagas, GAListener, App } from 'spee.ch-components';

// configure the reducers by passing initial state configs
const siteConfig = require('siteConfig.js');
const MyReducers = Reducers(siteConfig);
const MyApp = App(siteConfig);
const MyGAListener = GAListener(siteConfig);

// get the state from a global variable injected into the server-generated HTML
const preloadedState = window.__PRELOADED_STATE__ || null;
//
// Allow the passed state to be garbage-collected
delete window.__PRELOADED_STATE__;

// create and apply middleware
const sagaMiddleware = createSagaMiddleware();
const middleware = applyMiddleware(sagaMiddleware);
const reduxMiddleware = window.__REDUX_DEVTOOLS_EXTENSION__ ? compose(middleware, window.__REDUX_DEVTOOLS_EXTENSION__()) : middleware;

// create the store
let store;
if (preloadedState) {
    store = createStore(MyReducers, preloadedState, reduxMiddleware);
} else {
    store = createStore(MyReducers, reduxMiddleware);
}

sagaMiddleware.run(Sagas.rootSaga);

// render the app
hydrate(
    <Provider store={store}>
        <BrowserRouter>
            <MyGAListener>
                <MyApp />
            </MyGAListener>
        </BrowserRouter>
    </Provider>,
    document.getElementById('react-app')
);
