import { useNavigate, useLocation } from 'react-router-dom';
import { BurgerConstructorUI } from '@ui';
import { useDispatch, useSelector } from '../../services/store';
import { selectConstructor, selectPrice } from '../../services/selectors';
import { createOrder, closeOrder } from '../../services/slices/order';
export const BurgerConstructor = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const constructorItems = useSelector(selectConstructor);
  const price = useSelector(selectPrice);
  const { user, checked } = useSelector((s) => s.auth);
  const { loading, data, error, modalOpen } = useSelector((s) => s.order);
  const onOrderClick = () => {
    if (!constructorItems.bun || loading || !checked) return;
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    dispatch(createOrder());
  };
  return (
    <BurgerConstructorUI
      constructorItems={constructorItems}
      price={price}
      orderRequest={loading}
      modalOpen={modalOpen}
      orderModalData={data}
      error={error}
      disabled={!checked}
      onOrderClick={onOrderClick}
      closeOrderModal={() => {
        dispatch(closeOrder());
      }}
    />
  );
};
