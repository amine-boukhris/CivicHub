CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- tracking
  total_reports_created INT DEFAULT 0,
  total_comments_made INT DEFAULT 0,
  reputation_score INT DEFAULT 0 -- based on upvotes
);

COMMENT ON TABLE public.profiles IS 'User profile information extending auth.users';
