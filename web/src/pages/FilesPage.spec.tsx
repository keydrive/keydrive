import { checkPendingMocks } from '../__testutils__/checkPendingMocks';
import fetchMock from 'fetch-mock';
import { render } from '../__testutils__/render';
import { FilesPage } from './FilesPage';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('FilesPage', () => {
  afterEach(checkPendingMocks);

  beforeEach(() => {
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
  });

  it('shows the files', async () => {
    await render(<FilesPage />, {
      path: '/files/4',
      route: '/files/:library/:path*',
      loggedIn: true,
    });

    expect(await screen.findByText('Mock Library', { selector: 'h1' })).toBeDefined();
    expect(await screen.findByText('Ballmers Peak Label.xcf')).toBeDefined();
    expect(await screen.findByText('2.7 MB')).toBeDefined();
  });

  it('shows file details', async () => {
    await render(<FilesPage />, {
      path: '/files/4',
      route: '/files/:library/:path*',
      loggedIn: true,
    });

    expect(await screen.findByText('Ballmers Peak Label.xcf')).toBeDefined();
    expect(screen.queryByText('Ballmers Peak Label.xcf', { selector: '.details *' })).toBeNull();
    await userEvent.click(screen.getByText('Ballmers Peak Label.xcf'));
    expect(screen.getByText('Ballmers Peak Label.xcf', { selector: '.details *' })).toBeDefined();
    await userEvent.click(screen.getByLabelText('Close details'));
    expect(screen.queryByText('Ballmers Peak Label.xcf', { selector: '.details *' })).toBeNull();
  });

  it('enters a directory on double click', async () => {
    fetchMock.getOnce(
      {
        url: 'path:/api/libraries/4/entries',
        query: {
          parent: 'Documents',
        },
        overwriteRoutes: false,
      },
      {
        status: 200,
        body: [
          {
            name: 'ClearCloud Settings.pdf',
            parent: '/Documents',
            modified: '2021-06-16T09:52:47.769779842+02:00',
            category: 'Binary',
            size: 3570049,
          },
        ],
      }
    );

    const { navigation } = await render(<FilesPage />, {
      path: '/files/4',
      route: '/files/:library/:path*',
      loggedIn: true,
    });

    await userEvent.dblClick(await screen.findByText('Documents'));
    expect(await screen.findByText('ClearCloud Settings.pdf')).toBeDefined();
    expect(navigation.pathname).toBe('/files/4/Documents');
  });

  it('enters the parent directory when going up', async () => {
    fetchMock.getOnce(
      {
        url: 'path:/api/libraries/4/entries',
        query: {
          parent: 'Documents',
        },
        overwriteRoutes: false,
      },
      {
        status: 200,
        body: [
          {
            name: 'ClearCloud Settings.pdf',
            parent: '/Documents',
            modified: '2021-06-16T09:52:47.769779842+02:00',
            category: 'Binary',
            size: 3570049,
          },
        ],
      }
    );

    const { navigation } = await render(<FilesPage />, {
      path: '/files/4/Documents',
      route: '/files/:library/:path*',
      loggedIn: true,
    });

    expect(await screen.findByText('ClearCloud Settings.pdf')).toBeDefined();
    await userEvent.click(screen.getByLabelText('Parent directory'));
    expect(await screen.findByText('Documents')).toBeDefined();
    expect(navigation.pathname).toBe('/files/4');
  });
});
