const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const crmSupabaseUrl = process.env.CRM_SUPABASE_URL;
const crmSupabaseServiceKey = process.env.CRM_SUPABASE_SERVICE_ROLE_KEY;

if (!crmSupabaseUrl || !crmSupabaseServiceKey) {
    throw new Error('Missing CRM Supabase configuration. Please check your .env file (CRM_SUPABASE_URL, CRM_SUPABASE_SERVICE_ROLE_KEY).');
}

// Admin client for the CRM project (bgyffyrwnyhwtwcjwqug) — separate from
// this app's own Supabase project (alwaleed-app). Used only to write
// forward-only lifecycle stage updates back to the CRM when a website
// payment event happens.
const crmSupabase = createClient(crmSupabaseUrl, crmSupabaseServiceKey);

module.exports = crmSupabase;
