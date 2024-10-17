import { Navigate } from 'react-router-dom';
import { useAppDispatch } from '../store';
import { useEffect } from 'react';
import { useService } from '../hooks/useService';
import { userStore } from '../store/user';

export const LogoutPage = () => {
  const dispatch = useAppDispatch();
  const {
    actions: { logout },
  } = useService(userStore);

  useEffect(() => {
    dispatch(logout());
  }, [dispatch, logout]);

  return <Navigate to="/" />;
};
