# UniHub

A modern resource sharing platform built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- 📤 Client-side file upload to Supabase Storage
- 🔐 Server-side metadata insertion using service role key
- 🔒 Row Level Security (RLS) policies for data protection
- 📱 Responsive, modern UI with pastel theme
- 🎨 Drag & drop file upload interface
- 📋 Resource listing and preview

## Tech Stack

- **Framework**: Next.js 14 (Pages Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database & Storage**: Supabase (PostgreSQL + Storage)
- **Package Manager**: npm

## Prerequisites

- Node.js 18+ and npm
- A Supabase project ([create one here](https://supabase.com))

## Setup Instructions

### 1. Clone and Install

```bash
# Install dependencies
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_MAX_UPLOAD_MB=25
NEXT_PUBLIC_APP_NAME=Uni Hub

# Server-side only - NEVER commit this to version control
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**⚠️ Important**: 
- Never commit `.env.local` to version control
- The `SUPABASE_SERVICE_ROLE_KEY` should only be set in production secrets (Vercel, GitHub Secrets, etc.)
- The service role key bypasses RLS - keep it secure

### 3. Supabase Setup

#### A. Create Storage Bucket

1. Go to your Supabase Dashboard → Storage
2. Click "New bucket"
3. Name it exactly: `uploads`
4. Set file size limit to **25MB** (or your preferred limit)
5. Make it **public** (for easy access) or **private** (requires signed URLs)

#### B. Run SQL Script

1. Go to Supabase Dashboard → SQL Editor
2. Open `scripts/create_storage_and_policy.sql`
3. Copy and paste the entire SQL script
4. Click "Run" to execute

This will create:
- `posts` table with all required columns
- Indexes for performance
- RLS policies for `posts` table (dev mode: allows anonymous inserts)
- **Storage bucket policies** (allows anonymous uploads to `uploads` bucket) ⚠️ **CRITICAL**

#### C. Verify Setup

After running the SQL, verify:
- Table `posts` exists in Database → Tables
- RLS is enabled (you'll see a lock icon)
- Storage bucket `uploads` exists

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
unihub/
├── src/
│   ├── components/       # React components
│   │   ├── FilePicker.tsx
│   │   └── PostCard.tsx
│   ├── lib/              # Supabase clients
│   │   ├── supabaseClient.ts  # Browser client (anon key)
│   │   └── supabaseAdmin.ts   # Server client (service role)
│   ├── pages/            # Next.js pages
│   │   ├── index.tsx     # Home page (list posts)
│   │   ├── upload.tsx    # Upload page
│   │   └── api/
│   │       └── posts/
│   │           └── create.ts  # API route for metadata insert
│   ├── styles/
│   │   └── globals.css   # Tailwind imports
│   ├── types/
│   │   └── index.ts      # TypeScript types
│   └── utils/
│       └── uploadPost.ts # Client upload utility
├── scripts/
│   └── create_storage_and_policy.sql  # Database setup SQL
├── .env.example          # Environment variable template
└── README.md
```

## How It Works

### Upload Flow

1. **Client Upload** (`src/pages/upload.tsx`):
   - User selects file and fills form
   - `uploadPost()` from `src/utils/uploadPost.ts` is called
   - File is uploaded to Supabase Storage bucket `uploads` using anon key
   - Storage path is returned

2. **Metadata Insert** (`src/pages/api/posts/create.ts`):
   - Client calls `/api/posts/create` with metadata
   - Server uses service role key (bypasses RLS)
   - Metadata row is inserted into `posts` table
   - Returns created post data

### File Path Format

Files are stored with this path structure:
```
posts/{year}/{school}/{timestamp}_{uuid}_{filename}
```

Example: `posts/2024/Engineering/1704123456789_abc123-def456_computer_science.pdf`

## RLS Policies

### Development Policy (Current)

Allows anonymous inserts when `uploader` is `NULL`:
```sql
create policy insert_allow_dev
  on posts
  for insert
  with check ( (uploader IS NULL) OR (auth.uid() IS NOT NULL) );
```

### Production Policy (Recommended)

Requires authentication:
```sql
create policy insert_auth_only
  on posts
  for insert
  with check ( uploader = auth.uid() );
```

To switch to production policy, uncomment the production policy section in `scripts/create_storage_and_policy.sql` and run it.

## Testing

### Unit Tests (Placeholder)

```bash
npm test
```

Tests are set up with Jest. Add tests in `__tests__/` directories.

### E2E Tests (Placeholder)

```bash
npm run test:e2e
```

E2E tests use Playwright. Add tests in `e2e/` directory.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (in Secrets)
   - `NEXT_PUBLIC_MAX_UPLOAD_MB`
   - `NEXT_PUBLIC_APP_NAME`
4. Deploy

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- Netlify
- AWS Amplify
- Railway
- Self-hosted

## Troubleshooting

### "Storage upload failed: Bucket not found"

- Verify bucket name is exactly `uploads` (case-sensitive)
- Check bucket exists in Supabase Dashboard → Storage

### "new row violates row-level security policy" (Storage Upload)

**This error during storage upload means storage bucket policies are missing!**

1. **Run the SQL script** (`scripts/create_storage_and_policy.sql`) - it includes storage policies
2. **Verify storage policies exist:**
   - Go to Supabase Dashboard → Storage → Policies
   - Check that `uploads` bucket has policies:
     - "Allow anonymous uploads" (INSERT)
     - "Allow anonymous reads" (SELECT)
3. **If policies are missing**, run this SQL in Supabase SQL Editor:
   ```sql
   -- Allow anonymous uploads
   create policy "Allow anonymous uploads"
     on storage.objects
     for insert
     to public
     with check ( bucket_id = 'uploads' );
   ```

### "new row violates row-level security policy" (Database Insert)

- Verify RLS policies are created (run SQL script)
- Check that `uploader: null` is being sent (check console logs)
- For production, ensure user is authenticated

### "SUPABASE_SERVICE_ROLE_KEY is not set"

- Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` (development)
- Add to production secrets (Vercel, etc.)

### API route returns 500

- Check server logs for detailed error
- Verify service role key is correct
- Ensure `posts` table exists and has correct schema

## Development Notes

- All client-side operations use the anon key
- Server-side operations use the service role key (bypasses RLS)
- File uploads happen client-side for better performance
- Metadata inserts happen server-side for security

## License

MIT

## Support

For issues or questions, check the Supabase documentation or open an issue in the repository.
