import '@testing-library/jest-dom';

process.env.BASE_URL = 'http://test.local';

if (!process.env.DEBUG) {
  console.debug = () => undefined;
}
