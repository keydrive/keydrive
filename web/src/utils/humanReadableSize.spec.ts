import { humanReadableSize } from './humanReadableSize';

describe('humanReadableSize', () => {
  it.each`
    bytes            | size
    ${0}             | ${'0 bytes'}
    ${1002}          | ${'1002 bytes'}
    ${1024}          | ${'1.0 KB'}
    ${1593}          | ${'1.6 KB'}
    ${82381793}      | ${'78.6 MB'}
    ${22261565347}   | ${'20.7 GB'}
    ${8922261565347} | ${'8.1 TB'}
  `('returns the human readable size', ({ bytes, size }) => {
    expect(humanReadableSize(bytes)).toBe(size);
  });
});
