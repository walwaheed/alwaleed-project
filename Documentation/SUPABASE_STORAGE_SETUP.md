# Supabase Storage Setup for Print Products

## 🚨 FIX: "new row violates row-level security policy" Error

**This is the error you're currently getting!** The bucket needs RLS policies to allow uploads.

### Quick Fix - Run This SQL:

1. **Go to Supabase SQL Editor**
   - Dashboard: https://sfraqqkmzzdtcynyyebj.supabase.co
   - Click **SQL Editor** in left sidebar (or **Database** → **SQL Editor**)

2. **Copy and paste this SQL code:**

```sql
-- Allow authenticated users to upload files to pdf-prints bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('pdf-prints', 'pdf-prints', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy 1: Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads to pdf-prints"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pdf-prints');

-- Policy 2: Allow public read access to files
CREATE POLICY "Allow public read access to pdf-prints"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'pdf-prints');

-- Policy 3: Allow authenticated users to update their own files
CREATE POLICY "Allow authenticated updates to pdf-prints"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'pdf-prints')
WITH CHECK (bucket_id = 'pdf-prints');

-- Policy 4: Allow authenticated users to delete their own files
CREATE POLICY "Allow authenticated deletes from pdf-prints"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'pdf-prints');
```

3. **Click "Run"** or press `Ctrl+Enter`
4. **Verify** - You should see "Success. No rows returned"

---

## 🔧 Alternative: Disable RLS (Not Recommended for Production)

If you just want to test quickly (NOT recommended for production):

1. Go to **Storage** → **Policies** tab for `pdf-prints` bucket
2. Click **"Disable RLS"** or toggle RLS off
3. ⚠️ **Warning:** This makes the bucket completely open. Anyone can upload!

---

## ✅ What These Policies Do:

- **INSERT policy:** Allows authenticated (logged-in) users to upload files
- **SELECT policy:** Allows anyone (public) to view/download files
- **UPDATE policy:** Allows authenticated users to update files
- **DELETE policy:** Allows authenticated users to delete files

---

## 🚨 FIX: "mime type application/pdf is not supported" Error

If you get this error instead, follow these steps:

### Option 1: Allow All File Types (Recommended)
1. Go to your Supabase dashboard: https://sfraqqkmzzdtcynyyebj.supabase.co
2. Click **Storage** in the left sidebar
3. Find the `pdf-prints` bucket and click the **⚙️ Settings** icon (or three dots menu → Settings)
4. Under **Allowed MIME types**:
   - **REMOVE ALL entries** or leave it **EMPTY** (this allows all file types)
   - If there's a list of allowed types, delete them all
5. Click **Save**

### Option 2: Allow Only PDFs
1. Follow steps 1-3 above
2. Under **Allowed MIME types**:
   - Add: `application/pdf`
   - Add: `application/x-pdf` (for compatibility)
3. Click **Save**

---

## Steps to Create the pdf-prints Bucket (First Time)

1. **Log in to Supabase**
   - Go to https://supabase.com
   - Navigate to your project: https://sfraqqkmzzdtcynyyebj.supabase.co

2. **Create the pdf-prints Bucket**
   - Click on **Storage** in the left sidebar
   - Click **"Create a new bucket"** or **"New bucket"**
   - Configure:
     - **Name:** `pdf-prints`
     - **Public bucket:** ✅ **ENABLED** (required for public access)
     - **Allowed MIME types:** **Leave EMPTY** (or add `application/pdf` only)
     - **File size limit:** `5242880` (5MB in bytes) - OPTIONAL
   - Click **"Create bucket"**

3. **Verify Bucket Settings**
   - Click on the `pdf-prints` bucket
   - Click the **⚙️ Settings** icon
   - Confirm:
     - ✅ Public bucket is enabled
     - ✅ Allowed MIME types is empty OR contains `application/pdf`

---

## Current Implementation

The PrintProducts page now:
- ✅ Validates file size (max 5MB before upload)
- ✅ Uploads PDFs to the `pdf-prints` bucket in Supabase Storage
- ✅ Shows detailed error messages if upload fails
- ✅ Generates unique filenames to prevent conflicts
- ✅ Supports both individual PDFs and photobook files (cover + pages)

---

## Testing

After configuring the bucket:

1. Navigate to the **Print Products** page
2. Select any product (Aluminum, Wood, Canvas, or PhotoBook)
3. Try uploading a PDF file (under 5MB)
4. ✅ Upload should succeed
5. Verify the file appears in: **Storage → pdf-prints** in Supabase dashboard

---

## Troubleshooting

### Error: "mime type application/pdf is not supported"
- **Solution:** Go to bucket settings and remove all MIME type restrictions (see top of this document)

### Error: "Bucket not found"
- **Solution:** Create the `pdf-prints` bucket following the steps above

### Error: "File size too large"
- **Solution:** Ensure the PDF is under 5MB. Compress it if needed.

### Upload succeeds but file doesn't appear
- **Solution:** Check that the bucket is set to **Public** in settings
