import { createAppStore } from './store';
import {
  addIngredient,
  removeIngredient,
  moveIngredient
} from './slices/burger-constructor';
import { selectPrice, selectCounters } from './selectors';
import { createOrder, closeOrder } from './slices/order';
import {
  checkAuth,
  login,
  logout,
  updateUser,
  sessionExpired
} from './slices/auth';
import { fetchOrderDetails } from './slices/order-details';
import { fetchProfileOrders } from './slices/profile-orders';
import { getCookie, setCookie } from '../utils/cookie';
import { TIngredient, TOrder } from '@utils-types';
import * as api from '@api';
jest.mock('@api');
const mocked = jest.mocked(api);
export const bun: TIngredient = {
  _id: 'bun',
  name: 'Булка',
  type: 'bun',
  price: 100,
  proteins: 1,
  fat: 1,
  carbohydrates: 1,
  calories: 1,
  image: '',
  image_large: '',
  image_mobile: ''
};
const main = { ...bun, _id: 'main', type: 'main', price: 50 };
const order: TOrder = {
  _id: 'o',
  number: 42,
  ingredients: ['bun', 'main', 'bun'],
  name: 'Бургер',
  status: 'done',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01'
};
const user = { name: 'Test', email: 'test@example.com' };
beforeEach(() => {
  mocked.getFeedsApi.mockResolvedValue({
    success: true,
    orders: [order],
    total: 1,
    totalToday: 1
  });
  mocked.getOrdersApi.mockResolvedValue([order]);
});
const authenticated = () => {
  const store = createAppStore();
  store.dispatch(checkAuth.fulfilled(user, '', undefined));
  return store;
};
test('constructor: duplicate IDs, bun replacement, bounds, removal and totals', () => {
  const store = createAppStore();
  store.dispatch(addIngredient(bun));
  store.dispatch(addIngredient(main));
  store.dispatch(addIngredient(main));
  let items = store.getState().burgerConstructor.ingredients;
  expect(items[0].id).not.toBe(items[1].id);
  expect(selectPrice(store.getState())).toBe(300);
  expect(selectCounters(store.getState())).toEqual({ bun: 2, main: 2 });
  const first = items[0].id;
  const second = items[1].id;
  store.dispatch(moveIngredient({ id: first, direction: -1 }));
  expect(store.getState().burgerConstructor.ingredients[0].id).toBe(first);
  store.dispatch(moveIngredient({ id: first, direction: 1 }));
  expect(store.getState().burgerConstructor.ingredients[0].id).toBe(second);
  store.dispatch(removeIngredient(first));
  expect(store.getState().burgerConstructor.ingredients).toHaveLength(1);
  store.dispatch(addIngredient({ ...bun, _id: 'bun2', price: 200 }));
  expect(selectPrice(store.getState())).toBe(450);
  expect(selectCounters(store.getState())).toEqual({ bun2: 2, main: 1 });
});
test('order uses two buns, blocks duplicate submits, clears only after success', async () => {
  const store = authenticated();
  store.dispatch(addIngredient(bun));
  store.dispatch(addIngredient(main));
  let resolve!: (r: Awaited<ReturnType<typeof api.orderBurgerApi>>) => void;
  mocked.orderBurgerApi.mockImplementation(
    () =>
      new Promise((r) => {
        resolve = r;
      })
  );
  const first = store.dispatch(createOrder());
  await store.dispatch(createOrder());
  expect(mocked.orderBurgerApi).toHaveBeenCalledTimes(1);
  expect(mocked.orderBurgerApi).toHaveBeenCalledWith(['bun', 'main', 'bun']);
  expect(store.getState().burgerConstructor.bun).not.toBeNull();
  resolve({ success: true, order, name: order.name });
  await first;
  expect(store.getState().burgerConstructor.bun).toBeNull();
  expect(store.getState().order.data?.number).toBe(42);
  expect(mocked.getOrdersApi).toHaveBeenCalled();
});
test('failed order preserves constructor; guests cannot send an order', async () => {
  const store = authenticated();
  store.dispatch(addIngredient(bun));
  mocked.orderBurgerApi.mockRejectedValue(new Error('Нет связи'));
  await store.dispatch(createOrder());
  expect(store.getState().order.error).toBe('Нет связи');
  expect(store.getState().burgerConstructor.bun).not.toBeNull();
  const guest = createAppStore();
  guest.dispatch(addIngredient(bun));
  await guest.dispatch(createOrder());
  expect(mocked.orderBurgerApi).toHaveBeenCalledTimes(1);
});
test('login stores credentials without password in state; profile updates user', async () => {
  const store = createAppStore();
  mocked.loginUserApi.mockResolvedValue({
    success: true,
    user,
    accessToken: 'Bearer access',
    refreshToken: 'refresh'
  });
  await store.dispatch(
    login({ email: user.email, password: 'secret-password' })
  );
  expect(getCookie('accessToken')).toBe('Bearer access');
  expect(localStorage.getItem('refreshToken')).toBe('refresh');
  expect(JSON.stringify(store.getState())).not.toContain('secret-password');
  mocked.updateUserApi.mockResolvedValue({
    success: true,
    user: { ...user, name: 'New' }
  });
  await store.dispatch(updateUser({ name: 'New' }));
  expect(store.getState().auth.user?.name).toBe('New');
});
test('session restoration waits for the API; logout clears local session even on failure', async () => {
  const store = createAppStore();
  setCookie('accessToken', 'Bearer access');
  mocked.getUserApi.mockResolvedValue({ success: true, user });
  const check = store.dispatch(checkAuth());
  expect(store.getState().auth.checking).toBe(true);
  await check;
  expect(store.getState().auth.user).toEqual(user);
  mocked.logoutApi.mockRejectedValue(new Error('offline'));
  await store.dispatch(logout());
  expect(store.getState().auth.user).toBeNull();
  expect(getCookie('accessToken')).toBeUndefined();
});
test('late profile responses cannot repopulate another session', async () => {
  const store = authenticated();
  let resolve!: (orders: TOrder[]) => void;
  mocked.getOrdersApi.mockImplementation(
    () =>
      new Promise((r) => {
        resolve = r;
      })
  );
  const pending = store.dispatch(fetchProfileOrders());
  store.dispatch(sessionExpired());
  resolve([order]);
  await pending;
  expect(store.getState().profileOrders.orders).toEqual([]);
});
test('detail requests ignore out-of-order responses', async () => {
  const store = createAppStore();
  let resolve!: (
    r: Awaited<ReturnType<typeof api.getOrderByNumberApi>>
  ) => void;
  mocked.getOrderByNumberApi
    .mockImplementationOnce(
      () =>
        new Promise((r) => {
          resolve = r;
        })
    )
    .mockResolvedValueOnce({
      success: true,
      orders: [{ ...order, number: 43 }]
    });
  const first = store.dispatch(fetchOrderDetails(42));
  await store.dispatch(fetchOrderDetails(43));
  resolve({ success: true, orders: [order] });
  await first;
  expect(store.getState().orderDetails.data?.number).toBe(43);
});

test('closing a pending modal does not cancel the request or lose newly added items', async () => {
  const store = authenticated();
  store.dispatch(addIngredient(bun));
  store.dispatch(addIngredient(main));
  let resolve!: (r: Awaited<ReturnType<typeof api.orderBurgerApi>>) => void;
  mocked.orderBurgerApi.mockImplementation(
    () =>
      new Promise((r) => {
        resolve = r;
      })
  );
  const pending = store.dispatch(createOrder());
  expect(store.getState().order.modalOpen).toBe(true);
  store.dispatch(closeOrder());
  expect(store.getState().order.modalOpen).toBe(false);
  expect(store.getState().order.loading).toBe(true);
  store.dispatch(addIngredient(main));
  const newest = store.getState().burgerConstructor.ingredients[1].id;
  resolve({ success: true, order, name: order.name });
  await pending;
  expect(
    store.getState().burgerConstructor.ingredients.map((i) => i.id)
  ).toEqual([newest]);
  expect(store.getState().order.modalOpen).toBe(true);
});
