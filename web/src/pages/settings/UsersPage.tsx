import React, { useEffect, useState } from 'react';
import { SettingsLayout } from '../../components/layout/SettingsLayout';
import { useService } from '../../hooks/useService';
import { User, UserService } from '../../services/UserService';
import { Icon } from '../../components/Icon';
import { Link } from 'react-router-dom';

export const UsersPage: React.FC = () => {
  const userService = useService(UserService);
  const [users, setUsers] = useState<User[]>();
  const [error, setError] = useState(false);

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
    <SettingsLayout className="users-page">
      <div className="title">
        <h2>Users</h2>
        <Link to="/settings/users/new" className="button square">
          <Icon icon="plus" />
        </Link>
      </div>
      {users ? (
        <table>
          <col className="col-icon" />
          <thead>
            <tr>
              <th />
              <th>Username</th>
              <th>Full Name</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
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
  );
};
