export function humanReadableDateTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  let datePart = date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  if (isSameDay(date, now)) {
    datePart = 'Today';
  } else if (isSameDay(date, yesterday)) {
    datePart = 'Yesterday';
  }

  return `${datePart} at ${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}
