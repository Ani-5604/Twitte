const initialState = {
    loggedInUser: null,
  };
  
  export const userReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'SET_USER':
        return {
          ...state,
          loggedInUser: action.payload,
        };
      default:
        return state;
    }
  };
  