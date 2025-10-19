CREATE TABLE public.community_activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  action TEXT NOT NULL,
  entity_type TEXT, -- 'report', 'member', 'moderator', etc.
  entity_id UUID,
  
  description TEXT,
  changed_data JSONB, -- what changed
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purpose: Track all community actions for moderation and transparency
COMMENT ON TABLE public.community_activity_logs IS 'Audit trail for community actions';

CREATE INDEX activity_logs_community_id_idx ON public.community_activity_logs(community_id);
CREATE INDEX activity_logs_user_id_idx ON public.community_activity_logs(user_id);