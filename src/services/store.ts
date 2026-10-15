import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  TypedUseSelectorHook,
  useDispatch as dispatchHook,
  useSelector as selectorHook
} from 'react-redux';
import ingredients from './slices/ingredients';
import burgerConstructor from './slices/burger-constructor';
import auth from './slices/auth';
import order from './slices/order';
import feed from './slices/feed';
import profileOrders from './slices/profile-orders';
import orderDetails from './slices/order-details';
export const rootReducer = combineReducers({
  ingredients,
  burgerConstructor,
  auth,
  order,
  feed,
  profileOrders,
  orderDetails
});
export const createAppStore = () =>
  configureStore({ reducer: rootReducer, devTools: false });
const store = createAppStore();
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export const useDispatch: () => AppDispatch = dispatchHook;
export const useSelector: TypedUseSelectorHook<RootState> = selectorHook;
export default store;
