# Setup Instructions

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Environment Variables

### Backend Environment (.env)
Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
PORT=5000
NODE_ENV=development

SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

FRONTEND_URL=http://localhost:5173
```

### Frontend Environment (.env.local)
Copy `.env.local.example` to `.env.local`:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Where to find Supabase credentials:**
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the Project URL and API keys

## Step 3: Setup Supabase Database

1. Open your Supabase project dashboard
2. Go to the SQL Editor tab
3. Copy the contents of `database/setup.sql`
4. Paste and run the SQL script

This will create:
- `photos` table
- `cart_items` table
- `orders` table
- Row Level Security (RLS) policies
- Triggers for automatic timestamp updates

## Step 4: Create Supabase Storage Bucket

1. In Supabase dashboard, go to Storage
2. Create a new bucket named `photos`
3. Make it public or configure appropriate policies

## Step 5: Run the Application

### Option 1: Run both frontend and backend together
```bash
npm run dev:all
```

### Option 2: Run separately
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run server
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Step 6: Test the Setup

1. Visit http://localhost:5173
2. Sign up for a new account
3. Verify you can log in
4. Test uploading a photo
5. Check that it appears in your gallery

## Troubleshooting

### Common Issues

**"Missing Supabase configuration" error:**
- Make sure both `.env` and `.env.local` files are created
- Verify all environment variables are set correctly

**Authentication errors:**
- Check that SUPABASE_ANON_KEY matches in both env files
- Verify your Supabase project is active

**File upload errors:**
- Ensure the `photos` storage bucket exists in Supabase
- Check bucket permissions

**Database errors:**
- Verify the SQL setup script ran successfully
- Check RLS policies are enabled

## Next Steps

After setup, you can:
1. Customize the photo editing tools
2. Configure payment integration
3. Add more AI photo processing features
4. Deploy to production

For deployment, remember to:
- Update FRONTEND_URL in backend `.env`
- Update CORS settings in `server/app.js`
- Set NODE_ENV to 'production'
