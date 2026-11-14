import { FC, useState } from 'react';
import {
  Input,
  Button,
  PasswordInput
} from '@zlden/react-developer-burger-ui-components';
import styles from '../common.module.css';
import { Link } from 'react-router-dom';
import { RegisterUIProps } from './type';

export const RegisterUI: FC<RegisterUIProps> = ({
  loading,
  errorText,
  email,
  setEmail,
  handleSubmit,
  password,
  setPassword,
  userName,
  setUserName
}) => (
  <main className={styles.container}>
    <div className={`pt-6 ${styles.wrapCenter}`}>
      <h3 className='pb-6 text text_type_main-medium'>Регистрация</h3>
      <form
        className={`pb-15 ${styles.form}`}
        name='register'
        onSubmit={handleSubmit}
      >
        <>
          <div className='pb-6'>
            <Input
              required
              disabled={loading}
              type='text'
              placeholder='Имя'
              aria-label='Имя'
              onChange={(e) => setUserName(e.target.value)}
              value={userName}
              name='name'
              error={false}
              errorText=''
              size='default'
            />
          </div>
          <div className='pb-6'>
            <Input
              required
              disabled={loading}
              type='email'
              placeholder='E-mail'
              aria-label='E-mail'
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              name={'email'}
              error={false}
              errorText=''
              size={'default'}
            />
          </div>
          <div className='pb-6'>
            <PasswordInput
              aria-label='Пароль'
              required
              minLength={6}
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              name='password'
            />
          </div>
          <div className={`pb-6 ${styles.button}`}>
            <Button
              type='primary'
              size='medium'
              htmlType='submit'
              disabled={loading}
            >
              Зарегистрироваться
            </Button>
          </div>
          {errorText && (
            <p
              role='alert'
              className={`${styles.error} text text_type_main-default pb-6`}
            >
              {errorText}
            </p>
          )}
        </>
        {loading && (
          <p role='status' className='text text_type_main-default'>
            Подождите…
          </p>
        )}
      </form>
      <div className={`${styles.question} text text_type_main-default pb-6`}>
        Уже зарегистрированы?
        <Link to='/login' className={`pl-2 ${styles.link}`}>
          Войти
        </Link>
      </div>
    </div>
  </main>
);
