# Alwaleed Photo Studio - Backend Setup

This is a full-stack photo editing and printing application built with React (frontend) and Node.js/Express (backend), powered by Supabase for database and storage.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Supabase account

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

#### Backend (.env)
Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development

SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here

FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env.local)
Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Setup Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL script from `database/setup.sql`
4. Create a storage bucket named `photos` in Supabase Storage (make it public for easier access)

### 4. Run the Application

```bash
# Run both frontend and backend concurrently
npm run dev:all

# OR run them separately:

# Terminal 1 - Frontend (Vite)
npm run dev

# Terminal 2 - Backend (Express)
npm run server
```

The frontend will be available at `http://localhost:5173`
The backend API will be available at `http://localhost:5000`

## 📁 Project Structure

```
alwaleed-backend/
├── server/                 # Backend (Express)
│   ├── app.js             # Main Express application
│   ├── lib/
│   │   └── supabase.js    # Supabase admin client
│   ├── middleware/
│   │   ├── auth.js        # JWT authentication middleware
│   │   └── errorHandler.js
│   └── routes/
│       ├── photos.js      # Photo CRUD operations
│       ├── cart.js        # Shopping cart operations
│       ├── orders.js      # Order management
│       └── upload.js      # File upload handling
├── src/                   # Frontend (React)
│   ├── api/
│   │   ├── client.js      # API client
│   │   └── index.js
│   ├── components/
│   ├── hooks/
│   │   └── useAuth.js     # Authentication hook
│   ├── lib/
│   │   └── supabase.js    # Supabase client (frontend)
│   ├── pages/
│   └── utils/
├── database/
│   └── setup.sql          # Database schema
└── package.json
```

## 🔐 Authentication

This app uses Supabase Auth with JWT tokens:

1. Users sign up/sign in via Supabase Auth
2. Frontend receives a JWT access token
3. All API requests include `Authorization: Bearer <token>` header
4. Backend verifies token before processing requests

## 🛡️ Security Features

- **Helmet**: Security headers
- **CORS**: Whitelisted origins only
- **JWT Auth**: Token-based authentication
- **Row Level Security (RLS)**: Database-level security in Supabase
- **File Upload Validation**: Image files only, 10MB max

## 📡 API Endpoints

### Photos
- `GET /api/photos` - Get all user photos
- `GET /api/photos/:id` - Get single photo
- `POST /api/photos` - Create new photo
- `PUT /api/photos/:id` - Update photo
- `DELETE /api/photos/:id` - Delete photo

### Cart
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove cart item
- `DELETE /api/cart` - Clear cart

### Orders
- `GET /api/orders` - Get all user orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status

### Upload
- `POST /api/upload` - Upload single photo
- `POST /api/upload/multiple` - Upload multiple photos
- `DELETE /api/upload/:path` - Delete photo from storage

## 🗄️ Database Schema

The application uses three main tables:

- **photos**: Store photo metadata and URLs
- **cart_items**: Shopping cart items
- **orders**: Order history and details

All tables include Row Level Security (RLS) policies to ensure users can only access their own data.

## 🔧 Development Notes

- Frontend proxies `/api` requests to `http://localhost:5000` during development
- Backend uses Supabase service role key (bypasses RLS for admin operations)
- Frontend uses Supabase anon key (respects RLS policies)

## 📝 License

MIT