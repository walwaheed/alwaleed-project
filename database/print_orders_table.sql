-- =============================================
-- Print Orders Table for CloudPrinter Integration
-- Run this in your Supabase SQL Editor
-- =============================================

-- Create print_orders table
CREATE TABLE IF NOT EXISTS print_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_email TEXT NOT NULL,
  product_type TEXT NOT NULL,
  order_data JSONB NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'cancelled')),
  paylink_transaction_id TEXT,
  cloudprinter_order_ref TEXT,
  cloudprinter_status TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'payment_pending', 'paid', 'submitted', 'failed', 'cancelled')),
  total_amount DECIMAL(10, 2),
  currency TEXT DEFAULT 'SAR'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_print_orders_user_email ON print_orders(user_email);
CREATE INDEX IF NOT EXISTS idx_print_orders_paylink_transaction ON print_orders(paylink_transaction_id);
CREATE INDEX IF NOT EXISTS idx_print_orders_status ON print_orders(status);

-- Enable RLS
ALTER TABLE print_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own print orders"
  ON print_orders FOR SELECT
  USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can insert their own print orders"
  ON print_orders FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can update their own print orders"
  ON print_orders FOR UPDATE
  USING (auth.jwt() ->> 'email' = user_email);

-- Trigger for updated_at
CREATE TRIGGER update_print_orders_updated_at 
  BEFORE UPDATE ON print_orders
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Comment
COMMENT ON TABLE print_orders IS 'Stores pending and completed print orders for CloudPrinter integration with Paylink payment';
