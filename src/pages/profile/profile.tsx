import { ProfileUI } from '@ui-pages';
import { ChangeEvent, SyntheticEvent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { clearAuthError, updateUser } from '../../services/slices/auth';
export const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((s) => s.auth);
  const [formValue, setFormValue] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: ''
  });
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);
  useEffect(() => {
    setFormValue({
      name: user?.name || '',
      email: user?.email || '',
      password: ''
    });
  }, [user?.name, user?.email]);
  const isFormChanged =
    formValue.name !== user?.name ||
    formValue.email !== user?.email ||
    !!formValue.password;
  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (loading || !isFormChanged || !user) return;
    const changes: { name?: string; email?: string; password?: string } = {};
    if (formValue.name !== user.name) changes.name = formValue.name.trim();
    if (formValue.email !== user.email) changes.email = formValue.email.trim();
    if (formValue.password) changes.password = formValue.password;
    const result = await dispatch(updateUser(changes));
    if (updateUser.fulfilled.match(result))
      setFormValue({ ...result.payload, password: '' });
  };
  const handleCancel = (e: SyntheticEvent) => {
    e.preventDefault();
    setFormValue({
      name: user?.name || '',
      email: user?.email || '',
      password: ''
    });
    dispatch(clearAuthError());
  };
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) =>
    setFormValue((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  return (
    <ProfileUI
      formValue={formValue}
      isFormChanged={isFormChanged}
      loading={loading}
      updateUserError={error}
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      handleInputChange={handleInputChange}
    />
  );
};
