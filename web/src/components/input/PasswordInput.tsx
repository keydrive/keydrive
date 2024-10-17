import { useState } from 'react';
import { Props as TextInputProps, TextInput } from './TextInput';

export type Props = Omit<
  TextInputProps,
  'type' | 'iconButton' | 'onButtonClick'
>;

export const PasswordInput: React.FC<Props> = (props) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextInput
      {...props}
      type={showPassword ? 'text' : 'password'}
      iconButton={showPassword ? 'eye-slash' : 'eye'}
      onButtonClick={() => setShowPassword(!showPassword)}
    />
  );
};
