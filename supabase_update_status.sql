-- Run this command in your Supabase SQL Editor to allow 'paid' as a status
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders 
ADD CONSTRAINT orders_status_check 
CHECK (status = ANY (ARRAY['pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']::text[]));
