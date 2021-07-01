import { checkPendingMocks } from '../__testutils__/checkPendingMocks';
import fetchMock from 'fetch-mock';
import { render } from '../__testutils__/render';
import { FilesPage } from './FilesPage';
import { screen } from '@testing-library/react';

describe('FilesPage', () => {
  afterEach(checkPendingMocks);

  it('shows the files', async () => {
    fetchMock.getOnce('path:/api/libraries/', {
      status: 200,
      body: [
        {
          id: 4,
          name: 'Mock Library',
          type: 'generic',
          canWrite: true,
        },
      ],
    });
    fetchMock.getOnce('path:/api/libraries/4', {
      status: 200,
      body: {
        id: 4,
        name: 'Mock Library',
        type: 'generic',
        canWrite: true,
      },
    });
    fetchMock.getOnce(
      {
        url: 'path:/api/libraries/4/entries',
        query: {
          parent: '',
        },
      },
      {
        status: 200,
        body: [
          {
            name: 'Ballmers Peak Label.xcf',
            parent: '/',
            modified: '2021-03-26T23:32:42.139992387+01:00',
            category: 'Binary',
            size: 2785246,
          },
          {
            name: 'Documents',
            parent: '/',
            modified: '2021-07-01T19:35:16.658563977+02:00',
            category: 'Folder',
            size: 4096,
          },
        ],
      }
    );

    await render(<FilesPage />, {
      path: '/files/4',
      route: '/files/:library/:path*',
      initialState: {
        user: {
          token: 'mock-token',
        },
      },
    });

    expect(await screen.findByText('Mock Library', { selector: 'h1' })).toBeDefined();
    expect(await screen.findByText('Ballmers Peak Label.xcf')).toBeDefined();
    expect(await screen.findByText('2.7 MB')).toBeDefined();
  });
});
