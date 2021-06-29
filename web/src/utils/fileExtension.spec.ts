import { fileExtension } from './fileExtension';

describe('fileExtension', () => {
  it('returns the file extension', () => {
    expect(fileExtension('i-am-a.pdf')).toBe('pdf');
    expect(fileExtension('multiple.dots.in.name.jpg')).toBe('jpg');
  });

  it('lowercases the file extension', () => {
    expect(fileExtension('UPPERCASE.PNG')).toBe('png');
  });

  it('returns empty string if there is no extension', () => {
    expect(fileExtension('no-extension')).toBe('');
  });
});
