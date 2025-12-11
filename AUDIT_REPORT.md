# UniHub Code Audit Report
**Date:** 2024-01-XX  
**Project:** UniHub (Next.js + Supabase)  
**Auditor:** Automated Code Scanner

## Executive Summary

The codebase has been audited for security, correctness, and best practices. The main upload flow correctly uses server-side API routes with service role keys, but several issues were found including: conflicting routing structures (App Router + Pages Router), TypeScript errors, duplicate Post type definitions, and an unused App Router upload route that could cause confusion. All critical security issues (direct client DB inserts) have been resolved, but cleanup and type fixes are needed.

---

## 1. Repository Inventory

**Root:** `I:\websites\unihub`  
**Package Manager:** npm  
**Node Version:** Not specified in package.json (should add engines field)  
**Next.js Version:** 14.2.33  
**TypeScript:** 5.3.3

**Top-level structure:**
- `src/` - Source code (Pages Router + App Router mixed)
- `scripts/` - SQL and utility scripts
- `__tests__/` - Unit tests
- `e2e/` - E2E tests
- `node_modules/` - Dependencies

**Key finding:** Mixed routing structure (both `src/pages/` and `src/app/` exist)

---

## 2. Static Code Analysis

### ✅ CRITICAL: No Direct Client Inserts Found
**Status:** PASS  
**Finding:** No instances of `.from('posts').insert(` found in client-side code.

### ✅ CRITICAL: Service Role Key Not Exposed
**Status:** PASS  
**Finding:** No `NEXT_PUBLIC_SERVICE_ROLE_KEY` or client-side usage of service role key found.

### ⚠️ MEDIUM: Duplicate Post Type Definition
**Files:**
- `src/types/index.ts` - Exports `Post` interface
- `src/components/ui/ResultCard.tsx` - Defines local `Post` interface (line 7)

**Issue:** Type mismatch causes TypeScript errors in `src/app/dashboard/page.tsx` and `src/app/admin/page.tsx`

**Fix Required:** Remove duplicate definition, use centralized type from `@/types`

---

## 3. API Route Analysis

### ✅ `src/pages/api/posts/create.ts` - CORRECT
**Status:** PASS  
**Verification:**
- ✅ Uses `process.env.SUPABASE_SERVICE_ROLE_KEY` (not `NEXT_PUBLIC_`)
- ✅ Creates admin client via `getSupabaseAdmin()`
- ✅ Sets `uploader: null` and `is_public: false` server-side
- ✅ Has debug logging: `API /api/posts/create called`, `USING_SERVICE_ROLE:`
- ✅ Returns proper error responses

**Code is correct and secure.**

### ⚠️ MEDIUM: Unused App Router Upload Route
**File:** `src/app/api/upload/route.ts`  
**Issue:** This route exists but is not used by the Pages Router upload flow. It contains old code that inserts directly into posts table (line 92-104) using `user_id` instead of `uploader`.

**Recommendation:** Delete this file or update it to match the Pages Router pattern.

---

## 4. Client Upload Flow Analysis

### ✅ `src/utils/uploadPost.ts` - CORRECT
**Status:** PASS  
**Verification:**
- ✅ Uploads to storage using `supabaseClient` (anon key)
- ✅ Uses bucket `uploads` correctly
- ✅ Builds metadata without `uploader` or `is_public`
- ✅ Calls `/api/posts/create` via fetch (not direct DB insert)
- ✅ Proper error handling with clear separation

**Code is correct.**

### ✅ `src/pages/upload.tsx` - CORRECT
**Status:** PASS  
**Verification:**
- ✅ Imports from `@/utils/uploadPost` (correct file)
- ✅ Uses `uploadPost()` function
- ✅ Error handling distinguishes storage vs database errors

**Code is correct.**

### ✅ Old Upload Client Removed
**Status:** PASS  
**Finding:** `src/lib/uploadClient.ts` has been deleted (confirmed not present).

---

## 5. Environment Variables

### ✅ Environment Files Present
**Status:** PASS  
**Findings:**
- `.env.local` exists with all required variables
- `.env` also exists (backup/legacy)
- `SUPABASE_SERVICE_ROLE_KEY` present (not prefixed with `NEXT_PUBLIC_`)
- All required variables present:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_MAX_UPLOAD_MB`
  - `NEXT_PUBLIC_APP_NAME`

**Note:** Both `.env` and `.env.local` exist. `.env.local` takes precedence in Next.js.

---

## 6. SQL & RLS Analysis

### ✅ `scripts/create_storage_and_policy.sql` - CORRECT
**Status:** PASS  
**Verification:**
- ✅ Creates `posts` table with `uploader uuid references auth.users(id) on delete set null`
- ✅ Enables RLS: `alter table posts enable row level security`
- ✅ Creates dev policy: `insert_allow_dev` with `with check ((uploader IS NULL) OR (auth.uid() IS NOT NULL))`
- ✅ Creates select policy: `select_allow_all` with `using (true)`
- ✅ Includes seed data examples

**SQL script is correct and ready to run.**

---

## 7. Storage Bucket References

### ✅ All References Use `uploads` Bucket
**Status:** PASS  
**Files using `uploads` bucket:**
- `src/utils/uploadPost.ts:31` - Client upload
- `src/components/PostCard.tsx:11` - Public URL generation
- `src/app/api/moderate/delete/route.ts:113` - File deletion
- `src/app/api/upload/route.ts:77,123,142` - Server upload (unused route)
- `src/app/api/posts/[id]/signed-url/route.ts:63` - Signed URL

**All references consistent.**

---

## 8. Lint & Type Checks

### ⚠️ LOW: ESLint Warnings
**Issues Found:**
1. `src/app/dashboard/page.tsx:145` - Unescaped apostrophe in "haven't"
2. `src/components/ui/PreviewModal.tsx:100` - Using `<img>` instead of Next.js `<Image>`

**Fix:** Minor style issues, not blocking.

### ⚠️ MEDIUM: TypeScript Errors
**Issues Found:**
1. Test files missing `@types/jest` (expected - test files)
2. `src/app/dashboard/page.tsx` - Cannot find exported `Post` from `ResultsList`
3. `src/app/admin/page.tsx` - Cannot find exported `Post` from `ResultsList`
4. `src/app/post/[id]/page.tsx` - `params` possibly null
5. `src/components/ui/__tests__/InputPill.test.tsx` - Missing test library types
6. `src/components/FilePicker.tsx` - Missing `framer-motion` types

**Fix Required:** See fixes section below.

---

## 9. Error Messages

### ✅ Error Messages Improved
**Status:** PASS  
**Verification:**
- `src/pages/upload.tsx` correctly distinguishes:
  - Storage errors: "Storage upload failed: ..."
  - Database errors: "Database insert failed: ..."
  - RLS errors: Specific message about service role key

**Error messages are clear and helpful.**

---

## 10. Findings Summary

### CRITICAL Issues (Security/Functionality)
**None found** ✅

### HIGH Priority Issues
1. **Duplicate Post Type Definition** - Causes TypeScript errors
2. **Unused App Router Upload Route** - Could cause confusion

### MEDIUM Priority Issues
1. **TypeScript errors** in App Router pages (Post type import)
2. **Missing type definitions** for test files
3. **Mixed routing structure** (App Router + Pages Router)

### LOW Priority Issues
1. ESLint warnings (unescaped entities, img vs Image)
2. Missing `engines` field in package.json

---

## FIXES

### Fix 1: Remove Duplicate Post Type Definition

**File:** `src/components/ui/ResultCard.tsx`

```diff
- export interface Post {
-   id: string
-   program_name?: string
-   year?: number
-   school?: string
-   file_name?: string
-   mime_type?: string
-   created_at?: string
-   storage_path?: string
- }
+ import { Post } from '@/types'

- export interface Post {
```

**File:** `src/components/ui/ResultsList.tsx`

```diff
- import { ResultCard, Post } from './ResultCard'
+ import { ResultCard } from './ResultCard'
+ import { Post } from '@/types'
```

### Fix 2: Fix TypeScript Null Check

**File:** `src/app/post/[id]/page.tsx`

```diff
export default function PostPage() {
  const params = useParams()
-  const id = typeof params.id === 'string' ? params.id : params.id[0]
+  const id = params?.id ? (typeof params.id === 'string' ? params.id : params.id[0]) : ''
+  
+  if (!id) {
+    return <div>Post ID required</div>
+  }
```

### Fix 3: Delete Unused App Router Upload Route

**Action:** Delete `src/app/api/upload/route.ts` (not used by Pages Router flow)

### Fix 4: Fix ESLint Warnings

**File:** `src/app/dashboard/page.tsx`

```diff
- You haven't uploaded any resources yet
+ You haven&apos;t uploaded any resources yet
```

**File:** `src/components/ui/PreviewModal.tsx`

```diff
- <img
+ <Image
    src={fileUrl}
    alt={fileName}
    className="w-full h-auto rounded-lg"
+   width={800}
+   height={600}
  />
```

(Requires: `import Image from 'next/image'`)

### Fix 5: Add Missing Dependencies

**File:** `package.json`

```diff
  "devDependencies": {
+   "@types/jest": "^29.5.11",
    "@types/node": "^20.10.6",
```

---

## VERIFICATION CHECKLIST

### Pre-flight Checks
```bash
# 1. Verify environment variables
cat .env.local | grep -E "SUPABASE|MAX_UPLOAD|APP_NAME"
# Should show: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, etc.

# 2. Run lint
npm run lint
# Should show only minor warnings (not errors)

# 3. Check TypeScript (after fixes)
npx tsc --noEmit
# Should show only test file errors (expected)
```

### Runtime Test

**1. Start dev server:**
```bash
npm run dev
```

**2. Expected server logs on startup:**
```
✓ Ready in X.Xs
✓ Compiled / in Xms
```

**3. Navigate to:** `http://localhost:3000/upload`

**4. Fill form and upload a test file:**
- Program Name: "Test"
- Year: "2024"
- School: "Test"
- Select a small PDF/image file

**5. Expected browser console logs:**
```
Uploading to storage path: posts/2024/Test/...
Storage upload succeeded: posts/2024/Test/...
✅ Storage upload completed successfully
CALLING /api/posts/create WITH METADATA { ... }
SERVER INSERT OK { data: {...} }
✅ Database insert completed successfully
Upload successful: {...}
```

**6. Expected server console logs:**
```
API /api/posts/create called — body: {"program_name":"Test",...}
USING_SERVICE_ROLE: true
Server inserting post: { ... }
Using service role key: true
```

**7. Expected network response:**
- `POST /api/posts/create` → `201 Created`
- Response body: `{ "data": { "id": "...", ... } }`

**8. Expected UI:**
- Green success message: "Upload successful! Your resource has been added."
- Form resets

### Success Indicators

✅ **Server logs show:**
- `API /api/posts/create called`
- `USING_SERVICE_ROLE: true`
- `Server inserting post: {...}`
- No RLS errors

✅ **Browser console shows:**
- `Storage upload succeeded`
- `CALLING /api/posts/create WITH METADATA`
- `SERVER INSERT OK`

✅ **Network tab shows:**
- `POST /api/posts/create` → `201 Created`

✅ **UI shows:**
- Success message (green box)
- Form cleared

---

## COMMANDS TO RUN

### Apply Fixes

```bash
# 1. Fix Post type (manual edit required - see Fix 1 above)

# 2. Delete unused route
rm src/app/api/upload/route.ts

# 3. Add missing types
npm install --save-dev @types/jest

# 4. Fix ESLint issues (manual edit - see Fix 4 above)

# 5. Restart dev server
npm run dev
```

### Verify Database Setup

```bash
# 1. Open Supabase Dashboard → SQL Editor
# 2. Copy contents of scripts/create_storage_and_policy.sql
# 3. Paste and run in SQL Editor
# 4. Verify:
#    - Table 'posts' exists
#    - RLS is enabled (lock icon visible)
#    - Policies exist (check Policies tab)
```

### Verify Storage Bucket

```bash
# 1. Open Supabase Dashboard → Storage
# 2. Verify bucket 'uploads' exists
# 3. Check file size limit is 25MB
# 4. Verify bucket is public or has proper policies
```

---

## CONCLUSION

The codebase is **functionally correct** and **secure**. The main upload flow correctly:
1. Uploads files client-side to Supabase Storage
2. Calls server API route for metadata insertion
3. Uses service role key server-side (bypasses RLS)

**Remaining issues are non-critical:**
- TypeScript type conflicts (easily fixable)
- Unused App Router files (can be deleted)
- Minor lint warnings (cosmetic)

**Recommendation:** Apply the fixes above, then test the upload flow. The core functionality is sound.

