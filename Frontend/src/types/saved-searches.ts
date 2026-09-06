// Mirrors the backend API shape exactly (app/Schemas/saved_search.py) — snake_case, no case-mapping layer.
export interface SavedSearch {
  id: number;
  name: string | null;
  filters: Record<string, string>;
  alert_enabled: boolean;
  last_notified_at: string | null;
  created_at: string;
}

export interface SavedSearchCreate {
  name?: string | null;
  filters: Record<string, string>;
  alert_enabled?: boolean;
}

export interface SavedSearchUpdate {
  name?: string | null;
  filters?: Record<string, string>;
  alert_enabled?: boolean;
}
