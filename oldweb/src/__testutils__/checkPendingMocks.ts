import fetchMock from 'fetch-mock';

export const checkPendingMocks = async (): Promise<void> => {
  await fetchMock.flush();
  expect(fetchMock.done()).toBe(true);
  fetchMock.reset();
};
