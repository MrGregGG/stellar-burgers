import { FC } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  BurgerIcon,
  ListIcon,
  Logo,
  ProfileIcon
} from '@zlden/react-developer-burger-ui-components';
import styles from './app-header.module.css';
import { TAppHeaderUIProps } from './type';
export const AppHeaderUI: FC<TAppHeaderUIProps> = ({ userName }) => {
  const { pathname } = useLocation();
  const constructorActive =
    pathname === '/' || pathname.startsWith('/ingredients/');
  const linkClass = (active: boolean) =>
    `${styles.link} ${active ? styles.link_active : ''}`;
  return (
    <header className={styles.header}>
      <nav aria-label='Основная навигация' className={`${styles.menu} p-4`}>
        <div className={styles.menu_part_left}>
          <Link
            to='/'
            className={linkClass(constructorActive)}
            aria-current={constructorActive ? 'page' : undefined}
          >
            <BurgerIcon type={constructorActive ? 'primary' : 'secondary'} />
            <p className='text text_type_main-default ml-2 mr-10'>
              Конструктор
            </p>
          </Link>
          <NavLink to='/feed' className={({ isActive }) => linkClass(isActive)}>
            {({ isActive }) => (
              <>
                <ListIcon type={isActive ? 'primary' : 'secondary'} />
                <p className='text text_type_main-default ml-2'>
                  Лента заказов
                </p>
              </>
            )}
          </NavLink>
        </div>
        <Link
          to='/'
          aria-label='Stellar Burgers — главная'
          className={styles.logo}
        >
          <Logo className='' />
        </Link>
        <div className={styles.link_position_last}>
          <NavLink
            to='/profile'
            className={({ isActive }) => linkClass(isActive)}
          >
            {({ isActive }) => (
              <>
                <ProfileIcon type={isActive ? 'primary' : 'secondary'} />
                <p className='text text_type_main-default ml-2'>
                  {userName || 'Личный кабинет'}
                </p>
              </>
            )}
          </NavLink>
        </div>
      </nav>
    </header>
  );
};
