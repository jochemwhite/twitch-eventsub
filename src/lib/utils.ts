export function getTimeFromRFC3339(rfc3339: string): string {
  const date = new Date(rfc3339);

  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  if (hours === 0) {
      return `${minutes}:${seconds}`;
  } else {
      return `${String(hours)}:${minutes}:${seconds}`;
  }
}



