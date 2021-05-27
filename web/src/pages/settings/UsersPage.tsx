import React, { useEffect, useState } from 'react';
import { SettingsLayout } from '../../components/layout/SettingsLayout';
import { useService } from '../../hooks/useService';
import { User, UserService } from '../../services/UserService';
import { Icon } from '../../components/Icon';

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
    <SettingsLayout>
      <div className="users-list">
        {users ? (
          users.map((user) => (
            <div key={user.id} className="user">
              <div>
                {user.firstName} {user.lastName}
              </div>
            </div>
          ))
        ) : (
          <div className="loader">
            <Icon icon="spinner" pulse size={2} />
          </div>
        )}
        {error && <div className="error">Something went wrong. Please refresh the page and try again.</div>}
      </div>
    </SettingsLayout>
  );
};
