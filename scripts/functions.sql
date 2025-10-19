-- Function: Find nearby communities
CREATE OR REPLACE FUNCTION public.nearby_communities(
  user_lat DECIMAL,
  user_lng DECIMAL,
  distance_km INTEGER DEFAULT 50
) RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  center_lat DECIMAL,
  center_lng DECIMAL,
  member_count INT,
  report_count INT,
  distance_km DECIMAL
) AS 
$$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.description,
    c.center_lat,
    c.center_lng,
    c.member_count,
    c.report_count,
    ROUND(
      ST_Distance(
        c.location,
        ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
      ) / 1000
    )::DECIMAL as distance_km
  FROM public.communities c
  WHERE ST_DWithin(
    c.location,
    ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
    distance_km * 1000
  )
  AND c.is_active = true
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- Function: Find reports in community
CREATE OR REPLACE FUNCTION public.community_reports(
  p_community_id UUID,
  p_status TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL
) RETURNS TABLE (
  id UUID,
  category TEXT,
  description TEXT,
  status TEXT,
  upvote_count INT,
  comment_count INT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.category,
    r.description,
    r.status,
    r.upvote_count,
    r.comment_count,
    r.created_at
  FROM public.reports r
  WHERE r.community_id = p_community_id
  AND (p_status IS NULL OR r.status = p_status)
  AND (p_category IS NULL OR r.category = p_category)
  ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function: Get community statistics
CREATE OR REPLACE FUNCTION public.get_community_stats(p_community_id UUID)
RETURNS TABLE (
  total_members INT,
  total_reports INT,
  pending_reports INT,
  resolved_reports INT,
  active_moderators INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM community_members WHERE community_id = p_community_id)::INT,
    (SELECT COUNT(*) FROM reports WHERE community_id = p_community_id)::INT,
    (SELECT COUNT(*) FROM reports WHERE community_id = p_community_id AND status = 'pending')::INT,
    (SELECT COUNT(*) FROM reports WHERE community_id = p_community_id AND status = 'resolved')::INT,
    (SELECT COUNT(*) FROM community_members WHERE community_id = p_community_id AND role IN ('admin', 'moderator'))::INT;
END;
$$ LANGUAGE plpgsql;

-- Function: Update community stats (called by triggers)
CREATE OR REPLACE FUNCTION public.update_community_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.communities
  SET 
    member_count = (SELECT COUNT(*) FROM community_members WHERE community_id = NEW.community_id),
    report_count = (SELECT COUNT(*) FROM reports WHERE community_id = NEW.community_id)
  WHERE id = NEW.community_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for stats
CREATE TRIGGER community_members_stats_update
  AFTER INSERT OR DELETE ON public.community_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_community_stats();

CREATE TRIGGER reports_stats_update
  AFTER INSERT OR DELETE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_community_stats();

-- Function: Update upvote counts
CREATE OR REPLACE FUNCTION public.update_upvotes_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.reports
    SET upvote_count = (SELECT COUNT(*) FROM upvotes WHERE report_id = NEW.report_id)
    WHERE id = NEW.report_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.reports
    SET upvote_count = (SELECT COUNT(*) FROM public.upvotes WHERE report_id = OLD.report_id)
    WHERE id = OLD.report_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER upvotes_count_update
  AFTER INSERT OR DELETE ON public.upvotes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_upvotes_counts();