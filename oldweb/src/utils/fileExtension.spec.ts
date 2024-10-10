import { fileExtension } from './fileExtension';

describe('fileExtension', () => {
  it.each`
    name                           | extension
    ${'i-am-a.pdf'}                | ${'pdf'}
    ${'multiple.dots.in.name.jpg'} | ${'jpg'}
    ${'UPPERCASE.PNG'}             | ${'png'}
    ${'no-extension'}              | ${''}
  `('returns the file extension', ({ name, extension }) => {
    expect(fileExtension(name)).toBe(extension);
  });
});
