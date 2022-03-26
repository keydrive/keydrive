import { checkPendingMocks } from '../../__testutils__/checkPendingMocks';
import { ReallyDeepPartial, render } from '../../__testutils__/render';
import { RootState } from '../../store';
import fetchMock from 'fetch-mock';
import { screen } from '@testing-library/react';
import { MoveModal } from './MoveModal';
import userEvent from '@testing-library/user-event';

const initialState: ReallyDeepPartial<RootState> = {
  libraries: {
    libraries: [
      {
        id: 4,
        name: 'Mock Library',
        type: 'generic',
        canWrite: true,
      },
    ],
  },
};

describe('MoveModal', () => {
  afterEach(checkPendingMocks);

  beforeEach(() => {
    fetchMock.getOnce(
      {
        url: 'path:/api/libraries/4/entries',
        query: {
          parent: '/',
        },
      },
      {
        status: 200,
        body: [
          {
            name: 'subdir',
            parent: '/',
            modified: '2021-07-01T19:35:16.658563977+02:00',
            category: 'Folder',
            size: 4096,
          },
        ],
      }
    );
  });

  it('shows the entries', async () => {
    await render(<MoveModal onClose={jest.fn()} libraryId="4" startPath="/" onMove={jest.fn()} />, {
      initialState,
      loggedIn: true,
    });

    expect(await screen.findByText('subdir')).toBeDefined();
  });

  it('enters the parent directory when going up', async () => {
    fetchMock.getOnce(
      {
        url: 'path:/api/libraries/4/entries',
        query: {
          path: '/subdir',
        },
        overwriteRoutes: false,
      },
      {
        status: 200,
        body: [
          {
            name: 'subdir',
            parent: '/',
            modified: '2021-07-01T19:35:16.658563977+02:00',
            category: 'Folder',
            size: 4096,
          },
        ],
      }
    );
    fetchMock.getOnce(
      {
        url: 'path:/api/libraries/4/entries',
        query: {
          parent: '/subdir',
        },
        overwriteRoutes: false,
      },
      {
        status: 200,
        body: [
          {
            name: 'another',
            parent: '/subdir',
            modified: '2021-07-01T19:35:16.658563977+02:00',
            category: 'Folder',
            size: 4096,
          },
        ],
      }
    );

    await render(<MoveModal onClose={jest.fn()} libraryId="4" startPath="/subdir" onMove={jest.fn()} />, {
      initialState,
      loggedIn: true,
    });

    expect(await screen.findByText('another')).toBeDefined();
    userEvent.click(screen.getByLabelText('Parent directory'));
    expect(await screen.findByText('subdir')).toBeDefined();
  });
});
