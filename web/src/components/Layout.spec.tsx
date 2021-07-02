import { checkPendingMocks } from '../__testutils__/checkPendingMocks';
import { render } from '../__testutils__/render';
import { Layout } from './Layout';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';

describe('Layout', () => {
  afterEach(checkPendingMocks);

  it('displays the libraries', async () => {
    const { navigation } = await render(<Layout />, {
      initialState: {
        libraries: {
          libraries: [
            {
              id: 1,
              name: 'Documents',
              type: 'generic',
              canWrite: true,
            },
            {
              id: 2,
              name: 'Movies',
              type: 'movies',
              canWrite: false,
            },
          ],
        },
      },
    });

    expect(screen.getByText('Documents')).toBeDefined();
    await userEvent.click(screen.getByText('Movies'));
    expect(navigation.pathname).toBe('/files/2');
  });

  it('loads the libraries if they are not in state', async () => {
    fetchMock.getOnce('path:/api/libraries/', {
      status: 200,
      body: {
        totalElements: 2,
        elements: [
          {
            id: 1,
            name: 'Documents',
            type: 'generic',
            canWrite: true,
          },
        ],
      },
    });

    await render(<Layout />, { loggedIn: true });

    expect(await screen.findByText('Documents')).toBeDefined();
  });
});
