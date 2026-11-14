import React, { FC, memo } from 'react';
import styles from './burger-constructor-element.module.css';
import { ConstructorElement } from '@zlden/react-developer-burger-ui-components';
import { BurgerConstructorElementUIProps } from './type';
import {
  ArrowUpIcon,
  ArrowDownIcon
} from '@zlden/react-developer-burger-ui-components';

export const BurgerConstructorElementUI: FC<BurgerConstructorElementUIProps> =
  memo(
    ({
      ingredient,
      index,
      totalItems,
      handleMoveUp,
      handleMoveDown,
      handleClose
    }) => (
      <li
        data-testid='constructor-item'
        className={`${styles.element} mb-4 mr-2`}
      >
        <div className={styles.moveButtons}>
          <button
            type='button'
            className={styles.moveButton}
            aria-label={`Переместить вверх: ${ingredient.name}`}
            disabled={index === 0}
            onClick={handleMoveUp}
          >
            <ArrowUpIcon type={index === 0 ? 'disabled' : 'primary'} />
          </button>
          <button
            type='button'
            className={styles.moveButton}
            aria-label={`Переместить вниз: ${ingredient.name}`}
            disabled={index === totalItems - 1}
            onClick={handleMoveDown}
          >
            <ArrowDownIcon
              type={index === totalItems - 1 ? 'disabled' : 'primary'}
            />
          </button>
        </div>
        <div className={`${styles.element_fullwidth} ml-2`}>
          <ConstructorElement
            text={ingredient.name}
            price={ingredient.price}
            thumbnail={ingredient.image}
            handleClose={handleClose}
          />
          <button
            type='button'
            className={styles.removeButton}
            aria-label={`Удалить: ${ingredient.name}`}
            onClick={handleClose}
          />
        </div>
      </li>
    )
  );
