import { useDispatch } from '../../services/store';
import { addIngredient } from '../../services/slices/burger-constructor';
import { modalState } from '../../utils/modal-routing';
import { FC, memo } from 'react';
import { useLocation } from 'react-router-dom';

import { BurgerIngredientUI } from '@ui';
import { TBurgerIngredientProps } from './type';

export const BurgerIngredient: FC<TBurgerIngredientProps> = memo(
  ({ ingredient, count }) => {
    const location = useLocation();

    const dispatch = useDispatch();
    const handleAdd = () => {
      dispatch(addIngredient(ingredient));
    };

    return (
      <BurgerIngredientUI
        ingredient={ingredient}
        count={count}
        locationState={modalState(location)}
        handleAdd={handleAdd}
      />
    );
  }
);
