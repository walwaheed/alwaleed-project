# Studio AlWaleed — Digital Invitation Engine V1

## القرار

هذا المنتج وحدة مستقلة داخل التطبيق، تعمل حاليًا بوضع **Design + Workflow + Mock Prototype**. لا توجد مدفوعات أو عمليات Canva أو n8n أو Supabase أو GHL، ولا يتم إنشاء ملفات نهائية.

## رحلة العميل

`اختيار المناسبة → اختيار قالب معتمد → إدخال المعلومات → صورة اختيارية → اسم الضيف/قائمة → التاريخ والوقت والمكان → رابط الخريطة → معاينة → تعديلات محدودة → تأكيد → تصدير Mock`.

واجهة V1 عربية RTL وتعرض ثلاثة قوالب معتمدة: فاخر أسود وذهبي، أبيض وذهبي بسيط، وزهور معاصرة. العميل لا يتعامل مع طبقات أو خطوط أو تموضع يدوي؛ يتحكم فقط في البيانات الشخصية.

## قالب البيانات

يحمل كل قالب `template_id`, `occasion_type`, `style`, `aspect_ratio`, `background`, `font_rules`, `text_zones`, `image_zone`, `logo_zone`, `QR_zone`, `supported_languages`, و`export_formats`. تحمل الدعوة `occasion_title`, `family_name`, `groom_name`, `bride_name`, `host_name`, `guest_name`, التاريخين الهجري والميلادي، الوقت، المكان، المدينة، رابط الخريطة، RSVP، والرسالة الخاصة.

## الضيوف والدفعات

النسخة الحالية تعرض ضيفًا تجريبيًا واحدًا. التصميم المستقبلي يستقبل CSV/Excel، ينشئ `unique_invitation_id` وQR وRSVP link لكل ضيف، ثم يعالج دفعات 1 و10 و50 و100 و500+ عبر queue خلفية. لا يتم رفع أو قراءة ملفات محلية دون اختيار صريح من العميل.

## QR وRSVP

QR قابل للتبديل حسب القالب: خرائط، RSVP، أو ضيف فريد. مسار RSVP المستقبلي هو: فتح الدعوة → حضور/اعتذار → عدد الضيوف → تأكيد → تحديث لوحة المضيف. الحالات المقترحة: Invited, Delivered, Opened, Confirmed, Declined, Pending.

## Canva والتصيير

Canva لاحقًا طبقة تصميم للقوالب المعتمدة فقط: Studio AlWaleed يملك catalog وحقول البيانات وقواعد التحقق، بينما يمكن لـCanva أو rendering layer تنفيذ composition/export إذا كانت API والصلاحيات تدعم ذلك. يجب عدم السماح بتصميم حر أو mutation قبل موافقة المالك. البديل الآمن هو renderer مملوك للتطبيق يستقبل template_id وvalidated fields ويُرجع preview.

## التصدير والمنتجات

التصديرات المستقبلية: Story 1080×1920، Social 1080×1350، WhatsApp image، JPG عالي الدقة، PNG، PDF، ثم MP4 لاحقًا. طبقات المنتج المقترحة دون أسعار نهائية: BASIC، PERSONALIZED، PREMIUM، VIDEO، EVENT SUITE.

## Customer Intelligence

لا توجد قاعدة ذكاء جديدة. الأحداث المستقبلية ترسل إلى الطبقة المشتركة: `INVITATION_STARTED`, `TEMPLATE_VIEWED`, `TEMPLATE_SELECTED`, `INVITATION_PREVIEWED`, `GUEST_LIST_UPLOADED`, `ORDER_STARTED`, `ORDER_COMPLETED`, و`RSVP_RECEIVED`.

## التوصية

**BUILD** أصغر MVP: ثلاثة قوالب معتمدة، نموذج مناسبة واحد، معاينة تفاعلية، RSVP وQR تجريبيان، وتصدير Mock. **MODIFY** فقط بعد موافقة المالك على مصدر التصيير وعقد الدفع. **REJECT** التصميم الحر وبدء تكامل Canva أو الدفع قبل تثبيت القوالب وقواعد الخصوصية.
