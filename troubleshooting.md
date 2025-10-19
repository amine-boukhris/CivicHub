# Troubleshooting

### Issue: "Cannot connect to local database"
- Make sure Docker is running
docker ps

- Restart Supabase
supabase stop
supabase start

### Issue: "Migration failed"
- Check migration syntax
psql -h localhost -p 54322 -U postgres -d postgres

- Or view logs
supabase logs

### Issue: "Need to rollback migration"
- Delete the migration file
rm supabase/migrations/TIMESTAMP_migration_name.sql

- Reset database
supabase db reset
