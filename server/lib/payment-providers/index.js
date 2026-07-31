// Provider selector. To add a new gateway later: write a new file in this
// folder implementing the same three functions (createPayment,
// getPaymentStatus, getPaymentIdFromWebhookBody), then add it below.
// No route code anywhere else needs to change.

const PROVIDER_NAME = process.env.PAYMENT_PROVIDER || 'moyasar';

const providers = {
    moyasar: require('./moyasar')
    // paylink: require('./paylink'), // example of how a future provider slots in
};

const provider = providers[PROVIDER_NAME];

if (!provider) {
    throw new Error(`Unknown PAYMENT_PROVIDER "${PROVIDER_NAME}". Available: ${Object.keys(providers).join(', ')}`);
}

module.exports = provider;
