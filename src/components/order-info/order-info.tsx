import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from '../../services/store';
import {
  fetchOrderDetails,
  clearOrderDetails
} from '../../services/slices/order-details';
import { fetchIngredients } from '../../services/slices/ingredients';
import { RequestError, EmptyState } from '../request-state/request-state';
import { FC, useMemo, useEffect } from 'react';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient } from '@utils-types';

export const OrderInfo: FC = () => {
  const { number: param } = useParams();
  const number = Number(param);
  const valid =
    /^\d+$/.test(param || '') && Number.isSafeInteger(number) && number > 0;
  const dispatch = useDispatch();
  const details = useSelector((s) => s.orderDetails);
  const catalog = useSelector((s) => s.ingredients);
  const cachedOrder = useSelector((s) =>
    [...s.feed.orders, ...s.profileOrders.orders].find(
      (o) => o.number === number
    )
  );
  const orderData =
    details.number === number && details.data ? details.data : cachedOrder;
  const ingredients = catalog.items;
  useEffect(() => {
    if (valid) dispatch(fetchOrderDetails(number));
    return () => {
      dispatch(clearOrderDetails());
    };
  }, [dispatch, number, valid]);

  /* Готовим данные для отображения */
  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = {
      [key: string]: TIngredient & { count: number };
    };

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total
    };
  }, [orderData, ingredients]);

  if (!valid) return <EmptyState text='Некорректный номер заказа' />;
  if (catalog.error)
    return (
      <RequestError
        message={catalog.error}
        retry={() => dispatch(fetchIngredients())}
      />
    );
  if (details.error && !orderData)
    return (
      <RequestError
        message={details.error}
        retry={() => dispatch(fetchOrderDetails(number))}
      />
    );
  if (details.loaded && details.number === number && !orderData)
    return <EmptyState text='Заказ не найден' />;
  if (catalog.loaded && !ingredients.length)
    return <EmptyState text='Состав заказа временно недоступен' />;
  if (!orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
