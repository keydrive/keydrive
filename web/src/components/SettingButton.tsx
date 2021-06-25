import React from 'react';

export interface Props {
  icon: string;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

export const SettingButton: React.FC<Props> = ({ icon, label, onClick, disabled }) => (
  <button className="setting-button" onClick={onClick} disabled={disabled} title={disabled ? 'Coming soon' : undefined}>
    <i className={`fas fa-${icon}`} />
    <span>{label}</span>
  </button>
);
