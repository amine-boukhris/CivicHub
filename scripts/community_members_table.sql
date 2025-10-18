CREATE TABLE public.community_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- member info
  role TEXT DEFAULT 'member' CHECK (role in ('admin', 'moderator', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),

  -- activity tracking
  reports_created INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(community_id, user_id)
);

COMMENT ON TABLE public.community_members IS 'Tracks user membership and roles in communities';

CREATE INDEX community_members_community_id_idx ON public.community_members(community_id);
CREATE INDEX community_members_user_id_idx ON public.community_members(user_id);
CREATE INDEX community_members_role_idx ON public.community_members(role);