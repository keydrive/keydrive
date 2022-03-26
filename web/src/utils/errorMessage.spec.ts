import { errorMessage } from './errorMessage';

describe('errorMessage', () => {
  it('returns the description if it is set', () => {
    expect(
      errorMessage({
        description: 'me!',
        message: 'not me',
      })
    ).toBe('me!');
  });

  it('returns the message if it is set', () => {
    expect(
      errorMessage({
        message: 'yes me',
      })
    ).toBe('yes me');
  });

  it('returns unknown error if the value is not an error object', () => {
    expect(errorMessage(undefined)).toBe('Unknown error');
  });

  it('returns unknown error if neither description nor message is set', () => {
    expect(errorMessage({})).toBe('Unknown error');
  });
});
