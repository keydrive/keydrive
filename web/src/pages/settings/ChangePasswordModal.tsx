import { useState } from 'react';
import { useService } from '../../hooks/useService';
import { UserService } from '../../services/UserService';
import { Modal } from '../../components/Modal';
import { Form } from '../../components/input/Form';
import { PasswordInput } from '../../components/input/PasswordInput';
import { errorMessage } from '../../utils/errorMessage';

export interface Props {
  onClose: () => void;
}

export const ChangePasswordModal = ({ onClose }: Props) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string>();
  const userService = useService(UserService);

  return (
    <Modal shouldClose={done} onClose={onClose} title="Change Password">
      <Form
        error={error}
        onSubmit={async () => {
          setError(undefined);
          if (password !== confirm) {
            setError('Make sure both passwords match');
            return;
          }
          try {
            await userService.updateCurrentUser({
              password,
            });
            setDone(true);
          } catch (e) {
            setError(errorMessage(e));
          }
        }}
        submitLabel="Change"
      >
        <PasswordInput
          autoFocus
          required
          label="Password"
          value={password}
          onChange={setPassword}
          id="password"
        />
        <PasswordInput
          required
          label="Confirm"
          value={confirm}
          onChange={setConfirm}
          id="confirm"
        />
      </Form>
    </Modal>
  );
};
