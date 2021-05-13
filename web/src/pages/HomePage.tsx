import React from 'react';
import { useAppDispatch } from '../store';
import { useService } from '../hooks/useService';
import { userStore } from '../store/user';
import { Button } from '../components/Button';

export const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    actions: { logout },
  } = useService(userStore);

  return (
    <div>
      <h1>Welcome to ClearCloud</h1>
      <Button onClick={() => dispatch(logout())}>Log out</Button>
    </div>
  );
};
