-- =============================================
-- Supabase Database Setup for alwaleed-backend
-- Run this in your Supabase SQL Editor
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Photo Table
-- =============================================
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_email TEXT NOT NULL,
  title TEXT NOT NULL,
  ai_tool TEXT CHECK (ai_tool IN ('visa-photo', 'absher-photo', 'absher-photo-female', 'saudi-look', 'baby-photo', 'family-photo')),
  original_url TEXT,
  edited_url TEXT,
  thumbnail_url TEXT,
  editing_settings JSONB DEFAULT '{}',
  price DECIMAL(10, 2) DEFAULT 0,
  print_size TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'ordered'))
);

-- Create index for user_email lookups
CREATE INDEX IF NOT EXISTS idx_photos_user_email ON photos(user_email);
CREATE INDEX IF NOT EXISTS idx_photos_status ON photos(status);

-- =============================================
-- Cart Items Table
-- =============================================
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_email TEXT NOT NULL,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  photo_title TEXT,
  photo_url TEXT,
  print_size TEXT DEFAULT '8x10' CHECK (print_size IN ('8x10', '11x14', '16x20', '24x36')),
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  price_per_item DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL
);

-- Create index for user_email lookups
CREATE INDEX IF NOT EXISTS idx_cart_user_email ON cart_items(user_email);

-- =============================================
-- Orders Table
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_email TEXT NOT NULL,
  order_number TEXT UNIQUE NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  vat_percentage DECIMAL(5, 4) DEFAULT 0.15,
  vat_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  shipping_address JSONB NOT NULL,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'shipped', 'delivered', 'cancelled')),
  tracking_number TEXT,
  order_date TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for user_email and order_number lookups
CREATE INDEX IF NOT EXISTS idx_orders_user_email ON orders(user_email);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Photos Policies
CREATE POLICY "Users can view their own photos"
  ON photos FOR SELECT
  USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can insert their own photos"
  ON photos FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can update their own photos"
  ON photos FOR UPDATE
  USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can delete their own photos"
  ON photos FOR DELETE
  USING (auth.jwt() ->> 'email' = user_email);

-- Cart Items Policies
CREATE POLICY "Users can view their own cart items"
  ON cart_items FOR SELECT
  USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can insert their own cart items"
  ON cart_items FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can update their own cart items"
  ON cart_items FOR UPDATE
  USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can delete their own cart items"
  ON cart_items FOR DELETE
  USING (auth.jwt() ->> 'email' = user_email);

-- Orders Policies
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can create their own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can update their own orders"
  ON orders FOR UPDATE
  USING (auth.jwt() ->> 'email' = user_email);

-- =============================================
-- Triggers for updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_photos_updated_at BEFORE UPDATE ON photos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
