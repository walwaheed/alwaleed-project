# Studio AlWaleed Customer App — Pre-Launch Product Experience Audit

**النطاق:** Discovery / Read-only

**تاريخ التدقيق:** 10 September 2026

**الحالة:** لا تنفيذ، لا نشر، لا تغيير في الإنتاج، لا تغيير في Supabase أو الدفع.

## 1. Executive Product Assessment

التطبيق الحالي هو **React Native عبر Expo SDK 54** مع دعم Web بواسطة `react-native-web` وExpo Metro، وليس تطبيق Next.js. يحتوي على واجهة عربية RTL جيدة نسبيًا، ومساعد صور، وCustomer Operations Hub تجريبي، وكتالوج منتجات وQuote تجريبي، ومسار رفع/جودة/مراجعة/إنشاء طلب Mock، إضافة إلى نماذج الدعوات وCustomer Intelligence وFulfillment contracts.

المنتج في وضعه الحالي مناسب كـ **prototype متقدم واختبار تجربة Photo Print**. وهو غير جاهز بعد كمنتج Customer Hub عام؛ لأن معظم دورة حياة العميل بعد الاختيار ما زالت Mock أو غير موجودة. كما أن الـAPI الإنتاجي المستهدف `https://api.alwaleed.pro` لم يتم ربطه بعد من داخل التطبيق.

القرار المقترح هو عدم توسيع النطاق الآن إلى Loyalty أو PWA أو App Store. يجب أولًا إكمال **مرجع معاملة Photo Print حقيقي** من المنتج إلى Quote إلى Upload إلى Quality إلى Order إلى `PENDING_PAYMENT / UNPAID`، ثم بناء طبقات الحساب والعناوين والطلبات والدعم والثقة حوله.

## 2. Maturity Scores

| المجال | النتيجة | التفسير |
|---|---:|---|
| نضج التطبيق العام | **44/100** | Prototype واسع بواجهات متعددة، لكنه يفتقد مصادر الحقيقة التشغيلية ومعظم الحساب والطلب والدعم. |
| نضج UX الحالي | **62/100** | RTL عربية، intent-first home، حالات تحميل وفشل، ومسار Photo Print واضح؛ توجد فجوات في الاستمرارية، الترجمة، والوصول. |
| الجاهزية للسوق السعودي | **24/100** | توجد لغة عربية وVAT تجريبي واختيار وجهة، لكن لا يوجد National Address أو Short Address أو دفع سعودي متحقق أو سياسة توصيل فعلية. |
| جاهزية الثقة والقانونيات | **12/100** | لا توجد داخل التطبيق صفحات legal/trust مكتملة أو موافقة معالجة الصور أو retention/account deletion. |
| نضج تجربة الصور الذكية | **55/100** | الاختيار والمعاينة وفحص الجودة ومسارات low-resolution موجودة في Mock؛ الكاميرا، الفحص الخادمي، enhancement الحقيقي، crop المتقدم، والحفظ غير مكتملة. |

هذه النتائج تقيس ما تم التحقق منه في المصدر الحالي، ولا تفترض أن ميزة نوقشت سابقًا أصبحت موجودة.

## 3. Current Application Evidence

### Routes الموجودة

| المسار | ما يقدمه حاليًا | التصنيف |
|---|---|---|
| `/` | Smart Photo Assistant، intent cards، رفع محلي، تحليل إرشادي، توصيات، فحص جواز Mock | **EXISTS / NEEDS POLISH** |
| `/hub` | Customer Operations Hub عربي، خدمات وحالات تجريبية، Next Best Action Mock | **EXISTS / MOCK** |
| `/catalog` | اختيار منتج ومقاس وكمية ووجهة، Quote تجريبي، VAT تجريبي، حالات فشل | **EXISTS / MOCK** |
| `/checkout` | اختيار صورة، progress محلي، preview، replace/remove، حالات الجودة، review، إنشاء طلب Mock، ready-for-payment | **EXISTS / MOCK** |
| `/cart` | سلة محلية، كمية، كوبونات Mock ومسار دفع تجريبي سابق | **EXISTS / MOCK** |
| `/transaction` | بوابة معاملة Photo Print وحالات الدفع Mock | **EXISTS / MOCK** |
| `/dashboard` | لوحة مالك ببيانات تشغيلية Mock وفلاتر وفرز | **EXISTS / NOT CUSTOMER LAUNCH SCOPE** |
| `/invitations` | محرك دعوات وقوالب ومسار معاينة Mock | **EXISTS / PHASE 2** |

### Foundations الموجودة

- Expo Router وReact Native و`react-native-web`.
- Expo ImagePicker لاختيار الصور من الجهاز.
- Safe-area وgesture handling وNativeWind.
- Auth runtime وOAuth callback، مع جدول `users` الأساسي.
- عقود Phase 3 وPhase 4A وPhase 4B، بما فيها fail-closed API binding.
- اختبارات Vitest للعقود والسلة والذكاء والدعوات والمعاملة وFulfillment.
- لا توجد جداول domain حقيقية للعناوين أو الطلبات أو المشاريع أو الإشعارات في مخطط Drizzle الحالي؛ المخطط يعرّف `users` فقط مع TODO لإضافة الجداول.
- لا يوجد في المشروع الحالي PWA manifest أو service worker أو `eas.json` أو Sentry/Crashlytics مخصص.

## 4. Master Gap Matrix

| FEATURE | CURRENT STATUS | CURRENT EVIDENCE | CUSTOMER VALUE | FRONTEND WORK | BACKEND DEPENDENCY | LEGAL DEPENDENCY | PRIORITY | LAUNCH BLOCKER | RECOMMENDED OWNER DECISION |
|---|---|---|---|---|---|---|---|---|---|
| Home intent-first | EXISTS | `/` يعرض خدمات Photo Assistant وبطاقات intent | يقلل الحيرة | تحسين ترتيب الخدمات والـrecent context | لا للنسخة الأولى | لا | P1 | لا | إبقاء Home كمدخل نية العميل، مع تقليل البطاقات الظاهرة |
| Onboarding | MISSING | لا مسار onboarding مستقل | يشرح القيمة ويقلل التخلي | شاشة قصيرة أو progressive hints | اختياري | privacy consent عند الحاجة | P1 | لا للـprivate beta | لا تبنِ tutorial طويلًا؛ استخدم إرشادًا داخل المسار |
| Login / signup / logout | PARTIAL | OAuth callback و`auth.me/logout` موجودان | حفظ الطلبات والصور والعناوين | حالات signed-out/signed-in وsession recovery | هوية المستخدم ومصدرها | privacy/account terms | P0 للطلبات المرتبطة بالحساب، P1 للـguest | نعم للإطلاق العام إذا لم يوجد guest/order recovery | اعتمد هوية backend الحالية ولا تنشئ customer DB ثانية |
| Forgot password | NOT APPLICABLE / BLOCKED BY AUTH CHOICE | OAuth flow موجود ولا يوجد password flow | استعادة الوصول | واجهة redirect/error | يعتمد على مزود الهوية | account recovery policy | P1 | لا إذا OAuth فقط | قرر OAuth-only أو أضف password recovery رسميًا |
| Customer profile | MISSING | لا route أو screen | بيانات صحيحة وإيصالات | Profile + preferences | customer profile API | deletion/access rights | P1 | لا للـprivate beta إذا guest | ابنِ الحد الأدنى بعد transaction handshake |
| Saved addresses | MISSING | لا جداول أو UI | Checkout أسرع | address list/editor | address service أو Supabase الصحيح | data retention | P0 للإطلاق العام | نعم إذا delivery حقيقي | Antigravity يثبت schema ومصدر الحقيقة |
| Saudi National Address / Short Address | MISSING | لا دعم فعلي | توصيل محلي صحيح | fields + validation + fallback | validation/integration | shipping policy | P0 | نعم للسعودية | لا تطلب حقولًا لا يحتاجها backend؛ اعتمد contract واحد |
| Arabic / English | PARTIAL | معظم UI عربي فقط | سوق أوسع ووصول أوضح | i18n catalog, errors, dates, legal | localized product/order fields | bilingual legal review | P1 | لا للـprivate beta العربي | أضف i18n قبل public launch |
| RTL quality | EXISTS / NEEDS POLISH | `direction: rtl` وأنماط RTL متعددة | usability عربية | back navigation, mixed numerals, long text, web/keyboard QA | لا | لا | P1 | لا | اختبار iPhone/Android/Desktop ببيانات طويلة |
| Orders / history / details | MISSING | `/hub` يعرض tracking تجريبيًا فقط؛ لا order API في UI | الثقة وإعادة الوصول | Orders list/detail/status | authoritative orders API | invoice/retention | P0 | نعم | هذه أول شاشة بعد نجاح order creation |
| Tracking | PARTIAL / MOCK | contract status موجود؛ UI تجريبي | يطمئن العميل | timeline + retry + empty states | `/api/print-orders/status/:id` | shipping disclosure | P0 | نعم للطلب المدفوع | لا تجعل UI مصدر status مستقلًا |
| Saved projects / resume | PARTIAL | local photo state داخل screens فقط | منع فقدان العمل | persistence + project list | upload/project storage API | image retention/consent | P1 | لا للـprivate beta | ابدأ بحفظ draft مرتبط بـidempotency |
| Reorder | MISSING | لا flow | قيمة retention عالية | reorder from order detail | order/product availability API | لا | P2 | لا | أضفه بعد Order History |
| Favorites | MISSING | لا flow | حفظ منتجات مفضلة | favorite control/list | customer preference persistence | لا | P2 | لا | لا تضف clutter قبل نجاح repeat order |
| Search | MISSING | لا search | اكتشاف الخدمات | search over service/product/help | catalog/search API لاحقًا | لا | P2 | لا | لا حاجة له في private beta محدود |
| Notifications | MISSING | لا notification center أو delivery integration | إكمال الطلب والتنبيه | inbox/settings/permission UX | push/email/SMS orchestration | marketing consent | P1 | ليس blocker إذا email confirmation موثوق | transactional notifications أولًا، marketing لاحقًا |
| WhatsApp / email support | PARTIAL | Hub يملك support card Mock ولا روابط تشغيلية مؤكدة | حل المشاكل بسرعة | deep links + context/order ref | support handoff optional | consent/contact disclosure | P1 | نعم إذا لا يوجد بديل support | WhatsApp/email context handoff قبل AI |
| Help Center / FAQ | PARTIAL | labels وsupport concepts موجودة، لا knowledge base مستقل | self-service | FAQ screens/search | content delivery optional | legal/support accuracy | P1 | لا للـprivate beta، مهم public | FAQ حقيقي قبل Smart Help |
| Camera | MISSING | ImagePicker gallery فقط | تصوير مباشر | Camera permission/capture | upload API | camera consent | P1 | لا للـprivate beta إذا gallery كافية | أضفه بعد gallery handshake |
| Gallery upload | EXISTS / MOCK BOUNDARY | Expo ImagePicker موجود في `/` و`/checkout` | أساس المعاملة | bind multipart upload | `POST /api/upload` | photo processing consent | P0 | نعم للـreal transaction | نفّذ binding بعد توفر API base URL |
| Multiple-photo selection | MISSING | اختيار صورة واحدة | albums/products مستقبلية | multi-select + ordering | upload batch contract | retention | P2 | لا | لا تضفه لمسار Photo Print الأول |
| Upload progress | EXISTS / MOCK | timer محلي في `/checkout` | feedback | replace with real progress/retry | upload status/chunking | لا | P0 للـreal upload | progress يجب أن يعكس network لا timer |
| Preview / replace / remove | EXISTS | `/checkout` PhotoCard | تقليل الخطأ | bind server asset and persistence | upload storageRef hidden from customer | retention/deletion | P0 | نعم للـreal upload | حافظ على الصورة عند quote/order errors |
| Crop / aspect ratio | PARTIAL | `allowsEditing` في Home فقط؛ لا crop control في checkout | ملاءمة المقاس | crop UI and review | backend may inspect final asset | لا | P1 | لا إذا backend supports safe crop | لا تخفِ crop result عن العميل |
| Resolution / quality check | PARTIAL / MOCK | GOOD/ACCEPTABLE/LOW_RESOLUTION controls Mock | يمنع طباعة سيئة | display server result | image inspection API authoritative | photo processing consent | P0 | نعم للـquality gate | لا تحسب DPI محليًا كحقيقة |
| Enhancement / upscale | PARTIAL / DEMO | intent/recommendation copy فقط | ينقذ صورًا ضعيفة | before/after consent and preview | AI/image pipeline | consent, retention, pricing | P2 | لا | بعد transaction core |
| Background cleanup | PARTIAL / DEMO | service card فقط | useful for portraits/IDs | job state + preview | image pipeline | consent | P2 | لا | لا تبنِ pipeline الآن |
| Restoration / enlargement | PARTIAL / DEMO | intent card وrecommendation | high-value future service | dedicated review | image pipeline | rights/retention | P2/P3 | لا | Phase 2 بعد reference transaction |
| Smart recommendations | PARTIAL / MOCK | Customer Intelligence next-best-action وprototype engine | تقليل القرارات | connect to real signals later | customer events/profile | profiling consent | P2 | لا | لا تعرض confidence أو personal data بلا حاجة |
| Product selection | EXISTS / MOCK | `/catalog` product cards | نقطة بداية الطلب | replace MOCK_PRODUCTS | `/api/cloudprinter/products` | no | P0 | نعم للـreal launch | backend authoritative |
| Quote / VAT | EXISTS / MOCK | `/catalog` VAT and expiry | price confidence | replace mock timer/value | `/api/cloudprinter/quote` | VAT invoice rules | P0 | نعم | لا تحسب السعر أو VAT في Manus |
| Delivery cost | PARTIAL / MOCK | country chips فقط؛ review يذكر 5 ر.س ثابتة Mock | cost clarity | delivery method breakdown | quote/order API | shipping policy | P0 | نعم | لا تعرض fixed delivery before server quote |
| Studio pickup | MISSING | لا flow حقيقي | Saudi convenience | pickup location/slot | availability/order API | pickup terms | P1 | لا إذا local delivery only | قرار owner/business قبل البناء |
| Local delivery | MISSING | لا flow حقيقي | market fit | address + SLA | logistics backend | delivery policy | P0 | نعم إذا الوعد به | ابدأ بمسار واحد موثق |
| Cloudprinter delivery | PARTIAL / CONTRACT ONLY | fulfillment adapter contract فقط | broader fulfillment | display customer-facing ETA only | Cloudprinter adapter/router | shipping disclosure | P1 | لا للـprivate beta unless selected | لا تكشف provider internals |
| Mada | MISSING / UNVERIFIED | لا payment UI أو integration | Saudi conversion | payment CTA later | Moyasar Phase 4C | payment/refund policy | P0 for paid public launch | نعم | لا تدّع دعمه قبل sandbox verification |
| Apple Pay | MISSING / UNVERIFIED | لا evidence | iPhone conversion | later payment UI | Moyasar/account/device config | payment disclosure | P1 | لا إذا Mada/card path works | اختبر availability بدل الوعد |
| Payment retry/recovery | MOCK ONLY | transaction screen states | recover failed payment | preserve image/order | Moyasar status/webhook | refund/failed payment policy | P0 | نعم | Phase 4C after order boundary |
| Confirmation / invoice / receipt | PARTIAL / MOCK | ready-for-payment mock only | trust and records | real order number and receipt | order/invoice API/email | VAT/commercial info | P0 | نعم | order confirmation must be server-backed |
| Contact details | PARTIAL | support labels, not verified channels | human escalation | WhatsApp/email/phone links | optional CRM handoff | contact disclosure | P1 | yes if no support path | publish one reliable path || Privacy / terms / refund / shipping policies | MISSING | no legal routes found | trust/legal compliance | content screens + footer/checkout links | policy version optional | owner/legal review | P0 public / P1 private beta | نعم للإطلاق العا
(Content truncated due to size limit. Use line ranges to read remaining content)