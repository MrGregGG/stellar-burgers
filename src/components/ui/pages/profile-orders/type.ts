import { ReactNode } from 'react';
import { TOrder } from '@utils-types';

export type ProfileOrdersUIProps = {
  status?: ReactNode;
  orders: TOrder[];
};
