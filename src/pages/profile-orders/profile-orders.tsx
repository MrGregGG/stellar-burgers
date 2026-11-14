import { useCallback } from 'react';
import { ProfileOrdersUI } from '@ui-pages';
import { Preloader } from '@ui';
import { useDispatch, useSelector } from '../../services/store';
import { fetchProfileOrders } from '../../services/slices/profile-orders';
import { fetchIngredients } from '../../services/slices/ingredients';
import { usePolling } from '../../services/use-polling';
import {
  RequestError,
  EmptyState
} from '../../components/request-state/request-state';
export const ProfileOrders = () => {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.profileOrders);
  const ingredients = useSelector((s) => s.ingredients);
  const refresh = useCallback(() => {
    dispatch(fetchProfileOrders());
  }, [dispatch]);
  usePolling(refresh);
  const loading =
    (!state.loaded && !state.error) ||
    (!ingredients.loaded && !ingredients.error);
  return (
    <ProfileOrdersUI
      orders={state.orders}
      status={
        <>
          {state.error && (
            <RequestError message={state.error} retry={refresh} />
          )}
          {ingredients.error && (
            <RequestError
              message={ingredients.error}
              retry={() => dispatch(fetchIngredients())}
            />
          )}
          {loading && <Preloader />}
          {state.loaded && !state.orders.length && (
            <EmptyState text='Вы ещё не сделали ни одного заказа' />
          )}
        </>
      }
    />
  );
};
