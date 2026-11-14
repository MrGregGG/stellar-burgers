import { useRef, useState, SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPasswordApi } from '@api';
import { ForgotPasswordUI } from '@ui-pages';
import { errorMessage } from '../../utils/errors';
export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const busy = useRef(false);
  const navigate = useNavigate();
  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (busy.current) return;
    busy.current = true;
    setLoading(true);
    setError('');
    try {
      await forgotPasswordApi({ email: email.trim() });
      sessionStorage.setItem('resetPassword', 'true');
      navigate('/reset-password', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      busy.current = false;
      setLoading(false);
    }
  };
  return (
    <ForgotPasswordUI
      errorText={error}
      loading={loading}
      email={email}
      setEmail={setEmail}
      handleSubmit={handleSubmit}
    />
  );
};
