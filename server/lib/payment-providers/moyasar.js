const fetch = require('node-fetch');

const MOYASAR_SECRET_KEY = process.env.MOYASAR_SECRET_KEY;
const MOYASAR_BASE_URL = 'https://api.moyasar.com/v1';

function getAuthHeader() {
    if (!MOYASAR_SECRET_KEY) {
        throw new Error('Moyasar credentials (MOYASAR_SECRET_KEY) are missing in environment variables.');
    }
    const credentials = `${MOYASAR_SECRET_KEY}:`;
    return `Basic ${Buffer.from(credentials).toString('base64')}`;
}

/**
 * Moyasar's own status values, normalized to the small standard set every
 * provider must report: 'paid' | 'pending' | 'failed'.
 * (failed covers Moyasar's failed/canceled/expired/voided — the caller
 * doesn't need Moyasar-specific vocabulary, just "didn't work".)
 */
function normalizeStatus(moyasarStatus) {
    if (moyasarStatus === 'paid') return 'paid';
    if (['failed', 'canceled', 'expired', 'voided'].includes(moyasarStatus)) return 'failed';
    return 'pending';
}

/**
 * @param {Object} params
 * @param {number} params.amount - in the currency's major unit (e.g. SAR, not halalas)
 * @param {string} params.description
 * @param {string} params.callbackUrl - server-to-server webhook URL
 * @param {string} params.successUrl - browser redirect on success/return
 * @param {string} params.backUrl - browser redirect on cancel
 * @returns {Promise<{id: string, checkoutUrl: string, raw: Object}>}
 */
async function createPayment({ amount, description, callbackUrl, successUrl, backUrl }) {
    const response = await fetch(`${MOYASAR_BASE_URL}/invoices`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': getAuthHeader()
        },
        body: JSON.stringify({
            amount: Math.round(amount * 100), // Moyasar wants halalas (smallest unit)
            currency: 'SAR',
            description,
            callback_url: callbackUrl,
            success_url: successUrl,
            back_url: backUrl
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Moyasar create invoice failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    return {
        id: data.id,
        checkoutUrl: data.url,
        raw: data
    };
}

/**
 * @param {string} paymentId - Moyasar invoice id
 * @returns {Promise<{id: string, status: string, raw: Object}>}
 */
async function getPaymentStatus(paymentId) {
    const response = await fetch(`${MOYASAR_BASE_URL}/invoices/${paymentId}`, {
        method: 'GET',
        headers: { 'Authorization': getAuthHeader() }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Moyasar fetch invoice failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    return {
        id: data.id,
        status: normalizeStatus(data.status),
        raw: data
    };
}

/**
 * Extracts the payment id from a raw incoming webhook body. Provider-specific
 * because different gateways shape their webhook payloads differently.
 */
function getPaymentIdFromWebhookBody(body) {
    return body?.id || null;
}

module.exports = {
    createPayment,
    getPaymentStatus,
    getPaymentIdFromWebhookBody
};
