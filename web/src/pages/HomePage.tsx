import React from 'react';
import { useAppSelector } from '../store';
import { useService } from '../hooks/useService';
import { librariesStore } from '../store/libraries';
import { Redirect } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const {
    selectors: { libraries },
  } = useService(librariesStore);
  const libs = useAppSelector(libraries);
  if (libs && libs[0]) {
    return <Redirect to={`/files/${libs[0].id}`} />;
  } else {
    return <Redirect to="/settings" />;
  }
};
