import { fetchIngredients } from '../../services/slices/ingredients';
import {
  RequestError,
  EmptyState
} from '../../components/request-state/request-state';
import { useDispatch, useSelector } from '../../services/store';

import styles from './constructor-page.module.css';

import { BurgerIngredients } from '../../components';
import { BurgerConstructor } from '../../components';
import { Preloader } from '../../components/ui';
import { FC } from 'react';

export const ConstructorPage: FC = () => {
  const dispatch = useDispatch();
  const {
    loading: isIngredientsLoading,
    error,
    loaded,
    items
  } = useSelector((s) => s.ingredients);
  if (error)
    return (
      <RequestError
        message={error}
        retry={() => dispatch(fetchIngredients())}
      />
    );
  if (loaded && !items.length)
    return <EmptyState text='Ингредиенты пока недоступны' />;

  return (
    <>
      {isIngredientsLoading ? (
        <Preloader />
      ) : (
        <main className={styles.containerMain}>
          <h1
            className={`${styles.title} text text_type_main-large mt-10 mb-5 pl-5`}
          >
            Соберите бургер
          </h1>
          <div className={`${styles.main} pl-5 pr-5`}>
            <BurgerIngredients />
            <BurgerConstructor />
          </div>
        </main>
      )}
    </>
  );
};
