import { render } from './__testutils__/render';
import { App } from './App';
import { waitFor } from '@testing-library/react';
import fetchMock from 'fetch-mock';
import { checkPendingMocks } from './__testutils__/checkPendingMocks';

describe('App', () => {
  afterEach(checkPendingMocks);

  it('loads userdata and libraries on boot', async () => {
    fetchMock.getOnce('end:/api/user/', {
      name: 'Test'
    });
    fetchMock.get('end:/api/libraries/?limit=100', {
      totalElements: 0,
      elements: [
        {
          id: 4,
          name: 'One',
          canWrite: false,
          type: 'generic'
        },
        {
          id: 56,
          name: 'Two',
          canWrite: false,
          type: 'generic'
        }
      ]
    });
    // the root lib will be fetched
    fetchMock.get('end:/api/libraries/4/entries?parent=', []);
    const { store } = await render(<App />, {
      loggedIn: true,
      path: '/'
    });

    await waitFor(() => expect(store.getState().libraries.libraries).toHaveLength(2));
    await waitFor(() => expect(store.getState().user.currentUser?.name).toBe('Test'));
  });
});
