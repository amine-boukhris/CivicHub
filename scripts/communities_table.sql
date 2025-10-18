CREATE TABLE public.communities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  slug TEXT NOT NULL UNIQUE, -- URL-friendly (e.g., "besancon-city")
  
  -- Location
  center_lat DECIMAL(10, 8) NOT NULL,
  center_lng DECIMAL(11, 8) NOT NULL,
  location GEOGRAPHY(POINT, 4326), -- for geospatial queries
  address TEXT, -- human-readable (e.g., "Besançon, France")
  radius_km INT DEFAULT 50, -- service area radius
  
  -- Metadata
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  icon_url TEXT, -- community logo
  banner_url TEXT,
  category TEXT CHECK (category IN ('city', 'neighborhood', 'district', 'campus', 'region')),
  
  -- Statistics
  member_count INT DEFAULT 0,
  report_count INT DEFAULT 0,
  
  -- Status
  is_verified BOOLEAN DEFAULT false, -- verified by admins
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.communities IS 'Communities where users report issues';

-- Index for search and location
CREATE INDEX communities_name_idx ON public.communities USING GIN(to_tsvector('english', name));
CREATE INDEX communities_slug_idx ON public.communities(slug);
CREATE INDEX communities_location_idx ON public.communities USING GIST(location);
CREATE INDEX communities_admin_id_idx ON public.communities(admin_id);