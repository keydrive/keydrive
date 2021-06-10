import React from 'react';
import { ApiError } from '../../services/ApiService';
import { classNames } from '../../utils/classNames';

export interface Props {
  id: string;
  className?: string;
  error?: boolean | ApiError;
}

export const Field: React.FC<Props> = ({ children, id, className, error }) => {
  return <div className={classNames('field', className, hasError(id, error) && 'field-error')}>{children}</div>;
};

function hasError(id: string, error?: unknown): boolean {
  if (error === true) {
    return true;
  }

  if (!isValidationError(error)) {
    return false;
  }

  return !!error.details.find((d) => d.field === id);
}

type ValidationError = ApiError & Required<Pick<ApiError, 'details'>>;

function isValidationError(error?: unknown): error is ValidationError {
  return !!(
    error &&
    typeof error === 'object' &&
    'details' in error &&
    // We know for sure the error object contains a details property.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    Array.isArray(error.details)
  );
}