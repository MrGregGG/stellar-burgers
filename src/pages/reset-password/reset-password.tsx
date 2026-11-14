import { SyntheticEvent, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { resetPasswordApi } from '@api';
import { ResetPasswordUI } from '@ui-pages';
import { errorMessage } from '../../utils/errors';
export const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const busy = useRef(false);
  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setLoading(true);
    setError('');
    try {
      await resetPasswordApi({ password, token: token.trim() });
      sessionStorage.removeItem('resetPassword');
      navigate('/login', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      busy.current = false;
      setLoading(false);
    }
  };
  if (!sessionStorage.getItem('resetPassword'))
    return <Navigate to='/forgot-password' replace />;
  return (
    <ResetPasswordUI
      errorText={error}
      loading={loading}
      password={password}
      token={token}
      setPassword={setPassword}
      setToken={setToken}
      handleSubmit={handleSubmit}
    />
  );
};
