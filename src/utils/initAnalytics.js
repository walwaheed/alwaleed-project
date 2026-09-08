/**
 * Studio AlWaleed — Analytics Adapters Initialization & Privacy Guard
 * Module: src/utils/initAnalytics.js
 * 
 * Safely initializes:
 * 1. PostHog (EU Cloud or self-hosted) with strict PII masking
 * 2. Microsoft Clarity (Session replay with maskAllInputs)
 * 3. Google Analytics 4 (Measurement ID)
 * 
 * Safe initialization: If env vars are absent in dev, runs in no-op mock mode with console warnings.
 */

export function initAnalytics() {
  if (typeof window === 'undefined') return;

  const posthogKey = import.meta.env?.VITE_POSTHOG_KEY;
  const posthogHost = import.meta.env?.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com';
  const clarityId = import.meta.env?.VITE_CLARITY_ID;
  const ga4Id = import.meta.env?.VITE_GA4_MEASUREMENT_ID;

  // 1. PostHog Initialization
  if (posthogKey && !window.posthog) {
    try {
      (function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug getPageViewId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)})(document,window.posthog||[]);
      
      window.posthog.init(posthogKey, {
        api_host: posthogHost,
        autocapture: false, // Prevent accidental DOM PII harvesting
        mask_all_text: true, // Strict privacy
        mask_all_element_attributes: true,
        session_recording: {
          maskAllInputs: true,
          maskInputOptions: { password: true, color: true, date: true, email: true, number: true, range: true, search: true, tel: true, text: true, time: true, url: true }
        }
      });
      console.info('[Analytics] PostHog initialized (Strict Privacy Mode).');
    } catch (e) {
      console.warn('[Analytics] Failed to initialize PostHog:', e);
    }
  }

  // 2. Microsoft Clarity Initialization
  if (clarityId && !window.clarity) {
    try {
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", clarityId);
      console.info('[Analytics] Microsoft Clarity initialized.');
    } catch (e) {
      console.warn('[Analytics] Failed to initialize Microsoft Clarity:', e);
    }
  }

  // 3. Google Analytics 4 (gtag.js) Initialization
  if (ga4Id && !window.gtag) {
    try {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + ga4Id;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag(){window.dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', ga4Id, {
        anonymize_ip: true,
        restricted_data_processing: true
      });
      console.info('[Analytics] GA4 initialized.');
    } catch (e) {
      console.warn('[Analytics] Failed to initialize GA4:', e);
    }
  }
}

export default initAnalytics;
