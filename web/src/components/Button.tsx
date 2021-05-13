import React from 'react';

export interface Props {
  onClick: () => void;
}

export const Button: React.FC<Props> = ({ children, onClick }) => (
  <button className="button" onClick={onClick}>
    {children}
  </button>
);
