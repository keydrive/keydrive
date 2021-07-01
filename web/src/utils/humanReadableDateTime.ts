const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
});

export function humanReadableDateTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  let datePart = dateFormatter.format(date);
  if (isSameDay(date, now)) {
    datePart = 'Today';
  } else if (isSameDay(date, yesterday)) {
    datePart = 'Yesterday';
  }

  return `${datePart} at ${timeFormatter.format(date)}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}
