import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { createAppStore } from '../../services/store';
import { checkAuth } from '../../services/slices/auth';
import { ProtectedRoute } from './protected-route';
import { modalState, getModalBackground } from '../../utils/modal-routing';
const LocationInfo = () => {
  const l = useLocation();
  return (
    <div>
      {l.pathname}|{l.state?.from?.pathname}
    </div>
  );
};
const setup = (
  user: null | { name: string; email: string },
  path: string,
  checked = true
) => {
  const store = createAppStore();
  if (checked) store.dispatch(checkAuth.fulfilled(user, '', undefined));
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route
            path='/profile/orders/:number'
            element={
              <ProtectedRoute>
                <p>Private order</p>
              </ProtectedRoute>
            }
          />
          <Route path='/login' element={<LocationInfo />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
  return store;
};
test('private deep links preserve the requested route', async () => {
  setup(null, '/profile/orders/42');
  expect(
    await screen.findByText('/login|/profile/orders/42')
  ).toBeInTheDocument();
});
test('auth check does not cause a premature redirect', () => {
  setup(null, '/profile/orders/42', false);
  expect(screen.getByRole('status')).toBeInTheDocument();
  expect(
    screen.queryByText('/login|/profile/orders/42')
  ).not.toBeInTheDocument();
});
test('authenticated users can open private deep links', () => {
  setup({ name: 'Test', email: 't@e.com' }, '/profile/orders/42');
  expect(screen.getByText('Private order')).toBeInTheDocument();
});
test('guest-only route returns logged-in users to their original destination', async () => {
  const store = createAppStore();
  store.dispatch(
    checkAuth.fulfilled({ name: 'Test', email: 't@e.com' }, '', undefined)
  );
  render(
    <Provider store={store}>
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/login',
            state: {
              from: { pathname: '/profile/orders/42', search: '?test=1' }
            }
          }
        ]}
      >
        <Routes>
          <Route
            path='/login'
            element={
              <ProtectedRoute onlyGuest>
                <p>Login form</p>
              </ProtectedRoute>
            }
          />
          <Route path='/profile/orders/:number' element={<LocationInfo />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
  await waitFor(() =>
    expect(screen.getByText('/profile/orders/42|')).toBeInTheDocument()
  );
});
test('modal backgrounds apply only to this document and the matching parent', () => {
  const parent = {
    pathname: '/feed',
    search: '',
    hash: '',
    state: null,
    key: 'a'
  };
  const detail = { ...parent, pathname: '/feed/42', state: modalState(parent) };
  expect(getModalBackground(detail)).toEqual(parent);
  expect(
    getModalBackground({
      ...detail,
      state: { ...detail.state, documentId: 'previous-document' }
    })
  ).toBeUndefined();
  expect(
    getModalBackground({ ...detail, pathname: '/ingredients/bun' })
  ).toBeUndefined();
});
