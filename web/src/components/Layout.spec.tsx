import { render } from '../__testutils__/render';
import { Layout } from './Layout';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Layout', () => {
  it('displays the libraries', async () => {
    const { navigation } = await render(<Layout>{() => null}</Layout>, {
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
});
