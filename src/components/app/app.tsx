import { ReactNode, useCallback, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import {
  ConstructorPage,
  Feed,
  Login,
  Register,
  ForgotPassword,
  ResetPassword,
  Profile,
  ProfileOrders,
  NotFound404
} from '@pages';
import { AppHeader, IngredientDetails, OrderInfo, Modal } from '@components';
import { ProtectedRoute } from '../protected-route/protected-route';
import { useDispatch } from '../../services/store';
import { checkAuth, sessionExpired } from '../../services/slices/auth';
import { fetchIngredients } from '../../services/slices/ingredients';
import { getModalBackground } from '../../utils/modal-routing';
import styles from './app.module.css';
const DetailPage = ({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) => (
  <main className={styles.detailPageWrap}>
    <h1 className={`${styles.detailHeader} text text_type_main-large`}>
      {title}
    </h1>
    {children}
  </main>
);
const App = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const background = getModalBackground(location);
  const closeModal = useCallback(() => navigate(-1), [navigate]);
  useEffect(() => {
    const expire = () => dispatch(sessionExpired());
    window.addEventListener('session-expired', expire);
    dispatch(checkAuth());
    dispatch(fetchIngredients());
    return () => window.removeEventListener('session-expired', expire);
  }, [dispatch]);
  const orderTitle = `#${location.pathname.split('/').pop()?.padStart(6, '0')}`;
  return (
    <div className={styles.app}>
      <AppHeader />
      <Routes location={background || location}>
        <Route path='/' element={<ConstructorPage />} />
        <Route path='/feed' element={<Feed />} />
        <Route
          path='/ingredients/:id'
          element={
            <DetailPage title='Детали ингредиента'>
              <IngredientDetails />
            </DetailPage>
          }
        />
        <Route
          path='/feed/:number'
          element={
            <DetailPage title={orderTitle}>
              <OrderInfo />
            </DetailPage>
          }
        />
        <Route
          path='/login'
          element={
            <ProtectedRoute onlyGuest>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path='/register'
          element={
            <ProtectedRoute onlyGuest>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route
          path='/forgot-password'
          element={
            <ProtectedRoute onlyGuest>
              <ForgotPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path='/reset-password'
          element={
            <ProtectedRoute onlyGuest>
              <ResetPassword />
            </ProtectedRoute>
          }
        />
        <Route
          path='/profile'
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path='/profile/orders'
          element={
            <ProtectedRoute>
              <ProfileOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path='/profile/orders/:number'
          element={
            <ProtectedRoute>
              <DetailPage title={orderTitle}>
                <OrderInfo />
              </DetailPage>
            </ProtectedRoute>
          }
        />
        <Route path='*' element={<NotFound404 />} />
      </Routes>
      {background && (
        <Routes>
          <Route
            path='/ingredients/:id'
            element={
              <Modal title='Детали ингредиента' onClose={closeModal}>
                <IngredientDetails />
              </Modal>
            }
          />
          <Route
            path='/feed/:number'
            element={
              <Modal title={orderTitle} onClose={closeModal}>
                <OrderInfo />
              </Modal>
            }
          />
          <Route
            path='/profile/orders/:number'
            element={
              <ProtectedRoute>
                <Modal title={orderTitle} onClose={closeModal}>
                  <OrderInfo />
                </Modal>
              </ProtectedRoute>
            }
          />
        </Routes>
      )}
    </div>
  );
};
export default App;
