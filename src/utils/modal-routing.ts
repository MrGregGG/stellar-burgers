import { Location } from 'react-router-dom';
// A history state survives reload. The per-document marker deliberately does not.
const documentId = `${Date.now()}-${Math.random()}`;
export const modalState = (background: Location) => ({
  background,
  documentId
});
export const getModalBackground = (
  location: Location
): Location | undefined => {
  const state = location.state as {
    background?: Location;
    documentId?: string;
  } | null;
  if (state?.documentId !== documentId) return undefined;
  const path = location.pathname;
  const expected = path.startsWith('/ingredients/')
    ? '/'
    : path.startsWith('/feed/')
      ? '/feed'
      : path.startsWith('/profile/orders/')
        ? '/profile/orders'
        : null;
  return state?.background?.pathname === expected
    ? state.background
    : undefined;
};
