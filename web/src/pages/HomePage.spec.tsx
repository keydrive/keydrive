import { ReallyDeepPartial, render } from '../__testutils__/render';
import { RootState } from '../store';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('redirects to settings if there are no libraries', async () => {
    const initialState: ReallyDeepPartial<RootState> = {
      libraries: {
        libraries: [],
      },
    };
    const { navigation } = await render(<HomePage />, {
      path: '/',
      loggedIn: true,
      initialState,
    });
    expect(navigation.pathname).toBe('/settings');
  });

  it('redirects to first library', async () => {
    const initialState: ReallyDeepPartial<RootState> = {
      libraries: {
        libraries: [
          {
            id: 12341,
          },
          {
            id: 44,
          },
        ],
      },
    };
    const { navigation } = await render(<HomePage />, {
      path: '/',
      loggedIn: true,
      initialState,
    });
    expect(navigation.pathname).toBe('/files/12341');
  });
});
