import React from 'react';
import { classNames } from '../utils/classNames';

export interface Props {
  icon: string;
  className?: string;
  pulse?: boolean;
  size?: number;
  iconStyle?: 'solid' | 'regular' | 'brands';
}

export const Icon: React.FC<Props> = ({ icon, className, pulse, size, iconStyle = 's' }) => (
  <i
    className={classNames(
      `icon fa${iconStyle?.substring(0, 1)} fa-${icon}`,
      pulse && 'fa-pulse',
      !!size && `fa-${size}x`,
      className
    )}
  />
);
