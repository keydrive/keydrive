import { render } from '../../__testutils__/render';
import { ManageLibrariesModal } from './ManageLibrariesModal';
import fetchMock from 'fetch-mock';
import { fireEvent, screen } from '@testing-library/react';

describe('ManageLibrariesModal', () => {
  describe('Create mode', () => {
    it('can browse through folders', async () => {
      const onClose = jest.fn();
      fetchMock.get('/api/libraries/?limit=100', {
        totalElements: 0,
        elements: [],
      });
      fetchMock.post(
        { url: '/api/system/browse' },
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
      await render(<ManageLibrariesModal onClose={onClose} />, {
        loggedIn: true,
      });
      // go into add mode
      fireEvent.click(await screen.findByLabelText('Add Library'));
      // navigate to the root folder
      fireEvent.click(await screen.findByText('/'));
      // TODO: Finish
    });
  });
});
