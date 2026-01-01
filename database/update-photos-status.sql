-- Run this command in your Supabase SQL Editor to update the photos table status constraint
-- This allows 'pending' and 'paid' statuses for the payment workflow

-- Drop the existing check constraint
ALTER TABLE photos DROP CONSTRAINT IF EXISTS photos_status_check;

-- Add the updated constraint with pending and paid statuses
ALTER TABLE photos 
ADD CONSTRAINT photos_status_check 
CHECK (status IN ('draft', 'published', 'ordered', 'pending', 'paid'));
