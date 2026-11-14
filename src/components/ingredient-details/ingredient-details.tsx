import { useParams } from 'react-router-dom';
import { Preloader, IngredientDetailsUI } from '@ui';
import { useDispatch, useSelector } from '../../services/store';
import { fetchIngredients } from '../../services/slices/ingredients';
import { RequestError, EmptyState } from '../request-state/request-state';
export const IngredientDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { items, loading, loaded, error } = useSelector((s) => s.ingredients);
  if (error)
    return (
      <RequestError
        message={error}
        retry={() => dispatch(fetchIngredients())}
      />
    );
  if (loading || !loaded) return <Preloader />;
  const ingredient = items.find((i) => i._id === id);
  return ingredient ? (
    <IngredientDetailsUI ingredientData={ingredient} />
  ) : (
    <EmptyState text='Ингредиент не найден' />
  );
};
