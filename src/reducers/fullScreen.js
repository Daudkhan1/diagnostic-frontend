const initialState = {
  fullScreen: false,
};

export const setFullScreen = (value) => async (dispatch) => {
  dispatch({
    type: "FULLSCREEN",
    payload: value,
  });
};

const fullScreenReducer = (state = initialState, action) => {
  switch (action.type) {
    case "FULLSCREEN":
      return { ...state, fullScreen: action.payload };

    default:
      return state;
  }
};

export default fullScreenReducer;
