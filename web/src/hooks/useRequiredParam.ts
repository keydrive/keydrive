import { useParams } from 'react-router-dom';

export function useRequiredParam(name: string): string {
  const value = useParams()[name];
  if (value == null) {
    throw new Error(`Required param not set: ${name}`);
  }
  return value;
}
