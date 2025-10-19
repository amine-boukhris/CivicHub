CREATE TABLE public.community_invites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  role TEXT DEFAULT 'moderator' CHECK (role IN ('admin', 'moderator', 'member')),

  -- invite status
  status TEXT DEFAULT 'pending' CHECK (status in ('pending', 'accepted', 'declined', 'expired')),
  accepted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,


  create_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOW() + INTERVAL '30 days',

  UNIQUE(community_id, email)
);


COMMENT ON TABLE public.community_invites IS 'Invitations for community moderators/admins';

CREATE INDEX community_invites_community_id_idx ON public.community_invites(community_id);
CREATE INDEX community_invites_email_idx ON public.community_invites(email);
CREATE INDEX community_invites_status_idx ON public.community_invites(status);
