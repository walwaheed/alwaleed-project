const crmSupabase = require('./crm-supabase');

// Canonical stage order — mirrors the same 9 stages used on the Telegram
// side. Website leads currently only ever hit a subset of these
// (contacted, qualified, payment_pending, paid, booked) — the rest exist
// so the ordering stays correct if/when new triggers are added later.
const STAGE_ORDER = [
    'new_lead',
    'contacted',
    'qualified',
    'quotation_sent',
    'payment_pending',
    'paid',
    'booked',
    'completed',
    'returning_customer'
];

/**
 * Moves a CRM customer forward to targetStage, stamping the given
 * timestamp fields, but only if targetStage is actually further along
 * than their current stage. Never moves a customer backward, and never
 * re-stamps a stage they've already passed (safe against webhook retries).
 *
 * @param {string} email - matched against customers.wa_id (website leads
 *        use their email as wa_id, same convention as Website Booking Webhook)
 * @param {string} targetStage - one of STAGE_ORDER
 * @param {Object} timestampFields - e.g. { qualified_at: new Date().toISOString() }
 *        Can include more than one field (e.g. contacted_at + qualified_at together)
 */
async function advanceCrmStage(email, targetStage, timestampFields = {}) {
    if (!email) {
        console.warn('⚠️ advanceCrmStage called with no email — skipping');
        return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const targetIndex = STAGE_ORDER.indexOf(targetStage);

    if (targetIndex === -1) {
        console.error(`❌ Unknown CRM stage "${targetStage}" — check STAGE_ORDER`);
        return;
    }

    const { data: customer, error: findError } = await crmSupabase
        .from('customers')
        .select('wa_id, lifecycle_stage')
        .eq('wa_id', normalizedEmail)
        .maybeSingle();

    if (findError) {
        console.error('❌ CRM lookup error:', findError);
        return;
    }

    if (!customer) {
        // Website Booking Webhook (n8n) is responsible for creating the
        // CRM record on form submit. If a payment event arrives before
        // that record exists, something's out of order — log loudly
        // rather than silently creating a partial record here.
        console.error('⚠️ No CRM customer found for email:', normalizedEmail, '— cannot advance stage to', targetStage);
        return;
    }

    const currentIndex = STAGE_ORDER.indexOf(customer.lifecycle_stage);

    if (targetIndex <= currentIndex) {
        console.log(`ℹ️ CRM stage for ${normalizedEmail} already at/past "${targetStage}" (currently "${customer.lifecycle_stage}") — no change`);
        return;
    }

    const { error: updateError } = await crmSupabase
        .from('customers')
        .update({
            lifecycle_stage: targetStage,
            updated_at: new Date().toISOString(),
            ...timestampFields
        })
        .eq('wa_id', normalizedEmail);

    if (updateError) {
        console.error('❌ CRM stage update error:', updateError);
        return;
    }

    console.log(`✅ CRM stage advanced for ${normalizedEmail}: "${customer.lifecycle_stage}" → "${targetStage}"`);
}

module.exports = { advanceCrmStage, STAGE_ORDER };
