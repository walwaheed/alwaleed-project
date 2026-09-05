import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Factory, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Search, 
  FileText, 
  TrendingUp, 
  Clock, 
  AlertCircle, 
  HelpCircle, 
  ChevronDown, 
  Globe, 
  Layers, 
  Lock, 
  Send,
  Sparkles,
  BarChart3,
  Compass,
  Cpu,
  Workflow,
  ArrowUpRight,
  Check
} from 'lucide-react';
import { captureAndStoreUTMs, getStoredUTMs, normalizeSaudiPhone, validateWorkEmail } from '@/utils/utmCapture';
import logoImg from '@/assets/alwaleed_Waleed-logo.png';

export default function IndustrialGrowthLandingPage() {
  const [lang, setLang] = useState('ar'); // 'ar' | 'en'
  const isAr = lang === 'ar';

  // ══════════════════════════════════════════════════════════════
  // STUDIO ALWALEED — APPROVED TYPOGRAPHY SYSTEM (LATO + TAJAWAL)
  // VISUAL PARITY REFERENCE: APPROVED LATO ENGLISH SPECIMEN
  // ARABIC: Tajawal (900 Black for H1/H2, 700 Bold for CTAs/subheads, 400/500 for body/UI)
  // LATIN:  Lato    (900 Black for H1/H2, 700 Bold for CTAs/subheads, 400 for body/UI)
  // NUMERICS & TECHNICAL TERMS: Lato (5,000, RFQs, B2B, OS, 15)
  // ══════════════════════════════════════════════════════════════
  const fontDisplayClass = isAr ? 'font-tajawal font-black' : 'font-lato font-black';
  const fontSubheadClass = isAr ? 'font-tajawal font-bold' : 'font-lato font-bold';
  const fontBodyClass = isAr ? 'font-tajawal font-normal' : 'font-lato font-normal';

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    jobTitle: '',
    workEmail: '',
    phone: '',
    city: 'Dammam',
    primaryGrowthProblem: 'discoverability',
    websiteUrl: '',
    linkedinUrl: '',
    // Honeypot field (hidden from real users)
    companyFaxExt: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [emailWarning, setEmailWarning] = useState(null);
  const [phoneFormatted, setPhoneFormatted] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Capture UTMs on page mount
  useEffect(() => {
    captureAndStoreUTMs();
    document.title = isAr 
      ? 'فحص النمو الرقمي الصناعي | استوديو الوليد — المنطقة الشرقية'
      : 'Industrial Digital Growth Screening | Studio AlWaleed — Eastern Province';
  }, [isAr]);

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Real-time phone validation & formatting
    if (name === 'phone') {
      const res = normalizeSaudiPhone(value);
      if (res.isValid) {
        setPhoneFormatted(res.formatted);
        setFormErrors(prev => ({ ...prev, phone: null }));
      } else if (value.length > 3) {
        setPhoneFormatted('');
        setFormErrors(prev => ({ ...prev, phone: isAr ? res.error : 'Please enter a valid Saudi mobile (05XXXXXXXX)' }));
      } else {
        setPhoneFormatted('');
        setFormErrors(prev => ({ ...prev, phone: null }));
      }
    }

    // Real-time work email validation
    if (name === 'workEmail') {
      const res = validateWorkEmail(value);
      if (!res.isValid && value.length > 5) {
        setFormErrors(prev => ({ ...prev, workEmail: isAr ? res.error : 'Invalid email format' }));
        setEmailWarning(null);
      } else {
        setFormErrors(prev => ({ ...prev, workEmail: null }));
        setEmailWarning(res.warning);
      }
    }

    // Clear field error on change
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Validate entire form
  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = isAr ? 'الاسم الكامل مطلوب' : 'Full name is required';
    }
    if (!formData.companyName.trim()) {
      errors.companyName = isAr ? 'اسم الشركة مطلوب' : 'Company name is required';
    }
    if (!formData.jobTitle.trim()) {
      errors.jobTitle = isAr ? 'المسمى الوظيفي مطلوب' : 'Role/position is required';
    }

    const emailCheck = validateWorkEmail(formData.workEmail);
    if (!emailCheck.isValid) {
      errors.workEmail = isAr ? emailCheck.error : 'Valid work email is required';
    }

    const phoneCheck = normalizeSaudiPhone(formData.phone);
    if (!phoneCheck.isValid) {
      errors.phone = isAr ? phoneCheck.error : 'Valid Saudi mobile (05XXXXXXXX) is required';
    }

    if (!formData.city) {
      errors.city = isAr ? 'يرجى اختيار المدينة' : 'City is required';
    }
    if (!formData.primaryGrowthProblem) {
      errors.primaryGrowthProblem = isAr ? 'يرجى تحديد العائق التجاري' : 'Growth problem is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Safe Local/Staging Submission Handler (NO GHL or CRM writes)
  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Honeypot check
    if (formData.companyFaxExt && formData.companyFaxExt.trim() !== '') {
      console.warn('[Security] Honeypot triggered. Aborting submission.');
      setSubmissionResult({
        success: true,
        isBotFiltered: true,
        message: 'Request processed'
      });
      return;
    }

    // 2. Validate form
    if (!validateForm()) {
      const firstErrorKey = Object.keys(formErrors)[0];
      const elem = document.querySelector(`[name="${firstErrorKey}"]`);
      if (elem) elem.focus();
      return;
    }

    setIsSubmitting(true);

    // 3. Collect UTM parameters from sessionStorage
    const storedUTMs = getStoredUTMs();
    const phoneNorm = normalizeSaudiPhone(formData.phone);

    // 4. Construct sanitized local payload
    const sanitizedPayload = {
      event_type: 'INDUSTRIAL_SCREENING_REQUEST',
      mode: 'PRODUCTION_SAFE_STANDALONE',
      timestamp: new Date().toISOString(),
      account: {
        company_name: formData.companyName.trim(),
        city: formData.city,
        corridor: ['Dammam', 'Jubail', 'Ras Al Khair', 'Dhahran'].includes(formData.city) ? 'EASTERN_PROVINCE_CORE' : 'OTHER',
        website_url: formData.websiteUrl.trim() || null,
        linkedin_url: formData.linkedinUrl.trim() || null
      },
      contact: {
        full_name: formData.fullName.trim(),
        job_title: formData.jobTitle.trim(),
        work_email: formData.workEmail.trim().toLowerCase(),
        phone_raw: formData.phone.trim(),
        phone_normalized: phoneNorm.normalized,
        is_corporate_email: validateWorkEmail(formData.workEmail).isCorporateDomain
      },
      diagnostic: {
        primary_growth_problem: formData.primaryGrowthProblem,
        preliminary_offer: 'FREE_15MIN_SCREENING',
        validation_audit_eligible: true,
        target_audit_price_sar: 5000
      },
      attribution: {
        utm_source: storedUTMs.utm_source,
        utm_medium: storedUTMs.utm_medium,
        utm_campaign: storedUTMs.utm_campaign,
        utm_content: storedUTMs.utm_content,
        utm_term: storedUTMs.utm_term,
        referrer: storedUTMs.referrer,
        landing_path: storedUTMs.landing_path,
        captured_at: storedUTMs.captured_at
      },
      governance: {
        crm_sync_status: 'PENDING_OFFICIAL_GATE_APPROVAL',
        ghl_location_target: 'prodlPguoE4KvfmCCIcC',
        human_review_required: true,
        lifecycle_stage: 'LEAD',
        tags: ['INDUSTRIAL_B2B_V1', 'SCREENING_REQUEST', 'PRODUCTION_SAFE']
      }
    };

    // 5. Store locally in sessionStorage history for testing
    try {
      const history = JSON.parse(sessionStorage.getItem('alw_staged_submissions') || '[]');
      history.push(sanitizedPayload);
      sessionStorage.setItem('alw_staged_submissions', JSON.stringify(history));
    } catch (err) {
      console.warn('Local storage error:', err);
    }

    console.log('[Studio AlWaleed — Local Staging Payload]:', sanitizedPayload);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmissionResult({
        success: true,
        payload: sanitizedPayload,
        timestamp: new Date().toLocaleTimeString(isAr ? 'ar-SA' : 'en-US')
      });
    }, 600);
  };

  const scrollToForm = () => {
    const el = document.getElementById('screening-form-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToPillars = () => {
    const el = document.getElementById('diagnostic-pillars-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div 
      dir={isAr ? 'rtl' : 'ltr'} 
      className={`min-h-screen bg-white text-neutral-900 ${isAr ? 'font-tajawal' : 'font-lato'} selection:bg-neutral-900 selection:text-white`}
    >
      {/* ── TOP EDITORIAL ANNOUNCEMENT BAR ── */}
      <div className="bg-neutral-50 border-b border-neutral-200 text-xs py-2.5 px-6 text-neutral-600">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-block w-2 h-2 rounded-full bg-[#175CD3]" />
            <span className="tracking-wide font-medium">
              {isAr 
                ? 'فحص النمو الرقمي للمنشآت الصناعية • المنطقة الشرقية (الدمام، الجبيل، رأس الخير، الظهران)'
                : 'Industrial Digital Growth Screening • Eastern Province (Dammam, Jubail, Ras Al Khair, Dhahran)'}
            </span>
          </div>
          <button
            onClick={() => setLang(isAr ? 'en' : 'ar')}
            className="flex items-center gap-1.5 text-xs text-neutral-800 hover:text-black font-semibold px-2.5 py-0.5 rounded border border-neutral-300 bg-white hover:bg-neutral-100 transition shadow-2xs font-lato"
          >
            <Globe className="w-3 h-3 text-neutral-600" />
            <span>{isAr ? 'English' : 'عربي'}</span>
          </button>
        </div>
      </div>

      {/* ── MINIMAL EXECUTIVE HEADER ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-6 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <img 
              src={logoImg} 
              alt="Studio AlWaleed" 
              className="h-9 w-auto object-contain filter grayscale contrast-125"
            />
            <div className="border-s border-neutral-300 ps-3.5 text-start">
              <span className={`text-sm font-bold tracking-tight text-neutral-900 block uppercase ${fontSubheadClass}`}>
                {isAr ? 'استوديو الوليد' : 'Studio AlWaleed'}
              </span>
              <span className="text-[11px] text-neutral-500 font-mono tracking-wider uppercase block font-lato">
                {isAr ? 'منظومة النمو الصناعي B2B' : 'Industrial Growth Systems'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={scrollToForm}
              className={`px-5 py-2.5 rounded bg-neutral-950 hover:bg-neutral-800 text-white text-xs tracking-wide transition shadow-xs flex items-center gap-2.5 ${fontSubheadClass}`}
            >
              <span className="w-2 h-2 rounded-full bg-[#B5121B] shrink-0 animate-pulse" />
              <span>
                {isAr ? (
                  <>طلب الفحص الأولي (<span dir="ltr" className="font-lato font-bold">15</span> دقيقة)</>
                ) : (
                  'Request Initial Screening (15m)'
                )}
              </span>
              {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── 01 HERO SECTION (PREMIUM EDITORIAL WHITE) ── */}
      {/* Visual Parity with Approved Lato English Reference Specimen */}
      <section className="relative pt-20 pb-20 md:pt-28 md:pb-28 px-6 overflow-hidden bg-white border-b border-neutral-200 text-start">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-4xl">
            {/* Small Category Label in Technical Blue (Restrained communication signal) */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded border border-blue-200 bg-blue-50/80 text-[11px] font-mono tracking-widest text-[#175CD3] uppercase mb-8 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#175CD3]" />
              <span>
                {isAr ? (
                  <span className="flex items-center gap-2 font-mono">
                    <span>أنظمة النمو الصناعي • المنطقة الشرقية</span>
                    <span className="text-blue-300">|</span>
                    <span className="font-lato font-bold">B2B COMMERCIAL DIAGNOSTIC OS</span>
                  </span>
                ) : (
                  'B2B COMMERCIAL DIAGNOSTIC OS // EASTERN PROVINCE'
                )}
              </span>
            </div>

            {/* Main Headline: Increased line-height & balanced container for breathing room */}
            <h1 className={`text-3xl sm:text-5xl lg:text-[50px] tracking-tight text-neutral-950 mb-8 max-w-4xl ${
              isAr ? 'leading-[1.38] font-tajawal font-black' : 'leading-[1.26] font-lato font-black'
            }`}>
              {isAr ? (
                <>
                  قد لا تعكس الواجهة الرقمية كامل القدرات الفنية لمصنعك أمام كبرى الشركات والمقاولين.
                  <span className="text-[#B5121B] block mt-3 font-black">
                    نقوم بتشخيص مواطن الهدر التجاري وتقييم فجوات مسار طلبات التسعير (<span dir="ltr" className="font-lato font-black">RFQs</span>)&rlm;.
                  </span>
                </>
              ) : (
                <>
                  Your digital presence may not reflect the true technical depth of your plant to tier-1 contractors and enterprise buyers.{' '}
                  <span className="text-[#B5121B] block mt-3 font-black">
                    We diagnose commercial leakage and evaluate friction points across your RFQ pipeline.
                  </span>
                </>
              )}
            </h1>

            {/* Supporting Paragraph: Enhanced size and readability */}
            <p className={`text-base sm:text-lg text-neutral-600 max-w-3xl mb-12 leading-relaxed ${
              isAr ? 'font-tajawal text-[17px] sm:text-[19px] leading-[1.8]' : 'font-lato text-[16px] sm:text-[18px] leading-[1.7]'
            }`}>
              {isAr ? (
                <>
                  نساعد المنشآت الصناعية في المنطقة الشرقية (<span dir="ltr" className="font-lato font-bold text-neutral-800 whitespace-nowrap">50–500</span> موظف) على تشخيص أسباب احتمال تسرب الفرص التعاقدية، وتقييم وضوح الكفاءة الهندسية، وبحث سبل تعزيز مسار استفسارات المشاريع دون هدر إعلاني غير مبرر.
                </>
              ) : (
                'Helping Eastern Province industrial manufacturers (50–500 staff) diagnose RFP drop-off points, elevate technical engineering authority, and capture qualified project inquiries without wasteful vanity advertising.'
              )}
            </p>

            {/* Actions: Preserving generous whitespace and clear hierarchy */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-16">
              <button
                onClick={scrollToForm}
                className={`px-8 py-4 rounded bg-neutral-950 hover:bg-neutral-800 text-white text-sm tracking-wide transition shadow-sm flex items-center justify-center gap-2.5 ${fontSubheadClass}`}
              >
                <span className="w-2 h-2 rounded-full bg-[#B5121B] shrink-0 animate-pulse" />
                <span>
                  {isAr ? (
                    <>طلب الفحص الأولي المجاني <span className="whitespace-nowrap">(<span dir="ltr" className="font-lato font-bold">15</span> دقيقة)</span></>
                  ) : (
                    'Request Free Initial Screening (15 Min)'
                  )}
                </span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>

              <button
                onClick={scrollToPillars}
                className={`px-6 py-4 rounded border border-neutral-300 hover:border-neutral-950 bg-white text-neutral-800 hover:text-black text-sm transition flex items-center justify-center gap-2 ${fontSubheadClass}`}
              >
                <span>{isAr ? 'استعراض المحاور السبعة للتدقيق' : 'Explore 7 Diagnostic Pillars'}</span>
                <ChevronDown className="w-4 h-4 text-neutral-500" />
              </button>
            </div>
          </div>

          {/* Documentary Photography & Framing Specification Box */}
          <div className="mt-8 border border-neutral-200 bg-neutral-50/70 rounded-lg p-6 sm:p-8 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-500 font-lato">
                  <span className="w-2 h-2 border border-neutral-400 inline-block" />
                  <span>{isAr ? 'مواصفات التوثيق الفني الميداني' : 'FIELD DOCUMENTATION & EVIDENCE SPECIFICATION'}</span>
                </div>
                <h3 className={`text-base text-neutral-900 ${fontSubheadClass}`}>
                  {isAr 
                    ? 'التوثيق الميداني المعتمد لمصانع ومقاولي المنطقة الشرقية'
                    : 'Evidence-Led Field Documentation for Eastern Province Industry'}
                </h3>
                <p className={`text-xs text-neutral-600 max-w-2xl leading-relaxed ${fontBodyClass}`}>
                  {isAr ? (
                    <>
                      نعتمد على إبراز الحقائق الهندسية: خطوط التصنيع الثقيلة، شهادات الجودة (<span dir="ltr" className="font-lato font-bold">ASME, API, ISO</span>)، وتجهيزات التوريد البترولية في مدن الدمام، الجبيل، رأس الخير والظهران.
                    </>
                  ) : (
                    'Focusing on verified industrial facts: heavy fabrication lines, accredited quality certifications (ASME, API, ISO), and specialized energy services.'
                  )}
                </p>
              </div>

              <div className="shrink-0 text-start lg:text-end font-mono text-[11px] text-neutral-500 space-y-1 border-t lg:border-t-0 lg:border-s border-neutral-200 pt-3 lg:pt-0 lg:ps-6 font-lato">
                <div>CORRIDOR: 26.4207° N, 50.0888° E</div>
                <div>SECTOR: HEAVY FABRICATION & OILFIELD SERVICES</div>
                <div>PROTOCOL: PUBLIC COMMERCIAL AUDIT</div>
              </div>
            </div>
          </div>

          {/* Key Engagement Parameters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 mt-12 border-t border-neutral-200 text-start">
            <div>
              <span className="text-[11px] font-mono text-neutral-500 uppercase block mb-1 font-lato">
                {isAr ? 'نطاق الخدمة' : 'Corridor'}
              </span>
              <span className={`text-sm text-neutral-900 block ${fontSubheadClass}`}>
                {isAr ? 'المنطقة الشرقية' : 'Eastern Province'}
              </span>
              <span className={`text-xs text-neutral-500 ${fontBodyClass}`}>
                {isAr ? 'الدمام • الجبيل • رأس الخير • الظهران' : 'Dammam, Jubail, Ras Al Khair'}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-mono text-neutral-500 uppercase block mb-1 font-lato">
                {isAr ? 'المدخل الأولي' : 'Initial Entry'}
              </span>
              <span className={`text-sm text-neutral-900 block ${fontSubheadClass}`}>
                {isAr ? 'جلسة فحص 15 دقيقة' : '15-Min Diagnostic'}
              </span>
              <span className="text-xs text-[#175CD3] font-mono font-medium font-lato">
                {isAr ? 'مجانية بالكامل وبدون التزام' : 'Free advisory session'}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-mono text-neutral-500 uppercase block mb-1 font-lato">
                {isAr ? 'التدقيق المتعمق' : 'In-Depth Audit'}
              </span>
              <span className="text-sm text-neutral-900 block font-mono font-bold">
                <span className="font-lato font-bold">5,000</span> <span className={isAr ? 'font-tajawal' : 'font-lato'}>{isAr ? 'ر.س' : 'SAR'}</span>
              </span>
              <span className={`text-xs text-neutral-500 ${fontBodyClass}`}>
                {isAr ? 'سعر مرحلة التحقق التجاري' : 'Validation phase pricing'}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-mono text-neutral-500 uppercase block mb-1 font-lato">
                {isAr ? 'السرية والحياد' : 'Data Integrity'}
              </span>
              <span className={`text-sm text-neutral-900 block ${fontSubheadClass}`}>
                {isAr ? 'أدلة عامة وسرية تامة' : 'Public Evidence Only'}
              </span>
              <span className={`text-xs text-neutral-500 ${fontBodyClass}`}>
                {isAr ? 'لا نطلب بيانات تسعير سرية' : 'Zero proprietary exposure'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 02 COMMERCIAL GROWTH PROBLEM (EDITORIAL OFF-WHITE) ── */}
      <section className="py-24 px-6 bg-neutral-50 border-b border-neutral-200 text-start">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mb-16">
            <div className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-3 font-lato">
              {isAr ? '02 / تشخيص الواقع التجاري' : '02 / COMMERCIAL REALITY DIAGNOSIS'}
            </div>
            <h2 className={`text-2xl sm:text-4xl tracking-tight text-neutral-950 mb-4 ${fontDisplayClass}`}>
              {isAr 
                ? 'مواطن الهدر الشائعة في التسويق والتعاقدات الصناعية'
                : 'Common Commercial Leakage Patterns in Industrial B2B'}
            </h2>
            <p className={`text-sm sm:text-base text-neutral-600 leading-relaxed ${fontBodyClass}`}>
              {isAr
                ? 'لا نفترض وجود هذه المشكلات لدى الجميع، لكن الفحص العملي يهدف إلى تقييم ما إذا كانت هناك فجوات في أحد الجوانب التالية:'
                : 'We do not assume every company suffers from these issues; our diagnostic seeks to evaluate whether gaps exist across the following areas:'}
            </p>
          </div>

          {/* Editorial Column Grid with Hairline Dividers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12">
            {[
              {
                num: '01',
                titleAr: 'القدرات الفنية قد تكون غير مرئية للمشترين',
                titleEn: 'Invisible Technical Capability',
                descAr: 'قد تمتلك المنشأة خطوط إنتاج متطورة واعتمادات مرموقة، بينما قد تقتصر الواجهة الرقمية على عرض عام لا يبرز حجم الكفاءة الحقيقية أمام لجان التأهيل.',
                descEn: 'A plant may operate advanced machinery and hold key approvals, while its digital presence may present a generic profile that fails to highlight full capabilities.'
              },
              {
                num: '02',
                titleAr: 'نقص الإثبات الهندسي ودراسات الحالة',
                titleEn: 'Weak Technical Proof & Reference Projects',
                descAr: 'قد تخلو المنصة الرقمية أحياناً من دراسات حالة مصورة للمشاريع المنجزة، مما قد يثير استفسارات إضافية لدى مقاولي المشاريع الكبرى عند مراجعة الملفات.',
                descEn: 'Documented visual case studies of delivered projects may be missing, leading procurement engineers to require additional manual verification.'
              },
              {
                num: '03',
                titleAr: 'تعقيد مسار طلبات التسعير (RFQ)',
                titleEn: 'Friction in the RFQ Journey',
                descAr: 'قد يواجه مسؤولو المشتريات أحياناً صعوبة في العثور على قناة مخصصة لرفع المواصفات الفنية أو جداول الكميات، مما قد يؤخر فتح قنوات التسعير.',
                descEn: 'Procurement teams may encounter friction finding a dedicated channel to submit engineering specs or BOQs, potentially delaying initial pricing.'
              },
              {
                num: '04',
                titleAr: 'تشتت الاستفسارات عبر قنوات فردية',
                titleEn: 'Fragmented Inbound Inquiries',
                descAr: 'قد تصل استفسارات الشراء إلى صناديق بريد عامة غير متابعة أو هواتف شخصية، مما قد يؤدي إلى تفاوت في سرعة المتابعة.',
                descEn: 'Inbound inquiries may arrive across unlinked mailboxes or personal messaging apps, which can lead to variance in follow-up consistency.'
              },
              {
                num: '05',
                titleAr: 'تفاوت سرعة الاستجابة والمتابعة التجارية',
                titleEn: 'Variance in Commercial Response Speed',
                descAr: 'في الممرات الصناعية، قد يؤثر زمن الرد التجاري على سير المباحثات، مما يستدعي تقييم مدى سرعة دورة الاستجابة ومواءمتها مع متطلبات السوق.',
                descEn: 'In active industrial corridors, commercial turnaround speed can impact bid evaluation, warranting an objective review of response workflows.'
              },
              {
                num: '06',
                titleAr: 'صعوبة قياس الأثر التجاري للمبادرات',
                titleEn: 'Measuring Commercial Attribution & Impact',
                descAr: 'قد يصعب على الإدارة تحديد القنوات والمبادرات التسويقية الأكثر إسهاماً في تحقيق طلبات تأهيل فعلية، مما يبرز أهمية الفحص التشخيصي.',
                descEn: 'Management may find it challenging to isolate which marketing channels generate qualified tender invitations, highlighting the need for attribution diagnosis.'
              }
            ].map((item, idx) => (
              <div key={idx} className="border-t border-neutral-300 pt-6 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-neutral-400 block mb-3 font-lato">
                    {item.num}
                  </span>
                  <h3 className={`text-base text-neutral-950 mb-2 leading-snug ${fontSubheadClass}`}>
                    {isAr ? item.titleAr : item.titleEn}
                  </h3>
                  <p className={`text-sm text-neutral-600 leading-relaxed ${fontBodyClass}`}>
                    {isAr ? item.descAr : item.descEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 03 SEVEN DIAGNOSTIC PILLARS (EDITORIAL WHITE) ── */}
      <section id="diagnostic-pillars-section" className="py-24 px-6 bg-white border-b border-neutral-200 text-start">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mb-16">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-blue-200 bg-blue-50/70 text-[11px] font-mono tracking-widest text-[#175CD3] uppercase mb-3 font-lato">
              <span>{isAr ? '03 / محاور الفحص والتدقيق • 7-PILLAR OS' : '03 / SEVEN DIAGNOSTIC PILLARS'}</span>
            </div>
            <h2 className={`text-2xl sm:text-4xl tracking-tight text-neutral-950 mb-4 ${fontDisplayClass}`}>
              {isAr 
                ? 'المحاور السبعة التي يفحصها التدقيق الرقمي الصناعي'
                : 'What the Industrial Digital Growth Audit Examines'}
            </h2>
            <p className={`text-sm sm:text-base text-neutral-600 leading-relaxed ${fontBodyClass}`}>
              {isAr
                ? 'تشخيص متكامل يغطي جوانب مسار التواصل والتأهيل للمنشآت الصناعية:'
                : 'A structured diagnostic reviewing key stages of industrial prospect communication and pre-qualification:'}
            </p>
          </div>

          {/* Clean 2-Column Editorial Grid with Hairline Dividers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {[
              {
                num: '01',
                titleAr: 'قابلية الاكتشاف والظهور في الممرات الصناعية',
                subtitleAr: 'Discoverability & Regional Industrial Footprint',
                descAr: 'تقييم سبل ظهور المنشأة أمام المقاولين والشركات الكبرى عند البحث عن الكفاءات المتخصصة في الدمام والجبيل ورأس الخير والظهران.'
              },
              {
                num: '02',
                titleAr: 'الإثبات الفني والمصداقية الهندسية',
                subtitleAr: 'Technical Proof & Engineering Credibility',
                descAr: 'فحص كيفية عرض شهادات الجودة (ASME, API, ISO)، والقدرات التصنيعية، ومطابقة المعايير الفنية أمام لجان التأهيل.'
              },
              {
                num: '03',
                titleAr: 'مسار طلبات التسعير والمناقصات',
                subtitleAr: 'Website & RFQ Conversion Journey',
                descAr: 'تقييم مدى سلاسة وصول مسؤولي المشاريع إلى نموذج طلب الأسعار أو رفع مواصفات المناقصات عبر المنصة الرقمية.'
              },
              {
                num: '04',
                titleAr: 'التقاط الفرص وقنوات التواصل المباشر',
                subtitleAr: 'Inbound Enquiry Capture & Touchpoints',
                descAr: 'تشخيص نقاط الاتصال المباشرة (الموقع، البريد الرسمي، واتساب الأعمال، الهاتف المباشر) لتحديد أي انقطاع في رحلة المهتم.'
              },
              {
                num: '05',
                titleAr: 'انضباط وسرعة الاستجابة التجارية',
                subtitleAr: 'Commercial Response Discipline & Speed',
                descAr: 'بحث جاهزية آليات الرد وتمرير الطلبات للفريق التجاري، وتوفر قوالب تأهيل أولية تدعم سرعة التفاعل.'
              },
              {
                num: '06',
                titleAr: 'رؤية مسار الصفقات وإدارة المتابعة',
                subtitleAr: 'CRM Architecture & Sales Pipeline Visibility',
                descAr: 'استعراض كيفية توثيق ومتابعة الفرص ومراحل التأهيل لضمان ووضوح المسار التجاري أمام الإدارة التنفيذية.'
              },
              {
                num: '07',
                titleAr: 'إسناد العائد ومصادر الصفقات',
                subtitleAr: 'Marketing Attribution & Commercial Evaluation',
                descAr: 'تقييم وتحديد القنوات والمبادرات الأكثر إسهاماً في توليد طلبات تأهيل فعلية للمنشأة مقارنة بالأنشطة محدودة الأثر.'
              }
            ].map((pillar, idx) => (
              <div key={idx} className="border-t border-neutral-300 pt-6 flex gap-5 items-start">
                <span className="font-mono text-sm font-bold text-neutral-400 tracking-wider shrink-0 pt-0.5 font-lato">
                  {pillar.num}
                </span>
                <div>
                  <h3 className={`text-base text-neutral-950 mb-1 ${fontSubheadClass}`}>
                    {pillar.titleAr}
                  </h3>
                  <span className="text-xs font-mono text-[#175CD3] block mb-2 font-medium font-lato">
                    {pillar.subtitleAr}
                  </span>
                  <p className={`text-sm text-neutral-600 leading-relaxed ${fontBodyClass}`}>
                    {pillar.descAr}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 04 HOW THE SCREENING WORKS (OFF-WHITE PROCESS STEPPER) ── */}
      <section className="py-24 px-6 bg-neutral-50 border-b border-neutral-200 text-start">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mb-16">
            <div className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-3 font-lato">
              {isAr ? '04 / آلية العمل' : '04 / THE SCREENING PROCESS'}
            </div>
            <h2 className={`text-2xl sm:text-4xl tracking-tight text-neutral-950 mb-4 ${fontDisplayClass}`}>
              {isAr 
                ? 'خطوات الفحص الأولي المجاني (15 دقيقة)'
                : 'The Free 15-Minute Screening Process'}
            </h2>
            <p className={`text-sm sm:text-base text-neutral-600 leading-relaxed ${fontBodyClass}`}>
              {isAr
                ? 'مدخل استشاري ميسر بدون التزام مالي، مصمم لتحديد ما إذا كان التدقيق المتعمق مفيداً ومبرراً لمنشأتكم:'
                : 'A low-friction advisory entry point without financial commitment, designed to verify whether an in-depth audit is commercially justified:'}
            </p>
          </div>

          {/* Minimalist Process Flow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {[
              {
                step: '01',
                titleAr: 'تقديم طلب الفحص الأولي',
                titleEn: 'Submit Screening Request',
                descAr: 'تعبئة نموذج الفحص المكون من 7 حقول رئيسية لتحديد هوية المنشأة والعائق التجاري الأبرز.',
                descEn: 'Complete the short 7-field form outlining your industrial sector, location, and primary growth constraint.'
              },
              {
                step: '02',
                titleAr: 'مراجعة الملاءمة والتأهيل',
                titleEn: 'Qualification Review',
                descAr: 'يقوم فريقنا بمراجعة مبدئية للأدلة العامة المتاحة للمنشأة للتأكد من ملاءمتها لنطاق الفحص الصناعي.',
                descEn: 'Our team evaluates public commercial evidence to ensure company alignment with our industrial diagnostic scope.'
              },
              {
                step: '03',
                titleAr: 'جلسة تشخيص ومواءمة (15 دقيقة)',
                titleEn: 'Diagnostic Consultation',
                descAr: 'جلسة استشارية موجزة لمناقشة الفجوات الملحوظة، وتحديد ما إذا كان تدقيق النمو الرقمي المتعمق مبرراً.',
                descEn: 'A structured 15-minute consultation to walk through observed gaps and determine whether an in-depth audit is justified.'
              },
              {
                step: '04',
                titleAr: 'اتخاذ القرار / التدقيق المتعمق',
                titleEn: 'Decision / In-Depth Audit',
                descAr: 'في حال ثبوت الجدوى، يتم الانتقال لتدقيق النمو الرقمي الصناعي (5,000 ر.س) لوضع خريطة الحلول التنفيذية.',
                descEn: 'If commercially justified, proceed to the comprehensive Industrial Digital Growth Audit (SAR 5,000).'
              }
            ].map((item, idx) => (
              <div key={idx} className="border-t border-neutral-300 pt-6">
                <span className="font-mono text-xs font-bold text-neutral-400 block mb-4 font-lato">
                  {item.step}
                </span>
                <h3 className={`text-base text-neutral-950 mb-2 ${fontSubheadClass}`}>
                  {isAr ? item.titleAr : item.titleEn}
                </h3>
                <p className={`text-xs sm:text-sm text-neutral-600 leading-relaxed ${fontBodyClass}`}>
                  {isAr ? item.descAr : item.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 05 INDUSTRIAL DIGITAL GROWTH AUDIT (EXECUTIVE CONSULTING ENGAGEMENT) ── */}
      <section className="py-24 px-6 bg-white border-b border-neutral-200 text-start">
        <div className="max-w-5xl mx-auto">
          <div className="border border-neutral-300 rounded-lg p-8 sm:p-12 bg-white shadow-2xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-neutral-200">
              <div>
                <div className="inline-block text-[11px] font-mono uppercase tracking-widest text-neutral-500 mb-2 font-lato">
                  {isAr ? '05 / الخدمة الاستشارية المتعمقة' : '05 / IN-DEPTH CONSULTING ENGAGEMENT'}
                </div>
                <h2 className={`text-2xl sm:text-3xl tracking-tight text-neutral-950 ${fontDisplayClass}`}>
                  {isAr ? (
                    <>تدقيق النمو الرقمي الصناعي (<span className="font-lato font-bold">Industrial Digital Growth Audit</span>)</>
                  ) : (
                    'Industrial Digital Growth Audit'
                  )}
                </h2>
                <p className={`text-sm text-neutral-600 mt-2 max-w-xl leading-relaxed ${fontBodyClass}`}>
                  {isAr 
                    ? 'تشخيص متكامل لمواطن الهدر التجاري وخريطة حلول تنفيذية مخصصة للقيادة التنفيذية.'
                    : 'A rigorous diagnostic report and actionable intervention roadmap designed for executive decision-makers.'}
                </p>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 p-5 rounded min-w-[220px] text-start md:text-end">
                <span className="text-[11px] font-mono uppercase text-neutral-500 block mb-1 font-lato">
                  {isAr ? 'سعر مرحلة التحقق التجاري' : 'Validation Phase Pricing'}
                </span>
                <div className="text-3xl font-bold text-neutral-950 font-lato">
                  5,000 <span className={`text-sm font-semibold text-neutral-600 ${isAr ? 'font-tajawal' : 'font-lato'}`}>{isAr ? 'ر.س' : 'SAR'}</span>
                </div>
                <span className={`text-[10px] text-neutral-500 block mt-1 ${fontBodyClass}`}>
                  {isAr ? 'يُعرض فقط في حال ثبوت جدوى وملاءمة التدقيق' : 'Offered only if screening confirms commercial justification'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 pt-8 text-sm text-neutral-700">
              {[
                { ar: 'تقرير تشخيصي مكتوب ومفصل يغطي المحاور السبعة', en: 'Comprehensive written diagnostic covering all 7 pillars' },
                { ar: 'خريطة فجوات مسار طلبات التسعير (RFQ Gap Map)', en: 'Actionable RFQ journey gap map and friction audit' },
                { ar: 'توصيات واضحة لإبراز الكفاءات والاعتمادات الهندسية', en: 'Specific recommendations to showcase engineering credentials' },
                { ar: 'جلسة عرض ونقاش تنفيذي مع الإدارة العليا', en: 'Executive briefing and presentation session with leadership' },
                { ar: 'إمكانية احتساب قيمة التدقيق كدفعة أولى عند اعتماد حزمة التدخل', en: 'Option to credit audit fee against approved implementation Sprint' },
                { ar: 'التزام كامل بالحياد والمصداقية دون بيع خدمات غير مبررة', en: 'Strict diagnostic neutrality without pushing unnecessary services' }
              ].map((point, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="w-4 h-4 rounded-full border border-neutral-300 flex items-center justify-center shrink-0 mt-0.5 text-neutral-800 text-xs font-lato">
                    ✓
                  </span>
                  <span className={fontBodyClass}>{isAr ? point.ar : point.en}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 06 WHY STUDIO ALWALEED (EDITORIAL OFF-WHITE) ── */}
      <section className="py-24 px-6 bg-neutral-50 border-b border-neutral-200 text-start">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl mb-16">
            <div className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-3 font-lato">
              {isAr ? '06 / لماذا استوديو الوليد؟' : '06 / WHY STUDIO ALWALEED?'}
            </div>
            <h2 className={`text-2xl sm:text-4xl tracking-tight text-neutral-950 mb-4 ${fontDisplayClass}`}>
              {isAr 
                ? 'الجمع بين التوثيق الفني وهندسة الأنظمة التجارية'
                : 'Combining Technical Media with Commercial Systems'}
            </h2>
            <p className={`text-sm sm:text-base text-neutral-600 leading-relaxed ${fontBodyClass}`}>
              {isAr
                ? 'نعتمد على حقائق تشغيلية مثبتة وتواجد ميداني في قلب المنطقة الشرقية:'
                : 'Relying on verified operational facts and regional presence in the Eastern Province:'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border-t border-neutral-300 pt-6">
              <span className="font-mono text-xs font-bold text-neutral-400 block mb-3 font-lato">01</span>
              <h3 className={`text-base text-neutral-950 mb-2 ${fontSubheadClass}`}>
                {isAr ? 'تواجد محلي في المنطقة الشرقية' : 'Eastern Province Regional Base'}
              </h3>
              <p className={`text-sm text-neutral-600 leading-relaxed ${fontBodyClass}`}>
                {isAr
                  ? 'استوديو وفريق ميداني متواجد بالقرب من ممرات الدمام والجبيل ورأس الخير والظهران، يفهم بيئة الأعمال ومتطلبات قطاع الصناعة المحلي.'
                  : 'Local studio and field capability in the Eastern Province, close to Dammam, Jubail, and Ras Al Khair industrial hubs.'}
              </p>
            </div>

            <div className="border-t border-neutral-300 pt-6">
              <span className="font-mono text-xs font-bold text-neutral-400 block mb-3 font-lato">02</span>
              <h3 className={`text-base text-neutral-950 mb-2 ${fontSubheadClass}`}>
                {isAr ? 'تكامل التوثيق مع مسار التأهيل' : 'Technical Media + Prequalification'}
              </h3>
              <p className={`text-sm text-neutral-600 leading-relaxed ${fontBodyClass}`}>
                {isAr
                  ? 'لا ننظر للإنتاج البصري كعمل معزول، بل نساعد على توظيف التوثيق الفني لدعم مسار دراسة وتأهيل طلبات التسعير.'
                  : 'We do not view media in isolation; precise engineering documentation is structured to support pre-qualification.'}
              </p>
            </div>

            <div className="border-t border-neutral-300 pt-6">
              <span className="font-mono text-xs font-bold text-neutral-400 block mb-3 font-lato">03</span>
              <h3 className={`text-base text-neutral-950 mb-2 ${fontSubheadClass}`}>
                {isAr ? 'مصداقية تشخيصية قائمة على الأدلة' : 'Evidence-Based Diagnostic Credibility'}
              </h3>
              <p className={`text-sm text-neutral-600 leading-relaxed ${fontBodyClass}`}>
                {isAr
                  ? 'لا نطلق وعوداً غير مثبتة ولا نسوق خدمات عشوائية. كل استشارة يقودها تشخيص موضوعي مبني على معايير الأعمال العامة.'
                  : 'Zero unsubstantiated promises or generic agency retainers. Every consultation is governed by objective business evidence.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 07 SCREENING FORM (PREMIUM MINIMAL WHITE) ── */}
      <section id="screening-form-section" className="py-24 px-6 bg-white border-b border-neutral-200">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-blue-200 bg-blue-50/70 text-[11px] font-mono tracking-widest text-[#175CD3] uppercase mb-3 font-lato">
              <span>{isAr ? '07 / نموذج الفحص الأولي • STAGE 1' : '07 / INITIAL SCREENING FORM'}</span>
            </div>
            <h2 className={`text-2xl sm:text-3xl tracking-tight text-neutral-950 mb-2 ${fontDisplayClass}`}>
              {isAr ? 'طلب الفحص التشخيصي الأولي' : 'Request Initial Growth Screening'}
            </h2>
            <p className={`text-xs sm:text-sm text-neutral-600 ${fontBodyClass}`}>
              {isAr 
                ? 'يستغرق إكمال النموذج أقل من دقيقتين. لا نطلب أي معلومات سرية في هذه المرحلة.'
                : 'Takes less than 2 minutes. We do not request confidential tender data at this stage.'}
            </p>
          </div>

          {submissionResult ? (
            <div className="border border-neutral-300 rounded-lg p-8 sm:p-10 text-center bg-white shadow-xs max-w-2xl mx-auto">
              <div className="w-14 h-14 rounded-full border border-neutral-900 text-neutral-900 flex items-center justify-center mx-auto mb-5 bg-neutral-50">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className={`text-xl sm:text-2xl font-bold text-neutral-950 mb-3 ${fontSubheadClass}`}>
                {isAr ? 'تم تسجيل بيانات الفحص التشخيصي مبدئياً' : 'Diagnostic Intake Details Recorded'}
              </h3>
              <p className={`text-sm text-neutral-600 mb-6 leading-relaxed ${fontBodyClass}`}>
                {isAr 
                  ? 'بوابة المزامنة الفورية مع جدول المواعيد قيد التدشين المجدول. لقد تم حفظ بيانات الفحص التشخيصي لشركتكم محلياً بأمان ضمن هذه الجلسة. للتنسيق المباشر وحجز الجلسة التشخيصية الأولى (15 دقيقة) فوراً مع استشاري النمو الصناعي، يُرجى التواصل مباشرة عبر القنوات المعتمدة:'
                  : 'The direct calendar scheduling portal is undergoing scheduled production activation. Your company diagnostic details have been securely recorded for this session. To directly coordinate and book your initial 15-minute diagnostic screening session with our Industrial Growth Consultant, please contact our desk directly:'}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-start mb-8">
                <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                  <div className={`text-xs text-neutral-500 font-bold mb-1 uppercase tracking-wider ${fontSubheadClass}`}>
                    {isAr ? 'البريد الإلكتروني المعتمد' : 'Official Sales Desk'}
                  </div>
                  <a 
                    href="mailto:sales@alwaleed.pro" 
                    className="text-sm font-lato font-bold text-[#175CD3] hover:underline break-all"
                  >
                    sales@alwaleed.pro
                  </a>
                </div>
                <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                  <div className={`text-xs text-neutral-500 font-bold mb-1 uppercase tracking-wider ${fontSubheadClass}`}>
                    {isAr ? 'الرقم الموحد / الاتصال المباشر' : 'Direct Line'}
                  </div>
                  <a 
                    href="tel:+966500096949" 
                    dir="ltr"
                    className="text-sm font-lato font-bold text-neutral-950 hover:underline inline-block"
                  >
                    +966 50 009 6949
                  </a>
                </div>
              </div>

              <div className="p-4 rounded bg-neutral-50 border border-neutral-200 text-xs text-start font-mono text-neutral-600 mb-8 font-lato">
                <div className="text-neutral-900 font-bold mb-1 pb-1 border-b border-neutral-200 flex justify-between items-center">
                  <span>{isAr ? 'ملخص الفحص المحفوظ محلياً' : 'Session Intake Audit Record'}</span>
                  <span className="text-[10px] text-neutral-500">{submissionResult.timestamp}</span>
                </div>
                <div>Company: {submissionResult.payload?.account?.company_name}</div>
                <div>Contact: {submissionResult.payload?.contact?.full_name} ({submissionResult.payload?.contact?.job_title})</div>
                <div>Corporate Email: {submissionResult.payload?.contact?.work_email}</div>
                <div>Phone (Normalized): {submissionResult.payload?.contact?.phone_normalized}</div>
                <div>Location: {submissionResult.payload?.account?.city} ({submissionResult.payload?.account?.corridor})</div>
                <div>Status: {submissionResult.payload?.governance?.crm_sync_status}</div>
              </div>

              <button
                onClick={() => {
                  setSubmissionResult(null);
                  setFormData({
                    fullName: '',
                    companyName: '',
                    jobTitle: '',
                    workEmail: '',
                    phone: '',
                    city: 'Dammam',
                    primaryGrowthProblem: 'discoverability',
                    websiteUrl: '',
                    linkedinUrl: '',
                    companyFaxExt: ''
                  });
                }}
                className={`px-6 py-2.5 rounded bg-neutral-950 hover:bg-neutral-800 text-xs text-white transition font-medium ${fontSubheadClass}`}
              >
                {isAr ? 'تعديل البيانات أو تقديم استفسار جديد' : 'Edit Details or Submit Another Inquiry'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="border border-neutral-200 rounded-lg p-8 sm:p-10 bg-white shadow-sm space-y-6 text-start">
              {/* Honeypot field - invisible to human users */}
              <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
                <label>Leave this empty</label>
                <input 
                  type="text" 
                  name="companyFaxExt" 
                  tabIndex="-1" 
                  autoComplete="off"
                  value={formData.companyFaxExt} 
                  onChange={handleInputChange} 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-xs uppercase tracking-wider text-neutral-800 mb-2 ${fontSubheadClass}`}>
                    {isAr ? 'الاسم الكامل *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder={isAr ? 'مثال: م. أحمد الخالدي' : 'e.g., Eng. Ahmad Al-Khaldi'}
                    className={`w-full px-4 py-3 rounded border ${
                      formErrors.fullName ? 'border-red-500' : 'border-neutral-300 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950'
                    } text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition bg-white ${fontBodyClass}`}
                  />
                  {formErrors.fullName && (
                    <span className={`text-xs text-red-600 mt-1 block ${fontBodyClass}`}>{formErrors.fullName}</span>
                  )}
                </div>

                <div>
                  <label className={`block text-xs uppercase tracking-wider text-neutral-800 mb-2 ${fontSubheadClass}`}>
                    {isAr ? 'اسم الشركة أو المصنع *' : 'Company Name *'}
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder={isAr ? 'مثال: شركة التصنيع والخدمات الهندسية' : 'e.g., Eastern Industrial Engineering'}
                    className={`w-full px-4 py-3 rounded border ${
                      formErrors.companyName ? 'border-red-500' : 'border-neutral-300 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950'
                    } text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition bg-white ${fontBodyClass}`}
                  />
                  {formErrors.companyName && (
                    <span className={`text-xs text-red-600 mt-1 block ${fontBodyClass}`}>{formErrors.companyName}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-xs uppercase tracking-wider text-neutral-800 mb-2 ${fontSubheadClass}`}>
                    {isAr ? 'المسمى الوظيفي *' : 'Role / Position *'}
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    placeholder={isAr ? 'مثال: الرئيس التنفيذي / مدير تطوير الأعمال' : 'e.g., CEO, Business Development'}
                    className={`w-full px-4 py-3 rounded border ${
                      formErrors.jobTitle ? 'border-red-500' : 'border-neutral-300 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950'
                    } text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition bg-white ${fontBodyClass}`}
                  />
                  {formErrors.jobTitle && (
                    <span className={`text-xs text-red-600 mt-1 block ${fontBodyClass}`}>{formErrors.jobTitle}</span>
                  )}
                </div>

                <div>
                  <label className={`block text-xs uppercase tracking-wider text-neutral-800 mb-2 ${fontSubheadClass}`}>
                    {isAr ? 'البريد الإلكتروني للعمل *' : 'Corporate Work Email *'}
                  </label>
                  <input
                    type="email"
                    name="workEmail"
                    value={formData.workEmail}
                    onChange={handleInputChange}
                    placeholder="name@company.com"
                    className={`w-full px-4 py-3 rounded border ${
                      formErrors.workEmail ? 'border-red-500' : 'border-neutral-300 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950'
                    } text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition bg-white font-lato`}
                  />
                  {formErrors.workEmail && (
                    <span className={`text-xs text-red-600 mt-1 block ${fontBodyClass}`}>{formErrors.workEmail}</span>
                  )}
                  {emailWarning && (
                    <span className={`text-xs text-amber-700 mt-1 block flex items-center gap-1 ${fontBodyClass}`}>
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{emailWarning}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-xs uppercase tracking-wider text-neutral-800 mb-2 ${fontSubheadClass}`}>
                    {isAr ? 'رقم الجوال / واتساب المباشر (سعودي فقط) *' : 'Mobile / WhatsApp (Saudi Only) *'}
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="05XXXXXXXX"
                    className={`w-full px-4 py-3 rounded border ${
                      formErrors.phone ? 'border-red-500' : 'border-neutral-300 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950'
                    } text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none transition bg-white font-lato text-start`}
                  />
                  {phoneFormatted && (
                    <span className="text-xs text-emerald-700 font-mono mt-1 block font-lato">
                      ✓ {isAr ? 'الصيغة المعتمدة:' : 'Normalized:'} {phoneFormatted}
                    </span>
                  )}
                  {formErrors.phone && (
                    <span className={`text-xs text-red-600 mt-1 block ${fontBodyClass}`}>{formErrors.phone}</span>
                  )}
                </div>

                <div>
                  <label className={`block text-xs uppercase tracking-wider text-neutral-800 mb-2 ${fontSubheadClass}`}>
                    {isAr ? 'المدينة / المقر التشغيلي *' : 'City / Operating Corridor *'}
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded border border-neutral-300 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 text-sm text-neutral-900 focus:outline-none transition bg-white ${fontBodyClass}`}
                  >
                    <option value="Dammam">{isAr ? 'الدمام (Dammam)' : 'Dammam'}</option>
                    <option value="Jubail">{isAr ? 'الجبيل (Jubail)' : 'Jubail'}</option>
                    <option value="Ras Al Khair">{isAr ? 'رأس الخير (Ras Al Khair)' : 'Ras Al Khair'}</option>
                    <option value="Dhahran">{isAr ? 'الظهران (Dhahran)' : 'Dhahran'}</option>
                    <option value="Khobar">{isAr ? 'الخبر (Khobar)' : 'Khobar'}</option>
                    <option value="Other">{isAr ? 'مدينة أخرى بالمملكة (Other KSA)' : 'Other KSA'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-xs uppercase tracking-wider text-neutral-800 mb-2 ${fontSubheadClass}`}>
                  {isAr ? 'العائق التجاري الأبرز حالياً *' : 'Primary Growth Problem *'}
                </label>
                <select
                  name="primaryGrowthProblem"
                  value={formData.primaryGrowthProblem}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded border border-neutral-300 focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 text-sm text-neutral-900 focus:outline-none transition bg-white ${fontBodyClass}`}
                >
                  <option value="discoverability">
                    {isAr ? 'ضعف الظهور والوصول لمقاولي المشاريع الكبرى (Discoverability)' : 'Discoverability in major project corridors'}
                  </option>
                  <option value="technical_proof">
                    {isAr ? 'نقص إثبات الكفاءة الفنية ودراسات الحالة المصورة (Technical Proof)' : 'Weak technical proof and reference case studies'}
                  </option>
                  <option value="rfq_conversion">
                    {isAr ? 'فجوات في تحويل زوار الموقع لطلبات تسعير فعلية (Website / RFQ)' : 'Gaps in website-to-RFQ enquiry flow'}
                  </option>
                  <option value="lead_response">
                    {isAr ? 'تفاوت في سرعة الاستجابة للاستفسارات (Response Speed)' : 'Variance in lead response speed and follow-up'}
                  </option>
                  <option value="crm_visibility">
                    {isAr ? 'الحاجة لتنظيم مسار ومتابعة الصفقات (CRM Visibility)' : 'Need for structured CRM / pipeline visibility'}
                  </option>
                  <option value="marketing_attribution">
                    {isAr ? 'صعوبة قياس العائد المالي من القنوات المختلفة (Attribution)' : 'Difficulty measuring channel ROI & attribution'}
                  </option>
                  <option value="needs_diagnosis">
                    {isAr ? 'غير متأكد / نحتاج إلى تشخيص شامل (Needs Full Diagnosis)' : 'Not sure / Need full commercial diagnosis'}
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-neutral-200">
                <div>
                  <label className={`block text-xs font-medium text-neutral-600 mb-1 ${fontBodyClass}`}>
                    {isAr ? 'موقع الشركة الإلكتروني (اختياري)' : 'Company Website (Optional)'}
                  </label>
                  <input
                    type="url"
                    name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleInputChange}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded border border-neutral-300 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-950 transition bg-white font-lato text-start"
                  />
                </div>

                <div>
                  <label className={`block text-xs font-medium text-neutral-600 mb-1 ${fontBodyClass}`}>
                    {isAr ? 'رابط صفحة الشركة على LinkedIn (اختياري)' : 'LinkedIn Company URL (Optional)'}
                  </label>
                  <input
                    type="url"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/company/..."
                    className="w-full px-3.5 py-2.5 rounded border border-neutral-300 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-950 transition bg-white font-lato text-start"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 px-6 rounded bg-neutral-950 hover:bg-neutral-800 text-white text-sm tracking-wide transition shadow-sm flex items-center justify-center gap-2.5 disabled:opacity-50 ${fontSubheadClass}`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>{isAr ? 'جاري التحقق ومعالجة الطلب...' : 'Processing...'}</span>
                    </span>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-[#B5121B] shrink-0 animate-pulse" />
                      <Send className="w-4 h-4" />
                      <span>{isAr ? 'إرسال طلب الفحص الأولي' : 'Submit Screening Request'}</span>
                    </>
                  )}
                </button>
              </div>

              <div className={`text-xs text-neutral-500 text-center flex items-center justify-center gap-1.5 pt-1 ${fontBodyClass}`}>
                <Lock className="w-3.5 h-3.5 text-neutral-400" />
                <span>
                  {isAr 
                    ? 'بياناتك مشمولة بالسرية والخصوصية التامة لأغراض التشخيص المهني فقط.'
                    : 'Your information is confidential and used solely for professional qualification.'}
                </span>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ── 08 PRIVACY / EVIDENCE POLICY (EDITORIAL WHITE/LIGHT) ── */}
      <section className="py-16 px-6 bg-white border-b border-neutral-200 text-center">
        <div className="p-8 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 leading-relaxed max-w-2xl mx-auto">
          <h4 className={`font-bold text-neutral-900 mb-2 flex items-center justify-center gap-1.5 ${fontSubheadClass}`}>
            <ShieldCheck className="w-4 h-4 text-neutral-700" />
            <span>{isAr ? 'سياسة الخصوصية والأدلة العامة' : 'Privacy & Public Evidence Policy'}</span>
          </h4>
          <p className={fontBodyClass}>
            {isAr
              ? 'تعتمد دراسة الفحص الأولي على تحليل البصمة الرقمية والأدلة التجارية المتاحة للجمهور (الموقع، الاعتمادات المعلنة، الحسابات الرسمية). لا نطلب أي وثائق سرية أو تفاصيل تسعير خاصة بمناقصاتكم في هذه المرحلة. يتم التعامل مع جميع البيانات وفق أعلى معايير الخصوصية المهنية.'
              : 'Our initial screening relies exclusively on public digital footprints and publicly available business evidence. We never request confidential tender specs, proprietary pricing, or trade secrets during qualification.'}
          </p>
        </div>
      </section>

      {/* ── 09 STRATEGIC DARK FEATURE CTA & FOOTER (~15-20% TOTAL PAGE) ── */}
      <section className="py-24 px-6 bg-neutral-950 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 block mb-3 font-lato">
            {isAr ? '09 / التقييم والمواءمة' : '09 / STRATEGIC ALIGNMENT'}
          </span>
          <h2 className={`text-2xl sm:text-4xl text-white mb-6 max-w-2xl mx-auto leading-tight ${fontDisplayClass}`}>
            {isAr 
              ? 'هل ترغب في تحديد ما إذا كانت هناك فرص غير مستغلة في مسار تعاقدات منشأتكم؟'
              : 'Interested in evaluating potential untapped opportunities in your enquiry pipeline?'}
          </h2>
          <p className={`text-sm sm:text-base text-neutral-400 max-w-xl mx-auto mb-10 leading-relaxed ${fontBodyClass}`}>
            {isAr ? (
              <>
                ابدأ بالفحص الأولي المجاني لمدة <span dir="ltr" className="font-lato font-bold text-white">15</span> دقيقة لبحث وتقييم الفجوات التشخيصية ذات الأولوية لمنشأتكم.
              </>
            ) : (
              'Begin with a free 15-minute diagnostic screening to identify and discuss prioritized areas for commercial development.'
            )}
          </p>
          <button
            onClick={scrollToForm}
            className={`px-8 py-4 rounded bg-white hover:bg-neutral-100 text-neutral-950 text-sm tracking-wide transition shadow-lg inline-flex items-center gap-2.5 ${fontSubheadClass}`}
          >
            <span className="w-2 h-2 rounded-full bg-[#B5121B] shrink-0 animate-pulse" />
            <span>{isAr ? 'ابدأ طلب الفحص الأولي الآن' : 'Start Initial Screening Request'}</span>
            {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </section>

      {/* ── STRATEGIC MINIMAL DARK FOOTER ── */}
      <footer className="bg-neutral-950 border-t border-neutral-900 py-12 px-6 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img 
              src={logoImg} 
              alt="Studio AlWaleed" 
              className="h-7 w-auto object-contain filter invert opacity-80"
            />
            <span className={`font-bold tracking-tight text-neutral-300 uppercase ${fontSubheadClass}`}>
              {isAr ? 'استوديو الوليد — الشريك الصناعي' : 'Studio AlWaleed — Industrial Partner'}
            </span>
          </div>
          <p className={`font-mono text-neutral-400 ${fontBodyClass}`}>
            {isAr ? 'الدمام • الجبيل • رأس الخير • الظهران' : 'Dammam • Jubail • Ras Al Khair • Dhahran'}
          </p>
          <p className="font-lato">
            © {new Date().getFullYear()} {isAr ? 'استوديو الوليد. جميع الحقوق محفوظة.' : 'Studio AlWaleed. All Rights Reserved.'}
          </p>
        </div>
      </footer>
    </div>
  );
}
