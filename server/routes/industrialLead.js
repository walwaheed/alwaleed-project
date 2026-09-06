/**
 * Studio AlWaleed — Industrial Lead Intake Server-Side Proxy Router
 * Route: POST /api/leads/industrial
 * 
 * SECURITY & GOVERNANCE:
 * 1. Zero secrets in browser: Intake token is injected exclusively on the server.
 * 2. Same-origin: Eliminates CORS complexity for browser clients.
 * 3. Server-side honeypot: Drops bots silently before invoking n8n.
 * 4. Resilient forwarding: Forwards to n8n webhook with a 12s timeout.
 */

const express = require('express');
const router = express.Router();

const N8N_WEBHOOK_URL = process.env.N8N_INDUSTRIAL_WEBHOOK_URL || 'https://n8n.alwaleed.pro/webhook/industrial-lead-intake-v1';
const INTAKE_TOKEN = process.env.INDUSTRIAL_INTAKE_TOKEN || 'alw_lead_prod_safe_2026';

router.post('/', async (req, res) => {
  try {
    const body = req.body || {};

    // 1. Server-side Honeypot Check (silent drop if bot filled hidden field)
    const honeypot = (body.companyFaxExt || '').toString().trim();
    if (honeypot !== '') {
      console.warn('[Security] Honeypot triggered in server-side proxy. Silently dropping bot submission.');
      return res.status(200).json({
        success: true,
        lead_id: 'rec_bot_' + Date.now(),
        status: 'RECEIVED',
        message: 'Request received'
      });
    }

    // 2. Required Fields Validation
    const fullName = (body.fullName || '').toString().trim();
    const companyName = (body.companyName || '').toString().trim();
    const jobTitle = (body.jobTitle || '').toString().trim();
    const workEmail = (body.workEmail || '').toString().trim();
    const phone = (body.phone || '').toString().trim();
    const city = (body.city || '').toString().trim();
    const primaryGrowthProblem = (body.primaryGrowthProblem || '').toString().trim();

    if (!fullName || !companyName || !jobTitle || !workEmail || !phone || !city || !primaryGrowthProblem) {
      return res.status(400).json({
        success: false,
        error: 'Missing required lead fields'
      });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(workEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid work email format'
      });
    }

    // 3. Forward to n8n intake webhook with server-side authentication
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-alwaleed-intake-token': INTAKE_TOKEN
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const responseText = await n8nResponse.text();
    let responseData = {};
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { raw: responseText };
    }

    if (!n8nResponse.ok) {
      console.error('[Industrial Intake Proxy] Upstream n8n error status:', n8nResponse.status, responseData);
      return res.status(n8nResponse.status >= 500 ? 502 : n8nResponse.status).json({
        success: false,
        error: responseData.error || responseData.message || 'Intake processor temporarily unavailable. Please retry.'
      });
    }

    // 4. Return sanitized success to frontend
    return res.status(200).json({
      success: true,
      lead_id: responseData.lead_id || ('lead_' + Date.now()),
      status: responseData.status || 'RECEIVED'
    });

  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('[Industrial Intake Proxy] Request to n8n timed out after 12s');
      return res.status(504).json({
        success: false,
        error: 'Intake processor timed out. Please try again shortly.'
      });
    }

    console.error('[Industrial Intake Proxy] Forwarding error:', error.message);
    return res.status(502).json({
      success: false,
      error: 'Unable to connect to intake processor. Please try again shortly.'
    });
  }
});

module.exports = router;
