import { resolvePath } from './path';

describe('resolvePath', () => {
  it.each`
    parent                | name           | result
    ${'/home/me'}         | ${'Downloads'} | ${'/home/me/Downloads'}
    ${''}                 | ${'file.txt'}  | ${'/file.txt'}
    ${'/'}                | ${'file.txt'}  | ${'/file.txt'}
    ${'/trailing/slash/'} | ${'bit'}       | ${'/trailing/slash/bit'}
    ${'no/leading'}       | ${'slash'}     | ${'/no/leading/slash'}
  `('resolves the path', ({ parent, name, result }) => {
    expect(resolvePath(parent, name)).toBe(result);
  });
});
