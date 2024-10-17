import { ReallyDeepPartial, render } from '../__testutils__/render';
import { RootState } from '../store';
import { SettingsPage } from './SettingsPage';
import { fireEvent, screen } from '@testing-library/react';

describe.skip('SettingsPage', () => {
  it('redirects to other routes when modals are clicked', async () => {
    const initialState: ReallyDeepPartial<RootState> = {
      libraries: {
        libraries: [],
      },
      user: {
        currentUser: {
          id: 1,
          name: 'Admin',
          username: 'admin',
          isAdmin: true,
        },
      },
    };
    const { navigation } = await render(<SettingsPage />, {
      path: '/settings/nope',
      route: '/settings/:setting',
      loggedIn: true,
      initialState,
    });
    expect(navigation.pathname).toBe('/settings/nope');
    fireEvent.click(screen.getByText('Change Password'));
    expect(navigation.pathname).toBe('/settings/password');

    fireEvent.click(screen.getByText('Manage Libraries'));
    expect(navigation.pathname).toBe('/settings/libraries');

    fireEvent.click(screen.getByText('Edit Profile'));
    expect(navigation.pathname).toBe('/settings/profile');
  });
});
