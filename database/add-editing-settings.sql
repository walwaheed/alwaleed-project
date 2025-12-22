-- Add missing editing_settings column to cart_items table
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS editing_settings JSONB DEFAULT '{}';
