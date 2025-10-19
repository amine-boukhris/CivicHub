export interface Community {
  id: string;
  name: string;
  description: string;
  slug: string;
  center_lat: number;
  center_lng: number;
  address: string;
  category: "city" | "neighborhood" | "district" | "campus" | "region";
  member_count: number;
  report_count: number;
  is_verified: boolean;
  icon_url?: string;
  banner_url?: string;
  distance_km?: number;
}