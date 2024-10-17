import { ReactNode, useState } from 'react';
import { useMountedState } from '../../hooks/useMountedState';
import { Button } from '../Button';

export interface Props {
  onSubmit: () => void | Promise<void>;
  submitLabel: ReactNode;
  error?: string | false;
  children: ReactNode;
}

export const Form = ({ children, onSubmit, submitLabel, error }: Props) => {
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
      <Button type="submit" primary loading={loading}>
        {submitLabel}
      </Button>
      {error && <div className="error-message">{error}</div>}
    </form>
  );
};
