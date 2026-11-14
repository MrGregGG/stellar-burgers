import { FC } from 'react';

import { Input, Button } from '@zlden/react-developer-burger-ui-components';
import styles from '../common.module.css';
import { Link } from 'react-router-dom';
import { PageUIProps } from '../common-type';

export const ForgotPasswordUI: FC<PageUIProps> = ({
  loading,
  errorText,
  email,
  setEmail,
  handleSubmit
}) => (
  <main className={styles.container}>
    <div className={`pt-6 ${styles.wrapCenter}`}>
      <h3 className='pb-6 text text_type_main-medium'>Восстановление пароля</h3>
      <form
        className={`pb-15 ${styles.form}`}
        name='login'
        onSubmit={handleSubmit}
      >
        <div className='pb-6'>
          <Input
            required
            disabled={loading}
            type='email'
            placeholder='Укажите e-mail'
            aria-label='Укажите e-mail'
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            name='email'
            error={false}
            errorText=''
            size='default'
          />
        </div>
        <div className={`pb-6 ${styles.button}`}>
          <Button
            type='primary'
            size='medium'
            htmlType='submit'
            disabled={loading}
          >
            Восстановить
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
        {loading && (
          <p role='status' className='text text_type_main-default'>
            Подождите…
          </p>
        )}
      </form>
      <div className={`${styles.question} text text_type_main-default pb-6`}>
        Вспомнили пароль?
        <Link to={'/login'} className={`pl-2 ${styles.link}`}>
          Войти
        </Link>
      </div>
    </div>
  </main>
);
