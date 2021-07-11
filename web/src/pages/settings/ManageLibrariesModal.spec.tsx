import { render } from '../../__testutils__/render';
import { ManageLibrariesModal } from './ManageLibrariesModal';
import fetchMock from 'fetch-mock';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

describe('ManageLibrariesModal', () => {
  describe('Create mode', () => {
    it('can browse through folders', async () => {
      const onClose = jest.fn();
      fetchMock.get('/api/libraries/?limit=100', {
        totalElements: 0,
        elements: [],
      });
      fetchMock.post(
        {
          url: '/api/system/browse',
          body: {
            path: '',
          },
        },
        {
          path: '',
          parent: '',
          folders: [
            {
              path: '/',
            },
          ],
        }
      );

      fetchMock.post(
        {
          url: '/api/system/browse',
          body: {
            path: '/',
          },
          overwriteRoutes: false,
        },
        {
          path: '/',
          parent: '',
          folders: [
            {
              path: '/one',
            },
            {
              path: '/two',
            },
            {
              path: '/three',
            },
          ],
        }
      );
      fetchMock.post(
        {
          url: '/api/system/browse',
          body: {
            path: '/two',
          },
          overwriteRoutes: false,
        },
        {
          path: '/two',
          parent: '/',
          folders: [
            {
              path: '/two/four',
            },
          ],
        }
      );
      await render(<ManageLibrariesModal onClose={onClose} />, {
        loggedIn: true,
      });
      // go into add mode
      fireEvent.click(await screen.findByLabelText('Add Library'));
      // navigate to the root folder
      await waitFor(() => {
        screen.getByText('/');
      });
      await act(async () => {
        await fireEvent.click(await screen.findByText('/'));
      });
      await waitFor(() => {
        screen.getByText('/two');
      });
      await act(async () => {
        await fireEvent.click(await screen.findByText('/two'));
      });
      // there should be a four now
      await screen.findByText('/two/four');
      // navigate up
      await fireEvent.click(screen.getByLabelText('Parent directory'));
      await waitFor(() => {
        expect(screen.getByLabelText('Folder:', { selector: 'input' })).toHaveValue('/');
      });
    });
  });
});
