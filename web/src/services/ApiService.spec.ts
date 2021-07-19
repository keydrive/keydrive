import { getFileName } from './ApiService';

describe('getFileName', () => {
  it.each`
    input                                                    | expected
    ${'filename=test.jpg'}                                   | ${'test.jpg'}
    ${'attachment;filename=test.jpg'}                        | ${'test.jpg'}
    ${undefined}                                             | ${'download'}
    ${'inline;filename=test.jpg'}                            | ${'test.jpg'}
    ${'attachment; filename=test.jpg'}                       | ${'test.jpg'}
    ${'attachment; filename="test.jpg"'}                     | ${'test.jpg'}
    ${'attachment; filename="Why would \\"you\\" do this?"'} | ${'Why would "you" do this?'}
    ${'inline; filename=something.pdf other-attribute'}      | ${'something.pdf'}
  `('extracts the filename from [$input]', ({ input, expected }) => {
    expect(getFileName(input)).toBe(expected);
  });
});
