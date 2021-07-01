import { parentPath, resolvePath } from './path';

describe('resolvePath', () => {
  it.each`
    parent                | name           | result
    ${'/home/me'}         | ${'Downloads'} | ${'/home/me/Downloads'}
    ${''}                 | ${'file.txt'}  | ${'/file.txt'}
    ${'/'}                | ${'file.txt'}  | ${'/file.txt'}
    ${'/trailing/slash/'} | ${'bit'}       | ${'/trailing/slash/bit'}
  `('resolves the path', ({ parent, name, result }) => {
    expect(resolvePath(parent, name)).toBe(result);
  });
});

describe('parentPath', () => {
  it.each`
    path                    | parent
    ${''}                   | ${''}
    ${undefined}            | ${''}
    ${'/'}                  | ${''}
    ${'/home/me/Downloads'} | ${'/home/me'}
    ${'no-slash'}           | ${''}
  `('returns the parent path', ({ path, parent }) => {
    expect(parentPath(path)).toBe(parent);
  });
});
