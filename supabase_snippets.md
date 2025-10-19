# Supabase guide and commands

## Migration

### Start local Supabase (includes PostgreSQL, Auth, Storage, etc.)

supabase start
This will output URLs and keys for local development:
API URL: http://localhost:54321
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
anon key: eyJh... (for your Supabase client)
service_role key: eyJh... (for admin operations)
Apply all pending migrations to local database

supabase db reset

### Or push migrations without resetting

supabase db push

### Push migrations to your remote Supabase project

supabase db push --linked

### Or if you want to be more careful:

### 1. Check what will be applied

supabase db diff

### 2. Then push

supabase db push

### Apply seed data

supabase db reset --seed

### Create new migration

supabase migration new migration_name

### Check migration status

supabase migration list

### Apply migrations locally

supabase db reset

### View local database in Studio

supabase start

### Then open: http://localhost:54323

### Generate TypeScript types from database

supabase gen types typescript --local > src/types/supabase.ts

### Stop local Supabase

supabase stop

### Push to production

supabase db push

### Pull remote schema changes

supabase db pull

### Create migration from remote changes

supabase db diff --use-migra --schema public > supabase/migrations/new_migration.sql

## Typescript types generation

### Install type generator

npm install --save-dev supabase

### Generate types

npx supabase gen types typescript --local > src/types/database.types.ts

### Or for production

npx supabase gen types typescript --project-id YOUR_PROJECT_REF > src/types/database.types.ts
