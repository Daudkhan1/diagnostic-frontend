import { combineReducers } from "redux";
import { sessionReducer } from "redux-react-session";

import fullScreenReducer from "./fullScreen";

const rootReducer = combineReducers({
  session: sessionReducer,
  fullScreen: fullScreenReducer,
});

export default rootReducer;
