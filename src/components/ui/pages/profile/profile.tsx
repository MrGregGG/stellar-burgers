import { FC } from 'react';

import { Button, Input } from '@zlden/react-developer-burger-ui-components';
import styles from './profile.module.css';
import commonStyles from '../common.module.css';

import { ProfileUIProps } from './type';
import { ProfileMenu } from '@components';

export const ProfileUI: FC<ProfileUIProps> = ({
  formValue,
  loading,
  isFormChanged,
  updateUserError,
  handleSubmit,
  handleCancel,
  handleInputChange
}) => (
  <main className={`${commonStyles.container}`}>
    <div className={`mt-30 mr-15 ${styles.menu}`}>
      <ProfileMenu />
    </div>
    <form
      className={`mt-30 ${styles.form} ${commonStyles.form}`}
      onSubmit={handleSubmit}
    >
      <>
        <div className='pb-6'>
          <Input
            disabled={loading}
            type={'text'}
            placeholder={'Имя'}
            aria-label='Имя'
            onChange={handleInputChange}
            value={formValue.name}
            name={'name'}
            required
            error={false}
            errorText={''}
            size={'default'}
            icon={'EditIcon'}
          />
        </div>
        <div className='pb-6'>
          <Input
            disabled={loading}
            type={'email'}
            placeholder={'E-mail'}
            aria-label='E-mail'
            onChange={handleInputChange}
            value={formValue.email}
            name={'email'}
            required
            error={false}
            errorText={''}
            size={'default'}
            icon={'EditIcon'}
          />
        </div>
        <div className='pb-6'>
          <Input
            disabled={loading}
            type={'password'}
            placeholder={'Пароль'}
            aria-label='Пароль'
            onChange={handleInputChange}
            value={formValue.password}
            name={'password'}
            minLength={6}
            error={false}
            errorText={''}
            size={'default'}
            icon={'EditIcon'}
          />
        </div>
        {isFormChanged && (
          <div className={styles.button}>
            <Button
              type='secondary'
              htmlType='button'
              size='medium'
              onClick={handleCancel}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button
              type='primary'
              size='medium'
              htmlType='submit'
              disabled={loading}
            >
              Сохранить
            </Button>
          </div>
        )}
        {updateUserError && (
          <p
            role='alert'
            className={`${commonStyles.error} pt-5 text text_type_main-default`}
          >
            {updateUserError}
          </p>
        )}
      </>
    </form>
  </main>
);
