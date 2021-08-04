import { checkPendingMocks } from '../__testutils__/checkPendingMocks';
import fetchMock from 'fetch-mock';
import { ReallyDeepPartial, render } from '../__testutils__/render';
import { FilesPage } from './FilesPage';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RootState } from '../store';
import { formDataMatcher } from '../__testutils__/formDataMatcher';

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

describe('FilesPage', () => {
  afterEach(checkPendingMocks);

  const originalWindowOpen = window.open;
  afterEach(() => {
    window.open = originalWindowOpen;
  });

  beforeEach(() => {
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
    window.HTMLElement.prototype.scrollIntoView = () => {
      // Just a mock
    };
  });

  it('shows the files', async () => {
    await render(<FilesPage />, {
      path: '/files/4',
      route: '/files/:library/:path?',
      loggedIn: true,
      initialState,
    });

    expect(await screen.findByText('Mock Library', { selector: 'h1' })).toBeDefined();
    expect(await screen.findByText('Ballmers Peak Label.xcf')).toBeDefined();
    expect(await screen.findByText('2.7 MB')).toBeDefined();
  });

  it('shows library and file details', async () => {
    await render(<FilesPage />, {
      path: '/files/4',
      route: '/files/:library/:path?',
      loggedIn: true,
      initialState,
    });

    await screen.findByText('Mock Library', { selector: '.details *' });
    await screen.findByText('Ballmers Peak Label.xcf');
    expect(screen.queryByText('Ballmers Peak Label.xcf', { selector: '.details *' })).toBeNull();
    userEvent.click(screen.getByText('Ballmers Peak Label.xcf'));
    expect(screen.getByText('Ballmers Peak Label.xcf', { selector: '.details *' })).toBeDefined();
  });

  it('enters a directory on double click and shows the folder details', async () => {
    fetchMock.getOnce(
      {
        url: 'path:/api/libraries/4/entries',
        query: {
          parent: '/Documents',
        },
        overwriteRoutes: false,
      },
      {
        status: 200,
        body: [
          {
            name: 'KeyDrive Settings.pdf',
            parent: '/Documents',
            modified: '2021-06-16T09:52:47.769779842+02:00',
            category: 'Binary',
            size: 3570049,
          },
        ],
      }
    );
    fetchMock.getOnce(
      {
        url: 'path:/api/libraries/4/entries',
        query: {
          path: '/Documents',
        },
        overwriteRoutes: false,
      },
      {
        status: 200,
        body: [
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
    fetchMock.getOnce(
      {
        url: 'path:/api/libraries/4/entries',
        query: {
          parent: '/Documents',
        },
        overwriteRoutes: false,
      },
      {
        status: 200,
        body: [],
      }
    );

    const { navigation } = await render(<FilesPage />, {
      path: '/files/4',
      route: '/files/:library/:path?',
      loggedIn: true,
      initialState,
    });

    userEvent.dblClick(await screen.findByText('Documents'));
    expect(await screen.findByText('KeyDrive Settings.pdf')).toBeDefined();
    expect(navigation.pathname).toBe('/files/4/%2FDocuments');
    expect(screen.getByText('Documents', { selector: '.details *' })).toBeDefined();
  });

  it('enters the parent directory when going up', async () => {
    fetchMock.getOnce(
      {
        url: 'path:/api/libraries/4/entries',
        query: {
          parent: '/Documents',
        },
        overwriteRoutes: false,
      },
      {
        status: 200,
        body: [
          {
            name: 'KeyDrive Settings.pdf',
            parent: '/Documents',
            modified: '2021-06-16T09:52:47.769779842+02:00',
            category: 'Binary',
            size: 3570049,
          },
        ],
      }
    );
    fetchMock.getOnce(
      {
        url: 'path:/api/libraries/4/entries',
        query: {
          path: '/Documents',
        },
        overwriteRoutes: false,
      },
      {
        status: 200,
        body: [
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
    fetchMock.getOnce(
      {
        url: 'path:/api/libraries/4/entries',
        query: {
          parent: '/',
        },
        overwriteRoutes: false,
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

    const { navigation } = await render(<FilesPage />, {
      path: '/files/4/%2FDocuments',
      route: '/files/:library/:path?',
      loggedIn: true,
      initialState,
    });

    expect(await screen.findByText('KeyDrive Settings.pdf')).toBeDefined();
    userEvent.click(screen.getByLabelText('Parent directory'));
    expect(await screen.findByText('Documents')).toBeDefined();
    expect(navigation.pathname).toBe('/files/4/%2F');
  });

  it('uploads files', async () => {
    const fileOne = new File(['file content here'], 'upload.txt');
    const fileOneEntry = {
      name: 'upload.txt',
      parent: '/',
      modified: '2021-03-26T23:32:42.139992387+01:00',
      category: 'Document',
      size: 17,
    };
    const fileTwo = new File(['another file? in this economy?'], 'another.zip');
    const fileTwoEntry = {
      name: 'another.zip',
      parent: '/',
      modified: '2021-03-26T23:32:42.139992387+01:00',
      category: 'Archive',
      size: 1337,
    };

    fetchMock.postOnce(
      {
        url: 'path:/api/libraries/4/entries',
        matcher: formDataMatcher({
          name: 'upload.txt',
          parent: '',
          data: fileOne,
        }),
      },
      {
        status: 201,
        body: fileOneEntry,
      }
    );
    fetchMock.postOnce(
      {
        url: 'path:/api/libraries/4/entries',
        matcher: formDataMatcher({
          name: 'another.zip',
          parent: '',
          data: fileTwo,
        }),
        overwriteRoutes: false,
      },
      {
        status: 201,
        body: fileTwoEntry,
      }
    );
    fetchMock.getOnce(
      {
        url: 'path:/api/libraries/4/entries',
        query: {
          parent: '',
        },
        overwriteRoutes: false,
      },
      {
        status: 200,
        body: [fileOneEntry, fileTwoEntry],
      }
    );

    await render(<FilesPage />, {
      path: '/files/4',
      route: '/files/:library/:path?',
      loggedIn: true,
      initialState,
    });
    // wait for the page to load
    await screen.findByText('Ballmers Peak Label.xcf');
    userEvent.upload(screen.getByTestId('file-input'), [fileOne, fileTwo]);
    await screen.findByText('upload.txt', { selector: 'td ' });
    await screen.findByText('another.zip', { selector: 'td ' });
  });

  it('creates a new folder on enter', async () => {
    fetchMock.postOnce(
      {
        url: 'path:/api/libraries/4/entries',
        matcher: formDataMatcher({
          name: 'Create Me',
          parent: '',
        }),
      },
      {
        status: 201,
        body: {
          name: 'Folder Details Pane',
          modified: '2021-03-26T23:32:42.139992387+01:00',
          parent: '/',
          category: 'Folder',
          size: 0,
        },
      }
    );
    fetchMock.getOnce(
      {
        url: 'path:/api/libraries/4/entries',
        query: {
          parent: '',
        },
        overwriteRoutes: false,
      },
      {
        status: 200,
        body: [
          {
            name: 'I Am Of Exist',
            modified: '2021-03-26T23:32:42.139992387+01:00',
            parent: '/',
            category: 'Folder',
            size: 0,
          },
          {
            name: 'Folder Details Pane',
            modified: '2021-03-26T23:32:42.139992387+01:00',
            parent: '/',
            category: 'Folder',
            size: 0,
          },
        ],
      }
    );

    await render(<FilesPage />, {
      path: '/files/4',
      route: '/files/:library/:path?',
      loggedIn: true,
      initialState,
    });

    await screen.findByText('Documents');
    userEvent.click(screen.getByText('New Folder'));
    userEvent.keyboard('Create Me');
    fireEvent.keyDown(screen.getByDisplayValue('Create Me'), {
      key: 'Enter',
    });
    await screen.findByText('Folder Details Pane');
    await screen.findByText('I Am Of Exist');
  });

  it('creates a new folder on clicking the button', async () => {
    fetchMock.postOnce(
      {
        url: 'path:/api/libraries/4/entries',
        matcher: formDataMatcher({
          name: 'Create Me',
          parent: '',
        }),
      },
      {
        status: 201,
        body: {
          name: 'Folder Details Pane',
          modified: '2021-03-26T23:32:42.139992387+01:00',
          parent: '/',
          category: 'Folder',
          size: 0,
        },
      }
    );
    fetchMock.getOnce(
      {
        url: 'path:/api/libraries/4/entries',
        query: {
          parent: '',
        },
        overwriteRoutes: false,
      },
      {
        status: 200,
        body: [
          {
            name: 'I Am Of Exist',
            modified: '2021-03-26T23:32:42.139992387+01:00',
            parent: '/',
            category: 'Folder',
            size: 0,
          },
          {
            name: 'Folder Details Pane',
            modified: '2021-03-26T23:32:42.139992387+01:00',
            parent: '/',
            category: 'Folder',
            size: 0,
          },
        ],
      }
    );

    await render(<FilesPage />, {
      path: '/files/4',
      route: '/files/:library/:path?',
      loggedIn: true,
      initialState,
    });

    await screen.findByText('Documents');
    userEvent.click(screen.getByText('New Folder'));
    userEvent.keyboard('Create Me');
    userEvent.click(screen.getByDisplayValue('Create Me').nextElementSibling as Element);
    await screen.findByText('Folder Details Pane');
    await screen.findByText('I Am Of Exist');
  });

  it('cancels creating the folder when blurring the input', async () => {
    await render(<FilesPage />, {
      path: '/files/4',
      route: '/files/:library/:path?',
      loggedIn: true,
      initialState,
    });

    await screen.findByText('Documents');
    userEvent.click(screen.getByText('New Folder'));
    userEvent.keyboard('Hold On');
    fireEvent.blur(screen.getByDisplayValue('Hold On'));
    expect(screen.queryByDisplayValue('Hold On')).toBeNull();
    expect(screen.queryByText('Hold On')).toBeNull();
  });

  it('cancels creating the folder when pressing escape', async () => {
    await render(<FilesPage />, {
      path: '/files/4',
      route: '/files/:library/:path?',
      loggedIn: true,
      initialState,
    });

    await screen.findByText('Documents');
    userEvent.click(screen.getByText('New Folder'));
    userEvent.keyboard('Hold On');
    fireEvent.keyDown(screen.getByDisplayValue('Hold On'), {
      key: 'Escape',
    });
    expect(screen.queryByDisplayValue('Hold On')).toBeNull();
    expect(screen.queryByText('Hold On')).toBeNull();
  });

  it('downloads a file on double click', async () => {
    fetchMock.postOnce(
      {
        url: 'path:/api/libraries/4/entries/download',
        body: {
          path: '/Ballmers Peak Label.xcf',
        },
      },
      {
        status: 201,
        body: {
          token: 'i_am_a_download_token',
        },
      }
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete window.open;
    window.open = jest.fn();

    await render(<FilesPage />, {
      path: '/files/4',
      route: '/files/:library/:path?',
      loggedIn: true,
      initialState,
    });

    userEvent.dblClick(await screen.findByText('Ballmers Peak Label.xcf'));
    await waitFor(() => {
      expect(window.open).toBeCalledWith('/api/download?token=i_am_a_download_token', '_self');
    });
  });

  it('downloads a file on clicking the download button', async () => {
    fetchMock.postOnce(
      {
        url: 'path:/api/libraries/4/entries/download',
        body: {
          path: '/Ballmers Peak Label.xcf',
        },
      },
      {
        status: 201,
        body: {
          token: 'i_am_a_download_token',
        },
      }
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete window.open;
    window.open = jest.fn();

    await render(<FilesPage />, {
      path: '/files/4',
      route: '/files/:library/:path?',
      loggedIn: true,
      initialState,
    });

    userEvent.click(await screen.findByText('Ballmers Peak Label.xcf'));
    userEvent.click(screen.getByText('Download'));
    await waitFor(() => {
      expect(window.open).toBeCalledWith('/api/download?token=i_am_a_download_token', '_self');
    });
  });

  it('deletes an entry on clicking the delete button', async () => {
    fetchMock.deleteOnce(
      {
        url: 'path:/api/libraries/4/entries',
        query: {
          path: '/Documents',
        },
      },
      {
        status: 204,
      }
    );
    fetchMock.getOnce(
      {
        url: 'path:/api/libraries/4/entries',
        query: {
          parent: '',
        },
        overwriteRoutes: false,
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
        ],
      }
    );

    await render(<FilesPage />, {
      path: '/files/4',
      route: '/files/:library/:path?',
      loggedIn: true,
      initialState,
    });

    userEvent.click(await screen.findByText('Documents'));
    userEvent.click(screen.getByText('Delete'));
    await waitFor(() => {
      expect(screen.queryByText('Documents')).toBeNull();
    });
  });

  it('downloads a file on clicking the download menu item', async () => {
    fetchMock.postOnce(
      {
        url: 'path:/api/libraries/4/entries/download',
        body: {
          path: '/Ballmers Peak Label.xcf',
        },
      },
      {
        status: 201,
        body: {
          token: 'i_am_a_download_token',
        },
      }
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete window.open;
    window.open = jest.fn();

    await render(<FilesPage />, {
      path: '/files/4',
      route: '/files/:library/:path?',
      loggedIn: true,
      initialState,
    });

    fireEvent.contextMenu(await screen.findByText('Ballmers Peak Label.xcf'));
    userEvent.click(screen.getByText('Download'));
    await waitFor(() => {
      expect(window.open).toBeCalledWith('/api/download?token=i_am_a_download_token', '_self');
    });
  });

  it('deletes an entry on clicking the delete menu item', async () => {
    fetchMock.deleteOnce(
      {
        url: 'path:/api/libraries/4/entries',
        query: {
          path: '/Documents',
        },
      },
      {
        status: 204,
      }
    );
    fetchMock.getOnce(
      {
        url: 'path:/api/libraries/4/entries',
        query: {
          parent: '',
        },
        overwriteRoutes: false,
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
        ],
      }
    );

    await render(<FilesPage />, {
      path: '/files/4',
      route: '/files/:library/:path?',
      loggedIn: true,
      initialState,
    });

    fireEvent.contextMenu(await screen.findByText('Documents'));
    userEvent.click(screen.getByText('Delete'));
    await waitFor(() => {
      expect(screen.queryByText('Documents')).toBeNull();
    });
  });
});
