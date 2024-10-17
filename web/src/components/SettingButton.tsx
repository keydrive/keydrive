export interface Props {
  icon: string;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

export const SettingButton = ({ icon, label, onClick, disabled }: Props) => (
  <button
    className="setting-button"
    onClick={onClick}
    disabled={disabled}
    title={disabled ? 'Coming soon' : undefined}
  >
    <i className={`fas fa-${icon}`} />
    <span>{label}</span>
  </button>
);
