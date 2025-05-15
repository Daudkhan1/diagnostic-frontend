import { legacy_createStore as createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { thunk } from "redux-thunk";
import { sessionService } from "redux-react-session";

import rootReducer from "./reducers/rootReducer";

const initialState = {};
const middlewares = [thunk];

const store = createStore(
  rootReducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middlewares))
);

sessionService.initSessionService(store);

export default store;
