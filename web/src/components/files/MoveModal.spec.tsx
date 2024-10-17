import { checkPendingMocks } from '../../__testutils__/checkPendingMocks';
import { ReallyDeepPartial, render } from '../../__testutils__/render';
import { RootState } from '../../store';
import fetchMock from 'fetch-mock';
import { screen } from '@testing-library/react';
import { MoveModal } from './MoveModal';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

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
      },
    );
  });

  it('shows the entries', async () => {
    await render(<MoveModal onClose={vi.fn()} libraryId="4" startPath="/" onMove={vi.fn()} />, {
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
      },
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
      },
    );

    await render(<MoveModal onClose={vi.fn()} libraryId="4" startPath="/subdir" onMove={vi.fn()} />, {
      initialState,
      loggedIn: true,
    });

    expect(await screen.findByText('another')).toBeDefined();
    await userEvent.click(screen.getByLabelText('Parent directory'));
    expect(await screen.findByText('subdir')).toBeDefined();
  });

  it('calls onMove with the current directory when clicking the move button', async () => {
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
      },
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
      },
    );

    const onMove = vi.fn();
    await render(<MoveModal onClose={vi.fn()} libraryId="4" startPath="/" onMove={onMove} />, {
      initialState,
      loggedIn: true,
    });

    await userEvent.click(await screen.findByText('subdir'));
    expect(await screen.findByText('another')).toBeDefined();
    await userEvent.click(screen.getByText('Move', { selector: 'button span' }));
    expect(onMove).toBeCalledWith('/subdir');
  });
});
