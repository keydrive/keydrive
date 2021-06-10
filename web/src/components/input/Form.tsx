import React, { ReactChild, useState } from 'react';
import { useMountedState } from '../../hooks/useMountedState';
import { Button } from '../Button';

export interface Props {
  onSubmit: () => void | Promise<void>;
  submitLabel: ReactChild;
  error?: string | false;
}

export const Form: React.FC<Props> = ({ children, onSubmit, submitLabel, error }) => {
  const [loading, setLoading] = useState(false);
  const mounted = useMountedState();

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (loading) {
          return;
        }
        setLoading(true);
        await onSubmit();
        if (mounted.current) {
          setLoading(false);
        }
      }}
    >
      {children}
      <Button type="submit" loading={loading}>
        {submitLabel}
      </Button>
      <div className="error-message">{error}</div>
    </form>
  );
};
