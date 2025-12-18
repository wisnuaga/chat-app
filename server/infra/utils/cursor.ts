export function decodeCursor(cursor: string): { created_at: number; id: string | number } {
  const payload = JSON.parse(Buffer.from(cursor, 'base64').toString());
  return payload as { created_at: number; id: string | number };
}

export function encodeCursor(item: { created_at: number | Date; id: string | number }): string {
  const created_at = item.created_at instanceof Date ? item.created_at.getTime() : item.created_at;
  return Buffer.from(
    JSON.stringify({
      created_at,
      id: item.id,
    })
  ).toString('base64');
}
