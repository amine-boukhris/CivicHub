CREATE TABLE public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- report content
  category TEXT NOT NULL CHECK (
    category IN ('road', 'lighting', 'trash', 'vandalism', 'water', 'other')
  ),
  description TEXT NOT NULL,
  title TEXT,

  -- location
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  address TEXT,

  -- status and tracking
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending', 'acknowledged', 'in_progress', 'resolved', 'closed')
  ),
  priority TEXT DEFAULT 'normal' CHECK (
    priority IN ('low', 'normal', 'high', 'urgent')
  ),

  image_url TEXT,

  -- engagement
  upvote_count INT DEFAULT 0,
  view_count INT DEFAULT 0,

  -- status updates
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,

  -- might add this later, but for now don't want extra complexity
  -- is_anonymous BOOLEAN DEFAULT false,
  -- is_pinned BOOLEAN DEFAULT false,

  -- also might add comments but it doesn't feel right for this app
  -- comment_count INT DEFAULT 0,
  -- I'll still create the comments table just in case

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)

COMMENT ON TABLE public.reports IS 'Infrastructure issue reports within communities';


CREATE INDEX reports_community_id_idx ON public.reports(community_id);
CREATE INDEX reports_user_id_idx ON public.reports(user_id);
CREATE INDEX reports_status_idx ON public.reports(status);
CREATE INDEX reports_category_idx ON public.reports(category);
CREATE INDEX reports_created_at_idx ON public.reports(created_at DESC);
CREATE INDEX reports_location_idx ON public.reports USING GIST(location);
CREATE INDEX reports_priority_idx ON public.reports(priority);