ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_invites ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Public profiles are viewable"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- communities
CREATE POLICY "Anyone can view communities"
  ON public.communities FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create communities"
  ON public.communities FOR INSERT WITH CHECK (
    auth.uid() = admin_id AND auth.role() = 'authenticated'
  );

CREATE POLICY "Community admin can update"
  ON public.communities FOR UPDATE USING (
    auth.uid() = admin_id OR
    auth.uid() IN (
      SELECT user_id FROM community_members
      WHERE community_id = communities.id AND role = 'admin'
    )
  );


-- community members
CREATE POLICY "Members of communities can view members"
  ON public.community_members FOR SELECT USING (
    community_id IN (
      SELECT community_id from community_members
      WHERE user_id = auth.uid()
    )
  );


CREATE POLICY "Users can join communities"
  ON public.community_members FOR INSERT WITH CHECK (
    auth.uid() = user_id AND auth.role() = 'authenticated'
  );

CREATE POLICY "Community admin can remove members"
  ON public.community_members FOR DELETE USING (
    community_id IN (
      SELECT community_id FROM community_members
      WHERE auth.uid() = user_id AND role in ('admin', 'moderator')
    )
  );


-- reports
CREATE POLICY "Anyone can view reports in joined communities"
  ON public.reports FOR SELECT USING (
    community_id IN (
      SELECT community_id FROM community_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Community members can create reports"
  ON public.reports FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    community_id IN (
      SELECT community_id FROM public.reports
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own reports or by admin/moderators"
  ON public.reports FOR UPDATE USING (
    auth.uid() = user_id OR
    community_id IN (
      SELECT community_id FROM community_members
      WHERE auth.uid() = user_id AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Admin/Moderators can delete reports"
  ON public.reports FOR DELETE USING (
    community_id IN (
      SELECT community_id FROM community_members 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );


-- upvotes
CREATE POLICY "Anyone can view upvotes"
  ON public.upvotes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upvote"
  ON public.upvotes FOR INSERT WITH CHECK (
    auth.uid() = user_id AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can remove own upvotes"
  ON public.upvotes FOR DELETE USING (auth.uid() = user_id);


-- community invites
CREATE POLICY "Community admin can create invites"
  ON public.community_invites FOR INSERT WITH CHECK (
    community_id IN (
      SELECT community_id FROM community_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Invited user can view own invites"
  ON public.community_invites FOR SELECT USING (
    email = auth.jwt() ->> 'email' OR
    community_id IN (
      SELECT community_id FROM community_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );