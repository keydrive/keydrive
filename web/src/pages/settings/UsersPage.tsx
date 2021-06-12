import React, { useEffect, useState } from 'react';
import { SettingsLayout } from '../../components/layout/SettingsLayout';
import { useService } from '../../hooks/useService';
import { User, UserService } from '../../services/UserService';
import { Icon } from '../../components/Icon';
import { Modal } from '../../components/Modal';
import { Form } from '../../components/input/Form';
import { TextInput } from '../../components/input/TextInput';
import { PasswordInput } from '../../components/input/PasswordInput';
import { ApiError } from '../../services/ApiService';
import { Button } from '../../components/Button';

export const UsersPage: React.FC = () => {
  const userService = useService(UserService);
  const [users, setUsers] = useState<User[]>();
  const [error, setError] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editUser, setEditUser] = useState<User>();

  useEffect(() => {
    if (!users) {
      userService
        .listUsers()
        .then(setUsers)
        .catch(() => {
          setError(true);
          setUsers([]);
        });
    }
  }, [userService, users]);

  return (
    <>
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onDone={() => {
            setShowCreateModal(false);
            setUsers(undefined);
          }}
        />
      )}
      {editUser && (
        <EditUserModal
          onClose={() => setEditUser(undefined)}
          onDone={() => {
            setEditUser(undefined);
            setUsers(undefined);
          }}
          user={editUser}
        />
      )}
      <SettingsLayout className="users-page">
        <div className="title">
          <h2>Users</h2>
          <Button onClick={() => setShowCreateModal(true)} square>
            <Icon icon="plus" />
          </Button>
        </div>
        {users ? (
          <table className="clickable">
            <colgroup>
              <col className="icon" />
            </colgroup>
            <thead>
              <tr>
                <th />
                <th>Username</th>
                <th>Full Name</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => setEditUser(user)}
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setEditUser(user);
                    }
                  }}
                >
                  <td>{user.isAdmin && <Icon icon="user-shield" />}</td>
                  <td>{user.username}</td>
                  <td>
                    {user.firstName} {user.lastName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="loader">
            <Icon icon="spinner" pulse size={2} />
          </div>
        )}
        {error && <div className="error-message">Something went wrong. Please refresh the page and try again.</div>}
      </SettingsLayout>
    </>
  );
};

interface ModalProps {
  onClose: () => void;
  onDone: () => void;
}

const CreateUserModal: React.FC<ModalProps> = ({ onClose, onDone }) => {
  const userService = useService(UserService);
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<ApiError>();

  return (
    <Modal onClose={onClose} title="New User">
      <Form
        onSubmit={async () => {
          setError(undefined);

          if (password !== confirmPassword) {
            setError({
              status: 0,
              error: 'PasswordsDontMatch',
            });
            return;
          }

          await userService
            .createUser({
              username,
              firstName,
              lastName,
              password,
            })
            .then(() => onDone())
            .catch(setError);
        }}
        submitLabel="Create"
        error={getErrorMessage(error)}
      >
        <div className="columns">
          <div>
            <label htmlFor="username">Username</label>
            <label htmlFor="firstName">First Name</label>
            <label htmlFor="lastName">Last Name</label>
            <label htmlFor="password">Password</label>
            <label htmlFor="confirmPassword">Confirm Password</label>
          </div>
          <div>
            <TextInput
              id="username"
              value={username}
              onChange={setUsername}
              placeholder="Username"
              error={error?.error === 'Conflict' || error}
              autoFocus
            />
            <TextInput
              id="firstName"
              value={firstName}
              onChange={setFirstName}
              placeholder="First Name"
              error={error}
            />
            <TextInput id="lastName" value={lastName} onChange={setLastName} placeholder="Last Name" error={error} />
            <PasswordInput id="password" value={password} onChange={setPassword} error={error} />
            <PasswordInput
              id="confirmPassword"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Confirm Password"
              error={!!confirmPassword && password !== confirmPassword}
            />
          </div>
        </div>
      </Form>
    </Modal>
  );
};

const EditUserModal: React.FC<ModalProps & { user: User }> = ({ user, onClose, onDone }) => {
  const userService = useService(UserService);
  const [username, setUsername] = useState(user.username);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [error, setError] = useState<ApiError>();

  return (
    <Modal onClose={onClose} title={`Edit User: ${user.username}`}>
      <Form
        onSubmit={async () => {
          setError(undefined);
          await userService
            .updateUser(user.id, {
              username,
              firstName,
              lastName,
            })
            .then(() => onDone())
            .catch(setError);
        }}
        submitLabel="Save"
        error={getErrorMessage(error)}
      >
        <div className="columns">
          <div>
            <label htmlFor="username">Username</label>
            <label htmlFor="firstName">First Name</label>
            <label htmlFor="lastName">Last Name</label>
          </div>
          <div>
            <TextInput
              id="username"
              value={username}
              onChange={setUsername}
              placeholder="Username"
              error={error?.error === 'Conflict' || error}
              autoFocus
            />
            <TextInput
              id="firstName"
              value={firstName}
              onChange={setFirstName}
              placeholder="First Name"
              error={error}
            />
            <TextInput id="lastName" value={lastName} onChange={setLastName} placeholder="Last Name" error={error} />
          </div>
        </div>
      </Form>
    </Modal>
  );
};

function getErrorMessage(error?: ApiError): string | undefined {
  if (!error) {
    return;
  }
  switch (error.error) {
    case 'Conflict':
      return 'A user with this username already exists.';
    case 'PasswordsDontMatch':
      return 'The passwords do not match.';
    default:
      return 'Something went wrong while creating the user.';
  }
}
