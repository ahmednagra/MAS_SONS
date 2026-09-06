// Mirrors the backend API shape exactly (app/Schemas/favorite.py) — snake_case, no case-mapping layer.
export interface Favorite {
  id: number;
  unit_id: number;
  created_at: string;
}

export interface FavoriteCreate {
  unit_id: number;
}
