-- Remove the print_size CHECK constraint from cart_items table
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_print_size_check;
