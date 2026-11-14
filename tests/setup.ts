import '@testing-library/jest-dom';
import { mockAllIsIntersecting } from 'react-intersection-observer/test-utils';
beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });
HTMLElement.prototype.scrollIntoView = jest.fn();
afterEach(() => { mockAllIsIntersecting(false); });
