import { humanReadableDateTime } from './humanReadableDateTime';

describe('humanReadableDateTime', () => {
  it('formats the date and time', () => {
    expect(humanReadableDateTime('2021-03-26T23:32:42.139992387Z')).toBe('26 March 2021 at 23:32');
  });

  it('uses today when the date is today', () => {
    const now = new Date().toISOString();
    const dateString = now.substring(0, now.indexOf('T'));
    expect(humanReadableDateTime(`${dateString}T09:33:42.139992387Z`)).toBe('Today at 09:33');
  });

  it('uses yesterday when the date is yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayIso = yesterday.toISOString();
    const dateString = yesterdayIso.substring(0, yesterdayIso.indexOf('T'));
    expect(humanReadableDateTime(`${dateString}T14:24:42.139992387Z`)).toBe('Yesterday at 14:24');
  });
});
