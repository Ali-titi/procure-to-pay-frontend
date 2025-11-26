import { useMemo } from 'react';

export const useApiBaseUrl = () => {
  return useMemo(() => {
    return 'http://procuretopay-backend-production-bf14.up.railway.app';
  }, []);
};