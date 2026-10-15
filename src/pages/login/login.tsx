import { SyntheticEvent, useEffect, useState } from 'react';
import { LoginUI } from '@ui-pages';
import { useDispatch, useSelector } from '../../services/store';
import { login, clearAuthError } from '../../services/slices/auth';
export const Login = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);
  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    if (!loading) dispatch(login({ email: email.trim(), password }));
  };
  return (
    <LoginUI
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      errorText={error}
      loading={loading}
      handleSubmit={handleSubmit}
    />
  );
};
