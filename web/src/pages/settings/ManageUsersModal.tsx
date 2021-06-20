import React, { useCallback, useEffect, useState } from 'react';
import { useService } from '../../hooks/useService';
import { User, UserService } from '../../services/UserService';
import { Modal, ModalLeftPanel, ModalRightPanel } from '../../components/Modal';

export interface Props {
  onClose: () => void;
}

export const ManageUsersModal: React.FC<Props> = ({ onClose }) => {
  const userService = useService(UserService);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<number>();
  const user = users.find(u => u.id === selectedUser);

  const refreshUsers = useCallback(() => {
    userService.listUsers().then(users => {
      setUsers(users);
      setSelectedUser(users[0].id);
    });
  }, [userService]);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  return (
    <Modal panelled onClose={onClose} title='Users'>
      <ModalLeftPanel items={users}
                      selected={selectedUser}
                      onSelect={setSelectedUser}
                      onDelete={async (id) => {
                        setSelectedUser(undefined);
                        try {
                          await userService.deleteUser(id);
                        } catch (e) {
                          alert(e.message);
                        }
                        await refreshUsers();
                      }}
                      onAdd={() => {
                        setSelectedUser(undefined);
                      }}>
        {(user: User) => (
          <>
            <h4>{user.firstName} {user.lastName}</h4>
            <span>{user.username}</span>
          </>
        )}
      </ModalLeftPanel>
      <ModalRightPanel>
        {user ? (<>
          <h2>{user?.firstName} {user?.lastName}</h2>
        </>) : (<>
          <h2>New User</h2>
        </>)}
      </ModalRightPanel>
    </Modal>
  );
};

