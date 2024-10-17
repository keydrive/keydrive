import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function useHash(): [string, (newValue: string) => void] {
  const navigate = useNavigate();
  const location = useLocation();
  let hash = location.hash;

  // Strip a leading hash.
  if (hash.startsWith('#')) {
    hash = hash.substring(1);
  }

  const setHash = useCallback(
    (newHash: string) => {
      // Call navigate with the current search, to preserve that while changing the hash.
      navigate({
        hash: newHash,
        search: location.search,
      });
    },
    [location.search, navigate],
  );

  return [hash, setHash];
}
