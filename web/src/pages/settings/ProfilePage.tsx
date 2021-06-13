import React, { useState } from 'react';
import { Form } from '../../components/input/Form';
import { TextInput } from '../../components/input/TextInput';
import { useAppDispatch, useAppSelector } from '../../store';
import { useService } from '../../hooks/useService';
import { userStore } from '../../store/user';
import { ApiError } from '../../services/ApiService';
import { Layout } from '../../components/Layout';

export const ProfilePage: React.FC = () => {
  const {
    selectors,
    actions: { updateCurrentUserAsync },
  } = useService(userStore);
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectors.assertCurrentUser);
  const [username, setUsername] = useState(currentUser.username);
  const [firstName, setFirstName] = useState(currentUser.firstName);
  const [lastName, setLastName] = useState(currentUser.lastName);
  const [error, setError] = useState<ApiError>();

  return (
    <Layout className="profile-page">
      <div className="top-bar">
        <h2 className="title">Profile</h2>
      </div>
      <main>
        <Form
          onSubmit={async () => {
            setError(undefined);
            const result = await dispatch(updateCurrentUserAsync({ username, firstName, lastName }));
            if (result.type !== updateCurrentUserAsync.fulfilled.type) {
              setError(result.payload as ApiError);
            }
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
                required
                error={error?.error === 'Conflict' || error}
              />
              <TextInput
                id="firstName"
                value={firstName}
                onChange={setFirstName}
                placeholder="First Name"
                required
                error={error}
              />
              <TextInput
                id="lastName"
                value={lastName}
                onChange={setLastName}
                placeholder="Last Name"
                required
                error={error}
              />
            </div>
          </div>
        </Form>
      </main>
    </Layout>
  );
};

function getErrorMessage(error?: ApiError): string | undefined {
  if (!error) {
    return;
  }
  switch (error.error) {
    case 'Conflict':
      return 'A user with this username already exists.';
    default:
      return 'Something went wrong while updating the user.';
  }
}
