import '@testing-library/jest-dom';
import { ApiService } from '../services/ApiService.ts';

ApiService.TEST_BASE_URL = 'http://test.local';

if (!process.env.DEBUG) {
  console.debug = () => undefined;
}
