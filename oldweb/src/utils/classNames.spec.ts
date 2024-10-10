import { classNames } from './classNames';

describe('classNames', (): void => {
  it('joins names with a space', (): void => {
    expect(classNames('some', 'class', 'names')).toBe('some class names');
  });

  it('filters out falsy names', (): void => {
    expect(classNames('some', undefined, 'more', false)).toBe('some more');
  });
});
