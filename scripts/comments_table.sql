CREATE TABLE public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  content TEXT NOT NULL,
  
  -- Moderation
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT false,
  
  upvote_count INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.comments IS 'Comments/discussions on reports';

CREATE INDEX comments_report_id_idx ON public.comments(report_id);
CREATE INDEX comments_user_id_idx ON public.comments(user_id);
CREATE INDEX comments_created_at_idx ON public.comments(created_at DESC);