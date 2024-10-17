import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';
import { classNames } from '../utils/classNames';
import { Icon } from './Icon';

export interface Props extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  icon: string;
  className?: string;
}

export const IconButton: React.FC<Props> = ({ icon, className, ...props }) => (
  <button {...props} className={classNames('icon-button', className)}>
    <Icon icon={icon} />
  </button>
);
