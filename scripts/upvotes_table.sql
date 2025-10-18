CREATE TABLE public.upvotes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(report_id, user_id),
);

COMMENT ON TABLE public.upvotes IS 'User upvotes for reports and comments';

CREATE INDEX upvotes_report_id_idx ON public.upvotes(report_id);
CREATE INDEX upvotes_user_id_idx ON public.upvotes(user_id);