import React from 'react';
import { useAppSelector } from '../store';
import { useService } from '../hooks/useService';
import { librariesStore } from '../store/libraries';
import { Navigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const {
    selectors: { libraries },
  } = useService(librariesStore);
  const libs = useAppSelector(libraries);
  if (libs?.[0]) {
    return <Navigate to={`/files/${libs[0].id}`} />;
  } else {
    return <Navigate to="/settings" />;
  }
};
