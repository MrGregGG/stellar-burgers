import { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from '../../services/store';
import { Preloader } from '@ui';
export const ProtectedRoute = ({
  children,
  onlyGuest = false
}: {
  children: ReactElement;
  onlyGuest?: boolean;
}) => {
  const { user, checked } = useSelector((s) => s.auth);
  const location = useLocation();
  if (!checked) return <Preloader />;
  if (!onlyGuest && !user)
    return <Navigate to='/login' state={{ from: location }} replace />;
  if (onlyGuest && user) {
    const from = (
      location.state as {
        from?: { pathname: string; search?: string; hash?: string };
      } | null
    )?.from;
    const target =
      from &&
      !['/login', '/register', '/forgot-password', '/reset-password'].includes(
        from.pathname
      )
        ? from
        : { pathname: '/' };
    return <Navigate to={target} replace />;
  }
  return children;
};
