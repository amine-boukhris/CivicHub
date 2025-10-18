CREATE TABLE public.community_moderators (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- permissions
  can_edit_reports BOOLEAN DEFAULT true,
  can_delete_reports BOOLEAN DEFAULT true,
  can_manage_members BOOLEAN DEFAULT false,
  can_edit_community BOOLEAN DEFAULT false,

  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(community_id, user_id)
);

COMMENT ON TABLE public.community_moderators IS 'Detailed moderator permissions per community';

CREATE INDEX community_moderators_community_id_idx ON public.community_moderators(community_id);
CREATE INDEX community_moderators_user_id_idx ON public.community_moderators(user_id);
