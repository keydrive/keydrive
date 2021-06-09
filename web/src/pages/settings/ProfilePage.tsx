import React, { useState } from 'react';
import { SettingsLayout } from '../../components/layout/SettingsLayout';
import { Form } from '../../components/input/Form';
import { TextInput } from '../../components/input/TextInput';
import { useAppSelector } from '../../store';
import { useService } from '../../hooks/useService';
import { userStore } from '../../store/user';

export const ProfilePage: React.FC = () => {
  const user = useService(userStore);
  const currentUser = useAppSelector(user.selectors.assertCurrentUser);
  const [username, setUsername] = useState(currentUser.username);
  const [firstName, setFirstName] = useState(currentUser.firstName);
  const [lastName, setLastName] = useState(currentUser.lastName);

  return (
    <SettingsLayout className="profile-page">
      <h2 className="title">Profile</h2>
      <Form onSubmit={() => undefined} submitLabel="Save">
        <div className="columns">
          <div>
            <label htmlFor="username">Username</label>
            <label htmlFor="firstName">First Name</label>
            <label htmlFor="lastName">Last Name</label>
          </div>
          <div className="inputs">
            <TextInput id="username" value={username} onChange={setUsername} placeholder="Username" />
            <TextInput id="firstName" value={firstName} onChange={setFirstName} placeholder="First Name" />
            <TextInput id="lastName" value={lastName} onChange={setLastName} placeholder="Last Name" />
          </div>
        </div>
      </Form>
    </SettingsLayout>
  );
};
