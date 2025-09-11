export interface Profile {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string | null;
}

export function mapProfileRow(row: any): Profile {
  return {
    id: row.id,
    displayName: row.display_name ?? null,
    avatarUrl: row.avatar_url ?? null,
    createdAt: row.created_at ?? null
  };
}
