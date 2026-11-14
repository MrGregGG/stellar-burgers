import { SyntheticEvent, useEffect, useState } from 'react';
import { RegisterUI } from '@ui-pages';
import { useDispatch, useSelector } from '../../services/store';
import { register, clearAuthError } from '../../services/slices/auth';
export const Register = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);
  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    if (!loading)
      dispatch(
        register({ name: userName.trim(), email: email.trim(), password })
      );
  };
  return (
    <RegisterUI
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      userName={userName}
      setUserName={setUserName}
      errorText={error}
      loading={loading}
      handleSubmit={handleSubmit}
    />
  );
};
