import { AppHeaderUI } from '@ui';
import { useSelector } from '../../services/store';
export const AppHeader = () => (
  <AppHeaderUI userName={useSelector((s) => s.auth.user?.name)} />
);
