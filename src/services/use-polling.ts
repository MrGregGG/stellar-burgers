import { useEffect } from 'react';
// Refresh only mounted screens; Redux conditions prevent overlapping requests.
export const usePolling = (refresh: () => void, interval = 15000) => {
  useEffect(() => {
    refresh();
    const update = () => {
      if (document.visibilityState !== 'hidden') refresh();
    };
    const timer = window.setInterval(update, interval);
    document.addEventListener('visibilitychange', update);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', update);
    };
  }, [refresh, interval]);
};
