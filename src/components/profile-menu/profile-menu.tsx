import { useLocation } from 'react-router-dom';
import { ProfileMenuUI } from '@ui';
import { useDispatch, useSelector } from '../../services/store';
import { logout } from '../../services/slices/auth';
export const ProfileMenu = () => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const loading = useSelector((s) => s.auth.loading);
  return (
    <ProfileMenuUI
      handleLogout={() => {
        if (!loading) dispatch(logout());
      }}
      pathname={pathname}
    />
  );
};
