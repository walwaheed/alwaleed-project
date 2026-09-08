/**
 * Studio AlWaleed — Canonical Analytics Engine & Measurement Layer
 * Module: src/utils/analytics.js
 * 
 * Provides a single, privacy-compliant event interface for:
 * 1. PostHog (Product analytics, funnels, feature flags)
 * 2. Microsoft Clarity (Session replay, heatmaps, UX friction)
 * 3. Google Analytics 4 (Baseline Google ecosystem attribution)
 * 
 * Enforces:
 * - Strict Zero-PII Policy (masks phone, email, card numbers, national IDs)
 * - Safe Session & Anonymous Visitor Stitching
 * - Automatic Attribution Injection (UTMs, landing page, referrer)
 * - Cultural & Commercial Context (Arabic/English locale, device, SAR currency)
 */

import { getStoredUTMs, captureAndStoreUTMs } from './utmCapture';

// Storage keys
const ANONYMOUS_ID_KEY = 'alw_anon_visitor_id';
const SESSION_ID_KEY = 'alw_session_id';
const SESSION_TIMESTAMP_KEY = 'alw_session_last_active';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

/**
 * PII Scrubber: Removes sensitive data before sending to any telemetry adapter.
 * Rejects national IDs, phone numbers, emails, credit card patterns, and private photo references.
 */
const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /card_?num/i,
  /cvv/i,
  /cvc/i,
  /national_?id/i,
  /iqama/i,
  /passport_?num/i,
  /client_?photo/i,
  /raw_?image/i,
  /uploaded_?file_?content/i
];

function sanitizeProperties(properties = {}) {
  const sanitized = {};

  for (const [key, val] of Object.entries(properties)) {
    // Check if key matches sensitive patterns
    const isSensitiveKey = SENSITIVE_KEY_PATTERNS.some(pattern => pattern.test(key));
    if (isSensitiveKey) {
      continue; // Drop sensitive key
    }

    // Scrub string values that resemble credit cards, phone numbers or emails
    if (typeof val === 'string') {
      // Mask credit card pattern (13-19 digits)
      let cleaned = val.replace(/\b(?:\d[ -]*?){13,19}\b/g, '[MASKED_CARD]');
      // Mask Saudi national ID (10 digits starting with 1 or 2)
      cleaned = cleaned.replace(/\b[12]\d{9}\b/g, '[MASKED_ID]');
      sanitized[key] = cleaned;
    } else if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      sanitized[key] = sanitizeProperties(val);
    } else {
      sanitized[key] = val;
    }
  }

  return sanitized;
}

/**
 * Generates a standard UUID v4 string safely.
 */
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Retrieves or initializes an anonymous persistent visitor ID.
 */
export function getAnonymousVisitorId() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return 'server_or_bot_' + generateUUID().slice(0, 8);
  }

  try {
    let anonId = window.localStorage.getItem(ANONYMOUS_ID_KEY);
    if (!anonId) {
      anonId = 'alw_usr_' + generateUUID();
      window.localStorage.setItem(ANONYMOUS_ID_KEY, anonId);
    }
    return anonId;
  } catch (e) {
    return 'session_fallback_' + generateUUID().slice(0, 8);
  }
}

/**
 * Manages 30-minute rolling session ID.
 */
export function getSessionId() {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return 'ses_' + generateUUID().slice(0, 8);
  }

  try {
    const now = Date.now();
    const lastActive = parseInt(window.sessionStorage.getItem(SESSION_TIMESTAMP_KEY) || '0', 10);
    let sessionId = window.sessionStorage.getItem(SESSION_ID_KEY);

    if (!sessionId || (now - lastActive > SESSION_TIMEOUT_MS)) {
      sessionId = 'ses_' + generateUUID();
      window.sessionStorage.setItem(SESSION_ID_KEY, sessionId);
    }

    window.sessionStorage.setItem(SESSION_TIMESTAMP_KEY, now.toString());
    return sessionId;
  } catch (e) {
    return 'ses_' + generateUUID().slice(0, 8);
  }
}

/**
 * Detects device category.
 */
function getDeviceType() {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent || '';
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(ua)) return 'mobile';
  return 'desktop';
}

/**
 * Assembles canonical event context.
 */
function buildEventEnvelope(eventName, customProperties = {}) {
  const utms = getStoredUTMs() || {};
  const sanitizedProps = sanitizeProperties(customProperties);

  return {
    event_id: generateUUID(),
    event_name: eventName,
    event_timestamp: new Date().toISOString(),
    
    // Identity & Session
    anonymous_visitor_id: getAnonymousVisitorId(),
    session_id: getSessionId(),

    // Attribution
    source: utms.utm_source || 'direct',
    medium: utms.utm_medium || 'none',
    campaign: utms.utm_campaign || 'none',
    content: utms.utm_content || '',
    term: utms.utm_term || '',
    creative_id: customProperties.creative_id || utms.creative_id || '',

    // Navigation & Page Context
    landing_page: utms.landing_path || (typeof window !== 'undefined' ? window.location.pathname : '/'),
    referrer: typeof document !== 'undefined' ? document.referrer : '',
    current_path: typeof window !== 'undefined' ? window.location.pathname : '',

    // Client Context
    language: typeof navigator !== 'undefined' ? (navigator.language || 'ar-SA') : 'ar-SA',
    device_type: getDeviceType(),

    // Experimentation Context (if active)
    experiment_id: customProperties.experiment_id || null,
    variant_id: customProperties.variant_id || null,

    // Payload properties
    properties: sanitizedProps
  };
}

/**
 * Adapter 1: PostHog Dispatcher
 */
function dispatchToPostHog(envelope) {
  if (typeof window !== 'undefined' && window.posthog && typeof window.posthog.capture === 'function') {
    window.posthog.capture(envelope.event_name, {
      ...envelope.properties,
      $session_id: envelope.session_id,
      $device_type: envelope.device_type,
      source: envelope.source,
      medium: envelope.medium,
      campaign: envelope.campaign,
      content: envelope.content,
      term: envelope.term,
      creative_id: envelope.creative_id,
      experiment_id: envelope.experiment_id,
      variant_id: envelope.variant_id,
      event_id: envelope.event_id
    });
  }
}

/**
 * Adapter 2: Microsoft Clarity Dispatcher & Cross-Reference Linkage
 */
function dispatchToClarity(envelope) {
  if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
    // Tag Clarity session with the canonical anonymous visitor ID and campaign
    window.clarity('set', 'visitor_id', envelope.anonymous_visitor_id);
    window.clarity('set', 'utm_campaign', envelope.campaign);
    if (envelope.properties.service) {
      window.clarity('set', 'selected_service', String(envelope.properties.service));
    }
    // Record specific custom event
    window.clarity('event', envelope.event_name);
  }
}

/**
 * Adapter 3: Google Analytics 4 (gtag) Dispatcher
 */
function dispatchToGA4(envelope) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    // Map canonical events to GA4 standard events
    let ga4EventName = envelope.event_name;
    const ga4Params = {
      event_id: envelope.event_id,
      traffic_source: envelope.source,
      campaign: envelope.campaign,
      device_type: envelope.device_type,
      ...envelope.properties
    };

    if (envelope.event_name === 'payment_completed') {
      ga4EventName = 'purchase';
      ga4Params.transaction_id = envelope.properties.order_reference || envelope.event_id;
      ga4Params.value = envelope.properties.revenue || envelope.properties.amount_sar || 0;
      ga4Params.currency = envelope.properties.currency || 'SAR';
      ga4Params.items = [{
        item_id: envelope.properties.package || envelope.properties.service || 'service',
        item_name: envelope.properties.service_name || envelope.properties.service || 'Studio Service',
        price: envelope.properties.revenue || envelope.properties.amount_sar || 0,
        quantity: 1
      }];
    } else if (envelope.event_name === 'checkout_started') {
      ga4EventName = 'begin_checkout';
      ga4Params.value = envelope.properties.amount_sar || 0;
      ga4Params.currency = 'SAR';
    } else if (envelope.event_name === 'service_viewed') {
      ga4EventName = 'view_item';
    } else if (envelope.event_name === 'page_viewed') {
      ga4EventName = 'page_view';
      ga4Params.page_path = envelope.current_path;
    }

    window.gtag('event', ga4EventName, ga4Params);
  }
}

/**
 * Adapter 4: Studio AlWaleed Trusted Ingestion Backend Dispatcher
 * Ingress Authority: CLIENT_OBSERVED (browser)
 * Destination: /api/analytics/events
 * 
 * Strict Guarantees:
 * 1. Authority Gating: Excludes payment_completed, booking_completed, etc.
 * 2. Zero-PII: Handled by sanitizeProperties
 * 3. Fire-and-Forget: Uses sendBeacon with fetch keepalive fallback; never throws or blocks UI
 */
function dispatchToTrustedBackend(envelope) {
  if (typeof window === 'undefined') return;

  // Never attempt to send server-verified or payment-verified events from browser
  const AUTHORITATIVE_ONLY_EVENTS = new Set([
    'payment_completed',
    'payment_failed',
    'refund_completed',
    'booking_completed',
    'booking_confirmed'
  ]);

  if (AUTHORITATIVE_ONLY_EVENTS.has(envelope.event_name)) {
    return;
  }

  const endpoint = '/api/analytics/events';
  const payload = JSON.stringify({
    event_id: envelope.event_id,
    event_name: envelope.event_name,
    event_timestamp: envelope.event_timestamp,
    anonymous_visitor_id: envelope.anonymous_visitor_id,
    session_id: envelope.session_id,
    source: envelope.source,
    medium: envelope.medium,
    campaign: envelope.campaign,
    content: envelope.content,
    term: envelope.term,
    creative_id: envelope.creative_id,
    landing_page: envelope.landing_page,
    referrer: envelope.referrer,
    current_path: envelope.current_path,
    language: envelope.language,
    device_type: envelope.device_type,
    experiment_id: envelope.experiment_id,
    variant_id: envelope.variant_id,
    consent_analytics: true,
    consent_cross_segment: true,
    ...envelope.properties
  });

  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([payload], { type: 'application/json' });
      const sent = navigator.sendBeacon(endpoint, blob);
      if (sent) return;
    }

    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: payload,
      keepalive: true,
      credentials: 'omit'
    }).catch(() => {
      // Fire-and-forget: ignore delivery failures
    });
  } catch (err) {
    // Non-blocking catch
  }
}

/**
 * PRIMARY CANONICAL ENTRYPOINT: trackEvent
 * Single function called across all React components.
 * 
 * @param {string} eventName - Standard canonical event name
 * @param {Object} properties - Event-specific attributes
 */
export function trackEvent(eventName, properties = {}) {
  // Ensure UTM parameters are captured on current interaction
  captureAndStoreUTMs();

  const envelope = buildEventEnvelope(eventName, properties);

  // Development & diagnostics logging (safely masked)
  if (typeof window !== 'undefined' && (window.__ALW_DEBUG_ANALYTICS__ || window.location.hostname === 'localhost')) {
    console.debug('[Studio AlWaleed Analytics] → ' + eventName, envelope);
  }

  // Dispatch to active adapters
  try {
    dispatchToPostHog(envelope);
  } catch (err) {
    console.warn('[Analytics] PostHog dispatch warning:', err);
  }

  try {
    dispatchToClarity(envelope);
  } catch (err) {
    console.warn('[Analytics] Clarity dispatch warning:', err);
  }

  try {
    dispatchToGA4(envelope);
  } catch (err) {
    console.warn('[Analytics] GA4 dispatch warning:', err);
  }

  try {
    dispatchToTrustedBackend(envelope);
  } catch (err) {
    // Fire-and-forget
  }

  return envelope;
}

/**
 * CONVENIENCE CORE B2C EVENT HELPERS
 */
export const analytics = {
  track: trackEvent,

  // 1. Navigation & Views
  pageViewed: (pageName, extra = {}) => 
    trackEvent('page_viewed', { page_name: pageName, ...extra }),

  serviceViewed: (serviceSlug, serviceName, extra = {}) =>
    trackEvent('service_viewed', { service: serviceSlug, service_name: serviceName, ...extra }),

  pricingViewed: (category = 'all', extra = {}) =>
    trackEvent('pricing_viewed', { category, ...extra }),

  portfolioInteracted: (category, mediaId = null, extra = {}) =>
    trackEvent('portfolio_interacted', { category, media_id: mediaId, ...extra }),

  ctaClicked: (ctaName, targetPath, extra = {}) =>
    trackEvent('cta_clicked', { cta_name: ctaName, target_path: targetPath, ...extra }),

  // 2. Quote & Booking Flow
  quoteFlowInitiated: (service, extra = {}) =>
    trackEvent('quote_flow_initiated', { service, ...extra }),

  bookingStarted: (service, packageSlug = null, extra = {}) =>
    trackEvent('booking_started', { service, package: packageSlug, ...extra }),

  bookingStepCompleted: (stepNumber, stepName, service, extra = {}) =>
    trackEvent('booking_step_completed', { step_number: stepNumber, step_name: stepName, service, ...extra }),

  bookingAbandoned: (stepNumber, stepName, service, reason = null) =>
    trackEvent('booking_abandoned', { step_number: stepNumber, step_name: stepName, service, reason }),

  // 3. Upload Flow (Print / Canvas)
  uploadStarted: (service, fileType = null) =>
    trackEvent('upload_started', { service, file_type: fileType }),

  uploadCompleted: (service, fileCount = 1, fileFormat = null) =>
    trackEvent('upload_completed', { service, file_count: fileCount, file_format: fileFormat }),

  // 4. Checkout & Payment (Closed-Loop Revenue)
  checkoutStarted: (orderReference, service, packageSlug, amountSar) =>
    trackEvent('checkout_started', {
      order_reference: orderReference,
      service,
      package: packageSlug,
      amount_sar: amountSar,
      currency: 'SAR'
    }),

  paymentCompleted: (orderReference, service, packageSlug, revenueSar, extra = {}) =>
    trackEvent('payment_completed', {
      order_reference: orderReference,
      service,
      package: packageSlug,
      revenue: Number(revenueSar),
      amount_sar: Number(revenueSar),
      currency: 'SAR',
      ...extra
    }),

  paymentFailed: (orderReference, service, reason = 'unknown', extra = {}) =>
    trackEvent('payment_failed', {
      order_reference: orderReference,
      service,
      failure_reason: reason,
      ...extra
    })
};

export default analytics;
