import "babel-polyfill";
import { createStore, applyMiddleware } from "redux";
import createSagaMiddleware from 'redux-saga'
import { composeWithDevTools } from "redux-devtools-extension";
import thunk from "redux-thunk";
import rootReducer from "./reducers";
import rootSaga from './sagas'

const initialState = {};
const sagaMiddleware = createSagaMiddleware();
const middleware = [thunk, sagaMiddleware];
const store = createStore(
  rootReducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

sagaMiddleware.run(rootSaga);


export default store;
