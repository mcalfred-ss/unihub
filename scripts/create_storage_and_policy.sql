-- UniHub: Create posts table, indexes, and RLS policies
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)

-- ============================================
-- 1. CREATE TABLE
-- ============================================
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  uploader uuid references auth.users(id) on delete set null,
  program_name text not null,
  year text,
  school text,
  type text,
  title text,
  storage_path text not null,
  file_name text,
  file_size int,
  mime_type text,
  is_public boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- 2. CREATE INDEXES
-- ============================================
create index if not exists idx_posts_created_at on posts(created_at);
create index if not exists idx_posts_program_name on posts(program_name);
create index if not exists idx_posts_year on posts(year);
create index if not exists idx_posts_school on posts(school);

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================
alter table posts enable row level security;

-- ============================================
-- 4. DEV RLS POLICY (Allow anonymous inserts)
-- ============================================
-- This policy allows inserts from anonymous clients when uploader is NULL
-- OR from authenticated users
drop policy if exists insert_allow_dev on posts;
create policy insert_allow_dev
  on posts
  for insert
  with check ( (uploader IS NULL) OR (auth.uid() IS NOT NULL) );

-- Allow reads for everyone (adjust based on your needs)
drop policy if exists select_allow_all on posts;
create policy select_allow_all
  on posts
  for select
  using ( true );

-- ============================================
-- 5. PRODUCTION RLS POLICY (Recommended when auth is enabled)
-- ============================================
-- Uncomment and use this when you want to require authentication:
-- 
-- drop policy if exists insert_allow_dev on posts;
-- create policy insert_auth_only
--   on posts
--   for insert
--   with check ( uploader = auth.uid() );
--
-- drop policy if exists select_allow_all on posts;
-- create policy select_authenticated_only
--   on posts
--   for select
--   using ( auth.uid() IS NOT NULL );

-- ============================================
-- 6. STORAGE BUCKET POLICIES (CRITICAL FOR UPLOADS)
-- ============================================
-- Supabase Storage uses RLS on storage.objects table
-- These policies allow anonymous uploads to the 'uploads' bucket

-- Allow anonymous users to INSERT (upload) files to 'uploads' bucket
drop policy if exists "Allow anonymous uploads" on storage.objects;
create policy "Allow anonymous uploads"
  on storage.objects
  for insert
  to public
  with check ( bucket_id = 'uploads' );

-- Allow anonymous users to SELECT (read) files from 'uploads' bucket
-- (Only needed if bucket is private - if bucket is public, this is not required)
drop policy if exists "Allow anonymous reads" on storage.objects;
create policy "Allow anonymous reads"
  on storage.objects
  for select
  to public
  using ( bucket_id = 'uploads' );

-- Allow authenticated users to DELETE their own files
-- (Optional - for user dashboard cleanup)
drop policy if exists "Allow authenticated deletes" on storage.objects;
create policy "Allow authenticated deletes"
  on storage.objects
  for delete
  to authenticated
  using ( bucket_id = 'uploads' );

-- ============================================
-- 7. SEED DATA (Optional - for testing)
-- ============================================
insert into posts (uploader, program_name, year, school, type, title, storage_path, file_name, file_size, mime_type, is_public)
values
  (NULL, 'ComSkills', '2018', 'AAMUSTED', 'question', 'ComSkills 2018 Q1', 'posts/2018/AAMUSTED/sample_comskills2018.pdf', 'comskills2018.pdf', 124000, 'application/pdf', false),
  (NULL, 'Calculus I', '2019', 'AAMUSTED', 'note', 'Calculus notes 2019', 'posts/2019/AAMUSTED/sample_calculus2019.pdf', 'calc_notes.pdf', 410000, 'application/pdf', false)
on conflict do nothing;

