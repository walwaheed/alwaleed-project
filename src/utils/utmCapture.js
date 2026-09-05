/**
 * Studio AlWaleed — Marketing Attribution & Input Validation Utility
 * Module: src/utils/utmCapture.js
 * 
 * Safe client-side utility for:
 * 1. Capturing and persisting UTM parameters via namespaced sessionStorage.
 * 2. Normalizing Saudi mobile numbers (+9665XXXXXXXX standard).
 * 3. Validating B2B corporate work emails.
 */

const UTM_STORAGE_KEY = 'alw_marketing_attribution';

/**
 * Capture UTM query parameters from the current URL and store in sessionStorage.
 * Preserves initial touch if already captured in the current browser session.
 */
export function captureAndStoreUTMs() {
  if (typeof window === 'undefined' || !window.sessionStorage) return null;

  try {
    const searchParams = new URLSearchParams(window.location.search);
    const utmSource = searchParams.get('utm_source');
    const utmMedium = searchParams.get('utm_medium');
    const utmCampaign = searchParams.get('utm_campaign');
    const utmContent = searchParams.get('utm_content');
    const utmTerm = searchParams.get('utm_term');

    // Check if new UTMs are present in the current URL
    const hasIncomingUTMs = Boolean(utmSource || utmMedium || utmCampaign || utmContent || utmTerm);

    const existingDataStr = window.sessionStorage.getItem(UTM_STORAGE_KEY);
    let existingData = null;
    if (existingDataStr) {
      try {
        existingData = JSON.parse(existingDataStr);
      } catch (e) {
        existingData = null;
      }
    }

    if (hasIncomingUTMs || !existingData) {
      const attributionPayload = {
        utm_source: utmSource || (existingData && existingData.utm_source) || (document.referrer ? 'referral' : 'direct'),
        utm_medium: utmMedium || (existingData && existingData.utm_medium) || (document.referrer ? 'external' : 'none'),
        utm_campaign: utmCampaign || (existingData && existingData.utm_campaign) || 'industrial_beachhead_v1',
        utm_content: utmContent || (existingData && existingData.utm_content) || '',
        utm_term: utmTerm || (existingData && existingData.utm_term) || '',
        referrer: document.referrer || (existingData && existingData.referrer) || '',
        landing_path: window.location.pathname || '/industrial-growth',
        captured_at: new Date().toISOString(),
        raw_query: window.location.search || (existingData && existingData.raw_query) || ''
      };

      window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(attributionPayload));
      return attributionPayload;
    }

    return existingData;
  } catch (err) {
    console.warn('[utmCapture] Error storing attribution:', err);
    return null;
  }
}

/**
 * Retrieve the current attribution object from sessionStorage.
 */
export function getStoredUTMs() {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return {
      utm_source: 'direct',
      utm_medium: 'none',
      utm_campaign: 'industrial_beachhead_v1',
      utm_content: '',
      utm_term: '',
      referrer: '',
      landing_path: '/industrial-growth',
      captured_at: new Date().toISOString()
    };
  }

  try {
    const dataStr = window.sessionStorage.getItem(UTM_STORAGE_KEY);
    if (dataStr) {
      return JSON.parse(dataStr);
    }
  } catch (err) {
    console.warn('[utmCapture] Error reading attribution:', err);
  }

  return {
    utm_source: 'direct',
    utm_medium: 'none',
    utm_campaign: 'industrial_beachhead_v1',
    utm_content: '',
    utm_term: '',
    referrer: typeof document !== 'undefined' ? document.referrer : '',
    landing_path: typeof window !== 'undefined' ? window.location.pathname : '/industrial-growth',
    captured_at: new Date().toISOString()
  };
}

/**
 * Normalizes Saudi mobile numbers into E.164 standard (+9665XXXXXXXX)
 * STRICT QA SPECIFICATION:
 * Accepts ONLY Saudi mobile numbers:
 * - 05XXXXXXXX (10 digits starting with 05)
 * - 5XXXXXXXX (9 digits starting with 5)
 * - 9665XXXXXXXX (12 digits starting with 9665)
 * - +9665XXXXXXXX (12 digits starting with +9665)
 * - Spaced variants (e.g. 05X XXX XXXX)
 * 
 * REJECTS:
 * - Landlines (011, 012, 013, etc.)
 * - Invalid length (< 9 or > 12 digits)
 * - International or non-Saudi mobile numbers
 * - Arbitrary 9+ digit numbers not matching Saudi mobile prefix
 */
export function normalizeSaudiPhone(rawPhone = '') {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return {
      isValid: false,
      normalized: '',
      formatted: '',
      error: 'رقم الجوال مطلوب (Mobile phone number is required)'
    };
  }

  // Strip all non-digit characters
  const digitsOnly = rawPhone.replace(/\D/g, '');

  let nationalMobileNumber = '';

  // 1. Variant: 9665XXXXXXXX (12 digits starting with 9665)
  if (digitsOnly.startsWith('9665') && digitsOnly.length === 12) {
    nationalMobileNumber = digitsOnly.slice(3); // 5XXXXXXXX (9 digits)
  }
  // 2. Variant: 05XXXXXXXX (10 digits starting with 05)
  else if (digitsOnly.startsWith('05') && digitsOnly.length === 10) {
    nationalMobileNumber = digitsOnly.slice(1); // 5XXXXXXXX (9 digits)
  }
  // 3. Variant: 5XXXXXXXX (9 digits starting with 5)
  else if (digitsOnly.startsWith('5') && digitsOnly.length === 9) {
    nationalMobileNumber = digitsOnly; // 5XXXXXXXX (9 digits)
  }
  // Any other pattern is invalid (landlines 011/012/013, foreign numbers, random digits)
  else {
    return {
      isValid: false,
      normalized: '',
      formatted: rawPhone,
      error: 'يرجى إدخال رقم جوال سعودي صحيح يبدأ بـ 05 (Valid Saudi mobile required: 05XXXXXXXX)'
    };
  }

  // Exact verification: nationalMobileNumber must be exactly 9 digits and start with '5'
  if (nationalMobileNumber.length !== 9 || !nationalMobileNumber.startsWith('5')) {
    return {
      isValid: false,
      normalized: '',
      formatted: rawPhone,
      error: 'يرجى إدخال رقم جوال سعودي صحيح يبدأ بـ 05 (Must start with 05)'
    };
  }

  const normalized = '+966' + nationalMobileNumber;
  const formatted = '+966 ' + nationalMobileNumber.slice(0, 2) + ' ' + nationalMobileNumber.slice(2, 5) + ' ' + nationalMobileNumber.slice(5);

  return {
    isValid: true,
    normalized,
    formatted,
    error: null
  };
}

/**
 * Validates corporate B2B work email.
 * Detects public webmail providers and issues a diagnostic advisory.
 */
const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'icloud.com',
  'mail.ru',
  'protonmail.com',
  'aol.com'
]);

export function validateWorkEmail(email = '') {
  const trimmed = (email || '').trim().toLowerCase();
  
  if (!trimmed) {
    return {
      isValid: false,
      isCorporateDomain: false,
      error: 'البريد الإلكتروني للعمل مطلوب (Work email is required)'
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return {
      isValid: false,
      isCorporateDomain: false,
      error: 'يرجى إدخال صيغة بريد إلكتروني صحيحة (Invalid email format)'
    };
  }

  const domain = trimmed.split('@')[1] || '';
  const isCorporateDomain = !FREE_EMAIL_DOMAINS.has(domain);

  return {
    isValid: true,
    isCorporateDomain,
    email: trimmed,
    domain,
    warning: !isCorporateDomain
      ? 'يُفضّل استخدام بريد الشركة الرسمي لتسريع تدقيق ومراجعة الطلب (Company email preferred)'
      : null,
    error: null
  };
}
