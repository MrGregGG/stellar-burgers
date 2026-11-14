import { useCallback } from 'react';
import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { useDispatch, useSelector } from '../../services/store';
import { fetchFeed } from '../../services/slices/feed';
import { fetchIngredients } from '../../services/slices/ingredients';
import { usePolling } from '../../services/use-polling';
import {
  RequestError,
  EmptyState
} from '../../components/request-state/request-state';
export const Feed = () => {
  const dispatch = useDispatch();
  const feed = useSelector((s) => s.feed);
  const ingredients = useSelector((s) => s.ingredients);
  const refresh = useCallback(() => {
    dispatch(fetchFeed());
  }, [dispatch]);
  usePolling(refresh);
  if (
    (!feed.loaded && !feed.error) ||
    (!ingredients.loaded && !ingredients.error)
  )
    return <Preloader />;
  return (
    <>
      {ingredients.error && (
        <RequestError
          message={ingredients.error}
          retry={() => dispatch(fetchIngredients())}
        />
      )}
      {feed.error && <RequestError message={feed.error} retry={refresh} />}
      {feed.loaded && !feed.orders.length && (
        <EmptyState text='Заказов пока нет' />
      )}
      <FeedUI orders={feed.orders} handleGetFeeds={refresh} />
    </>
  );
};
