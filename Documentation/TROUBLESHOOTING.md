# Setup Verification & Troubleshooting Guide

## ✅ Current Status

Your environment files are configured with Supabase credentials.

## 🔍 Step-by-Step Verification

### 1. **Check Database Setup**

Have you run the SQL setup script in Supabase?

1. Go to https://supabase.com
2. Open your project: `sfraqqkmzzdtcynyyebj`
3. Go to SQL Editor
4. Run the contents of `database/setup.sql`

**Expected tables:**
- `photos`
- `cart_items`
- `orders`

### 2. **Check Storage Bucket**

1. In Supabase dashboard, go to **Storage**
2. Create a bucket named `photos` (if it doesn't exist)
3. Make it **Public** (toggle on)

### 3. **Test Authentication**

The app uses **Supabase Auth**. To test:

#### **Browser Console Test:**
Open browser console (F12) and run:

```javascript
// Import supabase from the app
import { supabase } from './src/lib/supabase.js';

// Test signup
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'Test123456!',
  options: {
    data: {
      full_name: 'Test User'
    }
  }
});

console.log('Signup result:', { data, error });
```

#### **Check if Auth is Enabled:**
1. In Supabase dashboard → **Authentication** → **Providers**
2. Make sure **Email** provider is enabled
3. Check if **Confirm email** is disabled for testing

### 4. **Test Backend API**

Open a new browser tab and visit:
- **Health Check**: http://localhost:5000/api/health

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-22T00:33:35.000Z"
}
```

### 5. **Test Frontend → Backend Connection**

Open browser console and run:

```javascript
// Test if frontend can reach backend
fetch('/api/health')
  .then(r => r.json())
  .then(data => console.log('Backend health:', data))
  .catch(err => console.error('Backend error:', err));
```

Expected output: `{ status: "ok", timestamp: "..." }`

---

## 🐛 Common Issues & Solutions

### Issue: "Missing Supabase configuration"
**Solution:** Check `.env` and `.env.local` files exist and have:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (backend only)

### Issue: "No user found" or auth errors
**Solutions:**
1. **Disable email confirmation** in Supabase:
   - Go to Authentication → Settings
   - Turn OFF "Enable email confirmations"
   
2. **Check RLS policies:**
   - Make sure you ran `database/setup.sql`
   - RLS policies should be created

3. **Try with Supabase anon key:**
   - The frontend must use the `VITE_SUPABASE_ANON_KEY`
   - The backend must use `SUPABASE_SERVICE_ROLE_KEY`

### Issue: File uploads fail
**Solutions:**
1. **Check storage bucket exists:**
   - Bucket name must be exactly `photos`
   - Must be set to Public
   
2. **Check storage policies:**
   - Users should be able to upload to their own folder
   - Go to Storage → photos bucket → Policies

3. **Test upload manually:**
   ```javascript
   // In browser console
   const file = new File(['test'], 'test.txt');
   const { data, error } = await supabase.storage
     .from('photos')
     .upload('test-folder/test.txt', file);
   console.log({ data, error });
   ```

### Issue: "JWT expired" or "Invalid token"
**Solution:** 
- Clear browser cache and localStorage
- Sign out and sign in again
- Check if Supabase project is active

### Issue: Backend not receiving requests
**Solutions:**
1. Check if backend is running on port 5000
2. Check Vite proxy configuration in `vite.config.js`
3. Look for CORS errors in browser console

---

## 📝 Quick Setup Checklist

- [ ] Supabase project created
- [ ] `.env` file has all credentials
- [ ] `.env.local` file has frontend credentials  
- [ ] Ran `database/setup.sql` in Supabase SQL Editor
- [ ] Created `photos` storage bucket (public)
- [ ] Email authentication enabled in Supabase
- [ ] Email confirmation disabled (for testing)
- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:5173
- [ ] `/api/health` endpoint returns OK

---

## 🔧 Manual Testing Steps

### Test 1: Create an Account

1. Open http://localhost:5173
2. Look for sign up / login button
3. Try to create an account
4. **Check browser console for errors**
5. **Check Supabase Auth → Users** to see if user was created

### Test 2: Upload a Photo

1. After logging in, go to Edit Photo or Gallery
2. Try to upload an image
3. **Check browser Network tab** (F12 → Network)
4. Look for `/api/upload` request
5. Check response status

### Test 3: View Gallery

1. Go to Gallery page
2. **Check browser console for errors**
3. **Check Network tab** for `/api/photos` request
4. If photos table is empty, it should return `{ photos: [] }`

---

## 📞 Need Help?

Share the following information:

1. **Browser Console Errors** (F12 → Console tab)
2. **Network Tab Errors** (F12 → Network tab → Look for failed requests)
3. **Backend Terminal Output** (any errors when requests are made)
4. **Supabase Dashboard** - Screenshot of:
   - Tables created
   - Storage buckets
   - Authentication settings
