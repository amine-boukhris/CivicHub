-- search communities by name
select * from communities
where to_tsvector('english', name) @@ plainto_tsquery('english', 'besancon')
and is_active = true
limit 10;

-- find nearby communitites
select * from nearby_communities(lng, lat);

-- get user's communities
select c.* from communities c
join community_members cm on c.id = cm.community_id
where cm.user_id = auth.uid();

-- get all reports in user's communities with filters
select r.* from reports r
where r.community_id in (
  select community_id from community_members
  where user_id = auth.uid()
)
and (r.status = 'pending' or r.status is null)
order by r.created_at desc;

-- get nearby reports in joined communities
select r.* from reports r
where r.community_id in (
  select community_id from community_members
  where user_id = auth.uid()
)
and ST_DWithin(
  r.location,
  ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
  5000
)
order by created_at desc;