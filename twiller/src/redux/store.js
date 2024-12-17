import { createStore, combineReducers } from 'redux';
import { userReducer } from './reducers/userReducers'; // Import your reducers here

const rootReducer = combineReducers({
  user: userReducer,  // Add your other reducers here
});

const store = createStore(rootReducer);

export default store;
