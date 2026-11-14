import { deleteCookie, setCookie } from './cookie';
let generation = 0;
export const sessionGeneration = () => generation;
export const saveTokens = (data: {
  accessToken: string;
  refreshToken: string;
}) => {
  setCookie('accessToken', data.accessToken, {
    sameSite: 'Lax',
    secure: location.protocol === 'https:'
  });
  localStorage.setItem('refreshToken', data.refreshToken);
};
export const clearTokens = () => {
  generation++;
  deleteCookie('accessToken');
  localStorage.removeItem('refreshToken');
};
export const expireSession = () => {
  clearTokens();
  window.dispatchEvent(new Event('session-expired'));
};
