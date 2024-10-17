import { Redirect } from 'react-router-dom';
import { useAppDispatch } from '../store';
import { useEffect } from 'react';
import { useService } from '../hooks/useService';
import { userStore } from '../store/user';

export const LogoutPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    actions: { logout },
  } = useService(userStore);

  useEffect(() => {
    dispatch(logout());
  }, [dispatch, logout]);

  return <Redirect to="/" />;
};
