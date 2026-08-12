# توثيق شامل — مشروع Dental Landing Page (Smoke Test)

> **الهدف من المشروع:** صفحة هبوط (Landing Page) لاختبار فرضية سوق (Smoke Test) — قياس هل أطباء واستقبال عيادات الأسنان في مصر مهتمين فعلاً بأداة تتابع خطط العلاج المعلّقة تلقائياً، قبل بناء أي منتج حقيقي. الصفحة بتجمع بيانات المهتمين (اسم، رقم، اسم عيادة، دور) في قاعدة بيانات حقيقية، مع استبيان اختياري قصير لفهم سلوك المتابعة الحالي عند العيادات.

---

## 1) البنية العامة للمشروع

```
dental-landing/
├── .gitignore          ← يمنع رفع ملفات حساسة زي .env بالغلط
├── index.html           ← الصفحة بالكامل (HTML + CSS + JS في ملف واحد)
├── README.md
└── api/
    └── lead.js           ← Serverless Function شغالة على Vercel، بتتواصل مع Supabase
```

**فكرة العمارة (Architecture) بشكل عام:**

```
المتصفح (index.html)
      │  fetch('/api/lead', { method: 'POST', body: {...} })
      ▼
Vercel Serverless Function (api/lead.js)
      │  fetch(`${SUPABASE_URL}/rest/v1/leads`, ...)
      ▼
Supabase (قاعدة بيانات Postgres + REST API تلقائي)
```

**ليه العمارة دي بالذات؟**
- `index.html` معمول Client-side بس (من غير أي framework زي React) عشان يكون خفيف وسريع النشر لصفحة هبوط بسيطة.
- الاتصال بقاعدة البيانات بيحصل من خلال **Serverless Function** (`lead.js`) مش من المتصفح مباشرة، عشان الـ **Secret Key** بتاع Supabase (اللي بيدّي صلاحية كتابة كاملة) يفضل مخفي على السيرفر، ومايظهرش أبداً في كود الصفحة اللي أي حد يقدر يشوفه بـ "View Page Source".

---

## 2) شرح كامل لملف `index.html`

الملف مقسّم منطقياً لـ 3 أجزاء: `<head>` (الميتاداتا والخطوط)، `<style>` (كل الـ CSS)، و`<body>` (الهيكل + الـ JavaScript في الآخر).

### 2.1) الـ `<head>`

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```
- `charset="UTF-8"` ضروري عشان الحروف العربية تتعرض صح، من غير رموز غريبة.
- `viewport` بيخلي الصفحة تتكيّف مع شاشة الموبايل (Responsive) بدل ما تظهر مصغّرة زي صفحة الديسكتوب.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=El+Messiri:wght@500;600;700&family=Tajawal:wght@400;500;700;800&family=IBM+Plex+Sans:wght@500;600&display=swap" rel="stylesheet">
```
- `preconnect` بيقول للمتصفح "هتحتاج تتصل بالدومين ده قريب" فيبدأ الاتصال بدري، فالخطوط تحمّل أسرع شوية.
- بنجيب 3 خطوط من Google Fonts:
  - **El Messiri** — للعناوين الكبيرة (h1, h2, h3)، شكله عربي مميز شوية عن الخطوط التقليدية.
  - **Tajawal** — الخط الأساسي لباقي النصوص (نضيف وسهل القراءة بالعربي).
  - **IBM Plex Sans** — للأرقام والمبالغ (زي "8,000 ج.م")، عشان الأرقام تتكتب بشكل لاتيني نضيف حتى وسط نص عربي.

### 2.2) متغيّرات الألوان (CSS Custom Properties)

```css
:root {
  --ink: #12312C;      /* اللون الأساسي للنصوص - أخضر غامق قريب من الأسود */
  --bg: #FBF6EF;        /* خلفية الصفحة - كريمي فاتح */
  --card: #FFFFFF;      /* خلفية الكروت */
  --coral: #E2673F;     /* لون التمييز الأساسي (الأزرار، التنبيهات) - برتقالي مرجاني */
  --coral-soft: #FBEAE2; /* نسخة فاتحة من الكورال - للخلفيات الخفيفة */
  --green: #2E8F6B;     /* لون النجاح (تسجيل ناجح، حالة "تم القبول") */
  --green-soft: #E4F3EC;
  --line: #E5DCC8;      /* لون الحدود الخفيفة */
  --muted: #6B6459;     /* لون النصوص الثانوية (الوصف تحت العناوين) */
}
```
**ليه بنستخدم CSS Variables بدل ما نكتب اللون كل مرة؟** لو حبينا نغيّر لون العلامة التجارية بعدين، بنغيّره في مكان واحد بس، وكل الصفحة بتتحدث تلقائياً. ده كمان بيمنع اختلاف بسيط في نفس اللون بسبب الكتابة اليدوية في أماكن مختلفة.

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
```
- `box-sizing: border-box` بيخلي الـ `padding` والـ `border` يتحسبوا **جوه** العرض المحدد للعنصر، مش زيادة عليه. من غيرها، عنصر عرضه `300px` وعليه `padding: 20px` هيبقى عرضه الفعلي `340px` وده بيسبب مشاكل في التنسيق.
- `margin: 0; padding: 0;` بيصفّر القيم الافتراضية اللي كل متصفح بيحطها لوحده (زي المسافة الافتراضية فوق وتحت `<h1>`)، عشان نتحكم في المسافات إحنا بأنفسنا بدل ما نعتمد على تصرف كل متصفح.

```css
.num {
  font-family: 'IBM Plex Sans', sans-serif;
  direction: ltr;
  unicode-bidi: isolate;
}
```
هذا الكلاس بيتحط على أي رقم جوه نص عربي (زي `8,000 ج.م`). المشكلة إن النصوص العربية بتتكتب من اليمين لليسار (RTL)، فلو حطينا رقم زي "8,000" جواها من غير معالجة، ممكن يظهر بترتيب غلط (مثلاً "000,8" بدل "8,000"). `direction: ltr` بيجبر الرقم يتكتب من الشمال لليمين زي طبيعته، و`unicode-bidi: isolate` بيعزل الرقم عن باقي النص العربي المحيط بيه عشان محرك الكتابة (Bidi Algorithm) مايلخبطش الترتيب.

### 2.3) بنية الصفحة (Layout System)

```css
.wrap {
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 24px;
}
```
دي "الحاوية" (Container) المستخدمة في كل قسم بالصفحة. `max-width: 1080px` بيمنع المحتوى من التمدد لعرض غير مريح على شاشات كبيرة جداً. `margin: 0 auto` بتوسّط الحاوية أفقياً (اليسار واليمين بيتساووا تلقائياً). `padding: 0 24px` بيدّي مسافة أمان من حواف الشاشة على الموبايل عشان النص مايلزقش في الحافة.

### 2.4) قسم الـ Hero (أول قسم في الصفحة)

```css
.hero-grid {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 56px;
  align-items: center;
}
```
بنستخدم **CSS Grid** عشان نقسّم القسم لعمودين: النص على اليمين (بما إن الصفحة RTL) والكارت التوضيحي (Queue Visual) على الشمال. `1.05fr 0.95fr` معناها العمود الأول أعرض شوية من التاني (مش نص بالظبط)، عشان النص ياخد مساحة أكبر شوية من الصورة التوضيحية. `align-items: center` بيحاذي العمودين في المنتصف رأسياً حتى لو ارتفاعهم مختلف.

```css
@media (max-width:860px) {
  .hero-grid {
    grid-template-columns: 1fr;
    gap: 36px;
  }
  ...
}
```
**Media Query** — على الشاشات الأصغر من 860px (موبايل)، بنحول التقسيم لعمود واحد بس (`1fr`) عشان العمودين ينزلوا فوق بعض بدل ما يتزنقوا جنب بعض في مساحة ضيقة.

### 2.5) العنصر التوضيحي (Signature Visual) — كارت "خطط علاج قيد المتابعة"

ده العنصر البصري اللي بيوضح فكرة المنتج نفسها من غير ما المستخدم يحتاج يقرأ كتير. بيعرض 3 حالات مرضى، اتنين "قيد الانتظار" (بلون الكورال) وواحدة "تم القبول" (بلون الأخضر)، عشان يوصّل بصرياً معنى "المتابعة والتحويل".

```css
.qstatus {
  background: var(--coral-soft);
  color: var(--coral);
  transition: background .6s ease, color .6s ease;
}
.qcard.done .qstatus {
  background: var(--green-soft);
  color: var(--green);
}
```
الكلاس `.qcard.done` بيغيّر لون شارة الحالة من كورال (انتظار) لأخضر (قبول). الـ `transition` هنا موجودة تحسباً لو حبينا نستخدم جافاسكريبت بعدين نبدّل الحالة بشكل متحرك (Animation)، لكن في النسخة الحالية الحالات ثابتة (Static) مكتوبة يدوياً في الـ HTML، مش بتتغيّر فعلياً.

### 2.6) قسم الإحصائيات (Problem Band)

```html
<div class="stat">30–50%</div>
<div class="stat-label">متوسط نسبة قبول خطط العلاج في العيادات فعليًا</div>
```
الأرقام دي (30-50%، 70%+) مبنية على أبحاث عامة عن "Case Acceptance Rate" في عيادات الأسنان (مش أرقام مصرية مؤكدة، لكنها معيار صناعي معروف عالمياً)، بتُستخدم هنا عشان تبني مصداقية فورية للمشكلة قبل ما نشرح الحل.

### 2.7) الفورم (Form Section)

```html
<form id="leadForm" novalidate>
```
`novalidate` بتلغي الـ Validation التلقائي اللي بيعمله المتصفح (زي رسالة "Please fill this field" الافتراضية بالإنجليزي)، عشان نتحكم إحنا في رسائل الخطأ بالعربي بأنفسنا عن طريق الجافاسكريبت بدل ما نسيب المتصفح يتحكم فيها.

```html
<input type="text" id="name" required placeholder="اسمك بالكامل">
<div class="field-error" id="nameError"></div>
```
كل حقل مربوط بعنصر `field-error` فاضي جنبه، بيتملى ديناميكياً بالجافاسكريبت برسالة الخطأ المناسبة (هنشرحها في قسم الـ JS).

```html
<input type="tel" id="phone" required placeholder="01xxxxxxxxx">
```
`type="tel"` بيخلي لوحة المفاتيح على الموبايل تظهر أرقام مباشرة بدل الكيبورد الكامل، ده تحسين بسيط لتجربة المستخدم (UX) مش Validation فعلي (الـ Validation الحقيقي بيحصل في الجافاسكريبت).

### 2.8) قسم الاستبيان الاختياري (Survey Panel)

```html
<div class="chips" data-q="tracking">
  <button type="button" class="chip">ورقة / دفتر</button>
  ...
</div>
```
`data-q="tracking"` هو **Data Attribute** — طريقة تخزين معلومة إضافية في عنصر الـ HTML نفسه، بيتقرأ بعدين من الجافاسكريبت (`group.dataset.q`) عشان نعرف الإجابة دي بتاعة أنهي سؤال بالظبط لما نجمّعها.

`type="button"` (مش `type="submit"`) — مهم جداً، عشان الزرار ده جوه نفس صفحة الفورم لكن مش المفروض يعمل Submit للفورم الأساسي؛ لو نسينا نحدد `type="button"`، الزرار كان هيتصرف كـ Submit افتراضياً ويعمل مشاكل.

### 2.9) عنصر التوست (Toast)

```html
<div class="toast" id="toast"><span class="toast-icon" id="toastIcon">✓</span><span id="toastMsg"></span></div>
```
عنصر واحد ثابت في نهاية الصفحة، مخفي بشكل افتراضي (`opacity: 0` و`pointer-events: none`)، وبيتفعّل ديناميكياً بالجافاسكريبت وقت الحاجة. الطريقة دي أفضل من إنشاء عنصر توست جديد كل مرة، لأننا بنعيد استخدام نفس العنصر ونغيّر محتواه بس.

```css
.toast {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  opacity: 0;
  pointer-events: none;
  transition: opacity .25s ease, transform .25s ease;
}
.toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
```
- `position: fixed` بيخلي التوست يفضل في نفس المكان حتى لو المستخدم عمل Scroll.
- `left: 50%` + `transform: translateX(-50%)` هي الطريقة القياسية لتوسيط عنصر أفقياً بعرض غير معروف مسبقاً.
- بنستخدم كلاس `.show` بيتضاف/يتشال بالجافاسكريبت عشان نتحكم في الظهور، والـ `transition` بتخلي الظهور/الاختفاء سلس بدل ما يكون فجأة.

---

## 3) شرح كامل للـ JavaScript في `index.html`

### 3.1) التوست (Toast Function)

```javascript
let toastTimer = null;
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const icon = document.getElementById('toastIcon');
  document.getElementById('toastMsg').textContent = message;
  icon.textContent = type === 'success' ? '✓' : '!';
  toast.classList.toggle('error', type !== 'success');
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}
```
- `type = 'success'` هي **Default Parameter** — لو حد نادى الدالة من غير ما يحدد النوع، بتفترض إنه رسالة نجاح.
- `classList.toggle('error', type !== 'success')` — الـ `toggle` هنا بمعطى تاني (Boolean) معناها: لو الشرط `true` ضيف الكلاس، لو `false` شيله. أنضف من كتابة `if/else` منفصلة.
- `clearTimeout(toastTimer)` قبل عمل `setTimeout` جديد — ده مهم عشان لو المستخدم شغّل توست تاني قبل ما الأول يختفي، منمنعش الـ timer القديم من إنه يقفل التوست الجديد بدري قبل معاده.

### 3.2) دوال التحقق (Validation Functions)

```javascript
function isValidEgyptPhone(raw) {
  const cleaned = raw.replace(/[\s-]/g, '');
  return /^(\+20|0020|20)?01[0125][0-9]{8}$/.test(cleaned);
}
```
- `raw.replace(/[\s-]/g, '')` — بتشيل أي مسافات (`\s`) أو شرطات (`-`) من الرقم قبل الفحص، عشان لو حد كتب الرقم بمسافات (`010 123 4567`) أو شرطة (`010-123-4567`) يفضل يتحسب صحيح.
- الـ Regular Expression:
  - `^` و`$` — بداية ونهاية النص بالظبط (مفيش حروف زيادة قبل أو بعد).
  - `(\+20|0020|20)?` — كود الدولة اختياري (`+20` أو `0020` أو `20`)، العلامة `?` معناها "0 أو مرة واحدة".
  - `01[0125]` — لازم تبدأ بـ `01` وبعدها واحد من الأرقام `0`، `1`، `2`، أو `5` (دول بادئات شبكات المحمول المصرية: 010 فودافون، 011 اتصالات، 012 اورنج، 015 وي).
  - `[0-9]{8}` — بعد كده لازم 8 أرقام بالظبط.

```javascript
function getNameErrorMessage(value) {
  const name = value.trim();
  if (name.length === 0) return 'الاسم مطلوب — من فضلك اكتبي اسمك';
  if (name.length < 2) return 'الاسم قصير أوي — اكتبي اسم مكوّن من حرفين على الأقل';
  return null;
}
```
الدالة دي بترجع 3 احتمالات: رسالة خطأ لو الحقل فاضي، رسالة خطأ مختلفة لو مكتوب بس قصير جداً، أو `null` (لا يوجد خطأ) لو سليم. الفرق بين الحالتين مهم UX-wise — رسالة "الحقل مطلوب" غير رسالة "المكتوب مش كافي"، والمستخدم بيفهم بسرعة أكبر إيه المطلوب بالظبط منه.

```javascript
function applyFieldError(input, errorEl, message) {
  if (message) {
    input.classList.add('invalid');
    errorEl.textContent = message;
    errorEl.classList.add('show');
  } else {
    input.classList.remove('invalid');
    errorEl.classList.remove('show');
  }
}
```
دالة مساعدة (Helper Function) بتاخد الحقل، عنصر رسالة الخطأ، والرسالة نفسها (أو `null`)، وبتطبّق أو تشيل التنسيق البصري (حدود حمراء + رسالة) حسب الحالة. استخدامها في مكانين مختلفين (submit + input) بيمنعنا من تكرار نفس الكود مرتين (مبدأ DRY: Don't Repeat Yourself).

```javascript
function validateForm() {
  const nameMsg = getNameErrorMessage(nameInput.value);
  const phoneMsg = getPhoneErrorMessage(phoneInput.value);
  applyFieldError(nameInput, nameError, nameMsg);
  applyFieldError(phoneInput, phoneError, phoneMsg);
  return !nameMsg && !phoneMsg;
}
```
بترجع `true` بس لو الاتنين سليمين (مفيش رسالة خطأ للاسم ولا للرقم). دي الدالة اللي بتتنادى قبل إرسال الفورم للسيرفر، عشان مانبعتش طلب فاضي أو غلط أساساً.

### 3.3) دالة إعادة تعيين الفورم

```javascript
function resetToForm() {
  form.reset();
  document.getElementById('surveyPanel').style.display = 'flex';
  ...
  Object.keys(surveyAnswers).forEach(k => delete surveyAnswers[k]);
  successMsg.style.display = 'none';
  form.style.display = 'flex';
}
```
- `form.reset()` هي دالة مدمجة (Built-in) في المتصفح بتفضّي كل حقول الفورم لقيمها الافتراضية.
- `Object.keys(surveyAnswers).forEach(k => delete surveyAnswers[k])` — بتمسح كل الإجابات المخزّنة من الاستبيان السابق، عشان لو حد تاني سجّل بعده على نفس الجهاز، ماتفضلش الإجابات القديمة موجودة بالغلط.
- الهدف الكلي من الدالة دي: بعد ما شخص يسجّل ويكمل (أو يتخطى) الاستبيان، الصفحة ترجع لحالتها الأولى جاهزة لتسجيل شخص جديد، من غير ما يحتاج يعمل Refresh للصفحة.

### 3.4) معالج إرسال الفورم (Submit Handler)

```javascript
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  ...
```
- `addEventListener('submit', ...)` — بيربط دالة تتنفذ أوتوماتيك لما حد يضغط الزرار من نوع `submit` جوه الفورم.
- `e.preventDefault()` — **خطوة أساسية جداً**. بدونها، المتصفح هيعمل السلوك الافتراضي بتاعه وهو **إعادة تحميل الصفحة بالكامل** (زي فورم HTML قديم)، وده هيلغي أي جافاسكريبت شغال ومش هيسيبنا نبعت البيانات بطريقة Ajax/Fetch.
- الدالة `async` عشان جوّاها بنستخدم `await` مع الـ `fetch`.

```javascript
if (!validateForm()) {
  showToast('في بيانات ناقصة أو غلط، شوفي الملاحظات تحت الحقول', 'error');
  return;
}
```
لو الفورم مش سليم، نوقف التنفيذ هنا (`return`) قبل ما نحاول نبعت أي حاجة للسيرفر.

```javascript
const btn = form.querySelector('.submit-btn');
btn.disabled = true;
btn.textContent = 'جاري إرسال التسجيل...';
```
تعطيل الزرار فوراً (`disabled = true`) قبل إرسال الطلب — ده بيمنع المستخدم من الضغط مرتين بسرعة (Double Submit)، وهي واحدة من المشاكل اللي واجهناها فعلياً في المشروع (هنشرحها بالتفصيل في قسم "المشاكل والحلول").

```javascript
const entry = {
  name: nameInput.value.trim(),
  phone: phoneInput.value.trim(),
  clinic: document.getElementById('clinic').value.trim(),
  role: document.getElementById('role').value.trim(),
  ts: new Date().toISOString()
};
```
بنجمّع كل قيم الحقول في **Object واحد** (`entry`)، بنستخدم `.trim()` على كل قيمة عشان نشيل أي مسافات فاضية في أول أو آخر النص (زي لو حد كتب "  أحمد " بمسافة غلط). `new Date().toISOString()` بتنشئ توقيت بصيغة عالمية موحدة (زي `2026-08-12T11:12:40.624Z`) عشان نسجّله كوقت التسجيل.

```javascript
try {
  const response = await fetch('/api/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  });
```
- `fetch('/api/lead', ...)` — بيبعت طلب HTTP لعنوان نسبي `/api/lead`. بما إن الملف موجود في مجلد `api/` جوه مشروع Vercel، فـ Vercel بيتعرف عليه تلقائياً كـ Serverless Function متاحة على المسار ده.
- `method: 'POST'` — لأننا بنرسل بيانات جديدة (مش بنطلب بيانات موجودة، اللي كان هيبقى `GET`).
- `headers: { 'Content-Type': 'application/json' }` — بنقول للسيرفر "الجسم (Body) اللي هبعته ده صيغته JSON"، عشان يعرف يفكّه صح.
- `JSON.stringify(entry)` — بتحوّل الـ Object الجافاسكريبت لنص (String) بصيغة JSON، لأن الشبكة (HTTP) مابتنقلش Objects مباشرة، بس نصوص.

```javascript
if (response.status === 409) {
  showToast('الرقم ده مسجّل عندنا بالفعل ✓', 'error');
  btn.disabled = false;
  btn.textContent = 'سجّل اهتمامك';
  return;
}
```
`409 Conflict` هو رمز حالة HTTP قياسي بيدل على "الطلب بيتعارض مع حالة موجودة بالفعل" — استخدمناه هنا تحديداً (بدل 400 أو 500 العامة) عشان يعبّر بدقة عن حالة "الرقم ده مسجّل بالفعل"، والواجهة بتقدر تفرّق بينه وبين أي خطأ تاني وتوريله رسالة مناسبة.

```javascript
if (!response.ok) {
  throw new Error('Lead submission failed');
}
```
`response.ok` خاصية جاهزة في كائن الـ `fetch response`، بترجع `true` لو الحالة (Status Code) بين 200 و299 (يعني نجاح). لو مش كده، بنرمي خطأ يدوي (`throw`) عشان ينتقل التنفيذ لجزء الـ `catch` تحت.

```javascript
} catch (err) {
  console.error(err);
  showToast('حصلت مشكلة أثناء التسجيل، حاولي تاني', 'error');
} finally {
  btn.disabled = false;
  btn.textContent = 'سجّل اهتمامك';
}
```
- `try/catch/finally` هو أسلوب معالجة الأخطاء القياسي في الجافاسكريبت. أي خطأ يحصل جوه `try` (زي فشل الاتصال بالإنترنت، أو رفض السيرفر) بيتلقط في `catch` من غير ما يكسر باقي الصفحة.
- `finally` بينفّذ **دايماً**، سواء نجح الطلب أو فشل — بنستخدمه هنا عشان نرجّع الزرار لحالته الطبيعية (مش معطّل، والنص الأصلي) في كل الحالات، إلا في حالة الـ 409 اللي عندها `return` قبل الوصول لـ `finally` (لكن هي كمان بترجّع الزرار يدوياً قبل الـ `return`).

### 3.5) منطق الاستبيان الاختياري

```javascript
document.querySelectorAll('.chips').forEach(group => {
  const qKey = group.dataset.q;
  group.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      group.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      surveyAnswers[qKey] = chip.textContent.trim();
    });
  });
});
```
- `querySelectorAll('.chips')` بترجع **كل** مجموعات الأسئلة (3 مجموعات في حالتنا).
- لكل مجموعة، بنضيف حدث ضغط على كل خيار (`chip`) جواها.
- لما حد يضغط على خيار: أول حاجة بنشيل كلاس `selected` من **كل** الخيارات في نفس المجموعة (عشان يبقى اختيار واحد بس مسموح لكل سؤال، زي زرار راديو Radio Button)، وبعدين نضيف الكلاس للاختيار المضغوط بس.
- `surveyAnswers[qKey] = chip.textContent.trim()` — بنسجّل الإجابة في Object باستخدام اسم السؤال (`tracking`, `hasSystem`, `decisionMaker`) كمفتاح (Key)، والنص المكتوب على الزرار كقيمة.

```javascript
document.getElementById('sendSurvey').addEventListener('click', async () => {
  ...
  if (Object.keys(surveyAnswers).length === 0) {
    panel.style.display = 'none';
    setTimeout(resetToForm, 900);
    return;
  }
  try {
    await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...lastEntry, survey: surveyAnswers, type: 'survey' })
    });
  } catch (err) { console.error(err); }
  panel.style.display = 'none';
  thanks.style.display = 'block';
  setTimeout(resetToForm, 1800);
});
```
- `Object.keys(surveyAnswers).length === 0` — لو المستخدم ماجاوبش على أي سؤال (ضغط "إرسال" من غير ما يختار حاجة)، بنتخطى إرسال أي طلب فاضي للسيرفر.
- `{ ...lastEntry, survey: surveyAnswers, type: 'survey' }` — هنا بنستخدم **Spread Operator** (`...`) عشان نأخذ كل خصائص الـ `lastEntry` (الاسم، الرقم، العيادة، الدور) ونضيف عليها خاصيتين جداد: `survey` (إجابات الاستبيان) و`type: 'survey'` (عشان الـ Backend يعرف إن الطلب ده مختلف عن التسجيل الأساسي).
- الـ `try/catch` هنا بيكتفي بتسجيل الخطأ في الـ `console` من غير ما يوري توست خطأ للمستخدم — قرار متعمّد، لأن التسجيل الأساسي خلص خلاص بنجاح، ومش عايزين نضايق المستخدم برسالة خطأ عن استبيان اختياري مش أساسي.
- `setTimeout(resetToForm, 1800)` — بعد ثانية ونص تقريباً (وقت كافي إن المستخدم يقرأ رسالة الشكر)، بترجع الصفحة للفورم الفاضي تلقائياً.

---

## 4) شرح كامل لملف `api/lead.js`

```javascript
export default async function handler(req, res) {
```
دي الصيغة القياسية لـ **Vercel Serverless Function** بلغة الجافاسكريبت. أي ملف جوه مجلد `api/` بيصدّر (`export default`) دالة بالشكل ده، Vercel بيحوّله تلقائياً لـ API Endpoint بدون أي إعداد إضافي. `req` (Request) هو الطلب الوارد من المتصفح، و`res` (Response) هو اللي بنستخدمه عشان نرجّع رد.

```javascript
if (req.method !== "POST") {
  return res.status(405).json({ success: false, message: "Method not allowed" });
}
```
بنتأكد إن الطلب من نوع POST بس. لو حد حاول يعمل GET أو أي نوع تاني على نفس الرابط، بنرجّع كود `405 Method Not Allowed` بدل ما نكمل تنفيذ باقي الكود من غير داعي.

```javascript
const { name, phone, clinic = "", role = "", survey = {}, type = "lead", ts } = req.body || {};
```
- **Destructuring** — بنستخرج القيم من `req.body` (البيانات اللي بعتها المتصفح) في متغيرات منفصلة دفعة واحدة، بدل ما نكتب `req.body.name`، `req.body.phone`... إلخ كل مرة.
- القيم الافتراضية (`= ""`, `= {}`, `= "lead"`) بتتفعّل لو الحقل مش موجود في الطلب أصلاً — ده بيحمينا من أخطاء لو الفورم بعت بيانات ناقصة.
- `req.body || {}` — لو `req.body` جه فاضي تماماً (`undefined` أو `null`)، بنستخدم Object فاضي بدل ما الكود يوقع بخطأ وقت محاولة الوصول لخصائصه.

```javascript
if (!name || !phone) {
  return res.status(400).json({ success: false, message: "Name and phone are required" });
}
```
تحقق أمان إضافي **على مستوى السيرفر** — حتى لو الفورم في الواجهة بيتحقق من البيانات، لازم السيرفر يتحقق بردو، لأن أي حد يقدر يبعت طلب مباشر للـ API (من Postman مثلاً) من غير ما يمر بالفورم أصلاً. مفيش ثقة كاملة أبداً في أي بيانات جايه من المتصفح.

```javascript
const cleanedPhone = String(phone).trim();
```
`String(phone)` بتحول القيمة لنص بشكل مضمون (تحسباً لو جت كرقم مش نص لأي سبب)، و`.trim()` بتشيل أي مسافات زيادة.

### 4.1) حالة تحديث الاستبيان (PATCH)

```javascript
if (type === "survey") {
  const updateResponse = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/leads?phone=eq.${encodeURIComponent(cleanedPhone)}&type=eq.lead`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.SUPABASE_SECRET_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ survey }),
    }
  );
  ...
}
```
- `process.env.SUPABASE_URL` و`process.env.SUPABASE_SECRET_KEY` — دول **متغيّرات بيئة (Environment Variables)** مخزّنة في إعدادات Vercel، مش مكتوبة في الكود نفسه. ده أهم قاعدة أمان في المشروع كله: أي قيمة حساسة (زي الـ Secret Key) لازم تتخزن برّه الكود، عشان مايظهرش لو حد شاف الملف على GitHub.
- الرابط `?phone=eq.${...}&type=eq.lead` هي صيغة **PostgREST** (اللي Supabase بيستخدمها) للفلترة: `phone=eq.X` معناها "الصفوف اللي فيها phone يساوي X بالظبط"، و`&type=eq.lead` بتضيف شرط تاني (وبينهم AND ضمني).
- `encodeURIComponent(cleanedPhone)` — بتحوّل أي رموز خاصة في رقم التليفون (زي `+`) لصيغة آمنة للاستخدام جوه رابط (URL)، عشان الرابط مايتكسرش.
- `method: "PATCH"` — بنستخدم PATCH مش POST هنا، لأننا مش بنضيف صف جديد، إحنا بنعدّل صف موجود بالفعل (بنحدّث عمود `survey` بس).
- `apikey` و`Authorization: Bearer ...` — هيدرز (Headers) مطلوبين من Supabase في كل طلب، بيثبتوا إن الطلب جاي من مصدر موثوق عنده الـ Secret Key الصحيح.
- `Prefer: "return=minimal"` — بنقول لـ Supabase "مش محتاجين ترجّعلنا الصف بعد التعديل، بس أكّدلنا إنه نجح"، ده بيوفّر حجم البيانات المنقولة (مفيدة للأداء).

### 4.2) حالة التسجيل الأساسي — التحقق من عدم التكرار

```javascript
const checkResponse = await fetch(
  `${process.env.SUPABASE_URL}/rest/v1/leads?phone=eq.${encodeURIComponent(cleanedPhone)}&type=eq.lead&select=id`,
  { method: "GET", headers: { apikey: ..., Authorization: ... } }
);

if (checkResponse.ok) {
  const existing = await checkResponse.json();
  if (Array.isArray(existing) && existing.length > 0) {
    return res.status(409).json({ success: false, message: "This phone number is already registered" });
  }
}
```
- `select=id` — بنطلب من Supabase عمود الـ `id` بس (مش كل الأعمدة)، لأن كل اللي محتاجينه نعرفه هو "هل في صف موجود أصلاً؟"، مش تفاصيله.
- لو الرد `ok` (يعني الطلب نجح فنياً)، بنحوّل الرد لـ Object جافاسكريبت (`.json()`)، ولو طلعت مصفوفة فيها عنصر واحد على الأقل، معناها في صف موجود بالفعل بنفس الرقم، فبنرجّع `409` ونوقف التنفيذ هنا.
- **ملاحظة مهمة (هنشرحها بالتفصيل في قسم المشاكل):** الفحص ده لوحده مش كافي 100% لمنع التكرار في حالة سباق (Race Condition) — لو طلبين وصلوا في نفس اللحظة بالظبط، ممكن الاتنين يعدّوا الفحص قبل ما أي واحد فيهم يكمّل التسجيل. عشان كده ضفنا طبقة حماية تانية في قاعدة البيانات نفسها (هنوضحها).

### 4.3) الإدراج الفعلي (Insert)

```javascript
const lead = {
  name: String(name).trim(),
  phone: cleanedPhone,
  clinic: String(clinic).trim(),
  role: String(role).trim(),
  survey,
  type,
  created_at: ts || new Date().toISOString(),
};

const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/leads`, {
  method: "POST",
  headers: { "Content-Type": "application/json", apikey: ..., Authorization: ..., Prefer: "return=minimal" },
  body: JSON.stringify(lead),
});
```
- بنبني Object نضيف (`lead`) بكل الأعمدة المطلوبة، ونتأكد كل قيمة نص (`String(...)`) ومنضّفة (`.trim()`).
- `created_at: ts || new Date().toISOString()` — لو المتصفح بعت وقت (`ts`) بنستخدمه، ولو مش موجود بنستخدم وقت السيرفر الحالي كبديل (Fallback).
- `method: "POST"` هنا (مختلف عن PATCH فوق) — لأننا بنضيف صف **جديد** بالكامل، مش بنعدّل موجود.

### 4.4) معالجة الأخطاء والتقاط خطأ التكرار من قاعدة البيانات

```javascript
if (!response.ok) {
  const errorText = await response.text();
  console.error("Supabase error:", errorText);

  if (errorText.includes("23505") || errorText.includes("duplicate key")) {
    return res.status(409).json({ success: false, message: "This phone number is already registered" });
  }

  return res.status(500).json({ success: false, message: "Failed to save lead" });
}
```
- `23505` هو **كود خطأ قياسي في Postgres** بيدل على "انتهاك قيد التفرد (Unique Constraint Violation)" — يعني حاولنا نضيف قيمة موجودة بالفعل في عمود متأكد إنه فريد. لو الفحص المبدئي (فوق) فشل يمنع التكرار بسبب سباق التوقيت، قاعدة البيانات نفسها هترفض الإدراج وترجّع الخطأ ده، وإحنا بنلقطه هنا ونحوّله لرسالة 409 واضحة بدل ما يوصل للمستخدم كخطأ 500 عام مالوش معنى واضح.
- `console.error(...)` — بيسجّل تفاصيل الخطأ في **سجلات Vercel (Logs)**، مش بيظهر للمستخدم النهائي. ده بيسمحلنا نشخّص المشاكل بعدين من غير ما نكشف تفاصيل تقنية حساسة للمستخدم.

```javascript
} catch (error) {
  console.error("Lead API error:", error);
  return res.status(500).json({ success: false, message: "Internal server error" });
}
```
الـ `catch` الخارجي ده بيلقط أي خطأ غير متوقع في أي مكان من الدالة كلها (زي فشل الاتصال بالإنترنت نفسه، أو خطأ برمجي مانتوقعوش)، عشان الدالة ما توقعش (Crash) بدون رد للمستخدم أبداً.

---

## 5) إعداد Supabase خطوة بخطوة

### 5.1) إنشاء المنظمة والمشروع
1. أنشأنا **Organization** جديدة على Supabase (Free Plan).
2. جوّاها أنشأنا **Project** باسم `dental-landing`، في منطقة (Region) **West EU (Ireland)** — أقرب منطقة جغرافية متاحة على الخطة المجانية لمصر وقت الإعداد.

### 5.2) إنشاء جدول `leads`
من **SQL Editor** شغّلنا:
```sql
create table public.leads (
  id bigint generated by default as identity primary key,
  name text not null,
  phone text not null,
  clinic text,
  role text,
  survey jsonb default '{}'::jsonb,
  type text default 'lead',
  created_at timestamptz default now()
);
```
- `id bigint generated by default as identity primary key` — عمود رقمي يزيد تلقائياً (Auto-increment) ويُستخدم كمفتاح أساسي (Primary Key) يميّز كل صف.
- `text not null` — الاسم والرقم إجباريين، ما يقدروش يتسجّلوا فاضيين على مستوى قاعدة البيانات نفسها (طبقة حماية إضافية غير الـ Validation في الكود).
- `jsonb` — نوع بيانات خاص بـ Postgres بيخزّن JSON بشكل مضغوط وقابل للفهرسة والاستعلام، استخدمناه لعمود `survey` عشان إجابات الاستبيان متغيّرة الشكل (Object فيه مفاتيح مختلفة) ومش محتاجة أعمدة منفصلة لكل سؤال.
- `default now()` — بيحط توقيت الإدراج تلقائياً لو معدّيناش قيمة.

### 5.3) تفعيل Row Level Security (RLS)
```sql
alter table public.leads
enable row level security;
```
بيمنع أي وصول للجدول (قراءة أو كتابة) **إلا لو في سياسة (Policy) صريحة بتسمح بيه**. في حالتنا، ما أضفناش أي Policy، لأن الوصول الوحيد للجدول بيحصل من خلال الـ **Secret Key** (من `lead.js`)، والـ Secret Key بيتخطى RLS بالكامل بحكم صلاحياته المرتفعة (زي الـ `service_role` القديم في نظام Supabase).

### 5.4) الحصول على API Keys
من **Project Settings → API Keys**:
- **Publishable Key** (بادئتها `sb_publishable_...`) — آمنة تتحط في كود Frontend، لأنها محدودة الصلاحيات ولازم RLS يسمح بالعملية.
- **Secret Key** (بادئتها `sb_secret_...`) — صلاحيات كاملة، بتتخطى RLS، **ممنوع تظهر في أي كود Frontend أبداً**. دي اللي استخدمناها في `lead.js` بس (كود Backend).

### 5.5) إضافة قيد التفرد (Unique Constraint) — بعد مشكلة التكرار
```sql
create unique index leads_unique_lead_phone
on public.leads (phone)
where type = 'lead';
```
- **Partial Unique Index** — بيفرض إن رقم التليفون يبقى فريد، لكن **بس بين الصفوف اللي `type = 'lead'`**؛ صفوف الاستبيان (لو استخدمناها قبل التحديث لـ PATCH) مش داخلة في القيد ده.
- الفايدة الأساسية: القيد ده بيتفرض على مستوى **قاعدة البيانات نفسها**، فهو الطريقة الوحيدة المضمونة 100% لمنع التكرار حتى لو طلبين وصلوا في نفس اللحظة بالظبط (Race Condition) — أي فحص بيتم في الكود (زي الـ GET قبل الـ POST) ممكن يفشل في الحالة دي، لكن قيد قاعدة البيانات لأ.

---

## 6) إعداد Vercel خطوة بخطوة

### 6.1) ربط المشروع
1. أنشأنا Repository على GitHub (`Hanan525-eng/dental-landing`).
2. من Vercel، عملنا **Import Project** واخترنا الـ Repository ده مباشرة — Vercel بيتعرف تلقائياً على أي ملف جوه `api/` كـ Serverless Function من غير إعداد إضافي.

### 6.2) إضافة Environment Variables
من **Project Settings → Environment Variables**، ضفنا:

| الاسم | القيمة | ليه محتاجينه |
|---|---|---|
| `SUPABASE_URL` | `https://ctpmlnoeauimrzalhgcy.supabase.co` | عنوان مشروع Supabase، بيُستخدم لبناء رابط الـ REST API |
| `SUPABASE_SECRET_KEY` | القيمة السرية من Supabase | صلاحية الكتابة/القراءة في قاعدة البيانات |

**نقطة مهمة جداً تعلّمناها من مشكلة حقيقية حصلت:** كل متغيّر بيئة في Vercel لازم يُحدَّد له **البيئة (Environment)** اللي هيشتغل فيها — Production، Preview، أو Development. أول مرة ضفنا `SUPABASE_URL`، اتحدد بالغلط على **Preview بس**، فالموقع الشغال فعلياً (Production) ماكانش شايف قيمته خالص، وده سبب أول خطأ واجهناه (هنشرحه بالتفصيل في القسم الجاي).

### 6.3) إعادة النشر (Redeploy)
بعد أي تعديل على Environment Variables، **لازم عملية Redeploy يدوية** — من تبويب **Deployments**، آخر Deployment، الثلاث نقط (⋯) → **Redeploy**. المتغيرات الجديدة **ما بتتفعّلش تلقائي** على الـ Deployment اللي كان موجود قبل التعديل.

---

## 7) المشاكل اللي حصلت والحلول (بالترتيب الزمني)

### مشكلة 1: `TypeError: Cannot read properties of undefined (reading 'set')`
**السبب:** أول نسخة من الصفحة كانت بتستخدم `window.storage` (خاصية متاحة بس جوّا بيئة معاينة الـ Artifacts في Claude)، وده مش موجود لما الصفحة اتفتحت كملف HTML عادي أو اتنشرت على دومين خارجي.
**الحل:** استبدلنا التخزين بالكامل بنظام Backend حقيقي (Vercel Serverless Function + Supabase)، بدل الاعتماد على أي API خاص ببيئة معينة.

### مشكلة 2: Syntax Error بسبب كود قديم متبقي
**السبب:** أثناء التعديلات المتتالية على السكريبت، فضل جزء من كود قديم (`} catch (err) {...}` من غير `try` يقابله) داخل ملف `index.html`، وده كسر الـ `<script>` بالكامل من غير ما يظهر أي خطأ واضح للمستخدم وقت التصفح العادي.
**الحل:** إعادة كتابة السكريبت بالكامل من الأول بشكل نضيف، ومراجعة الملف سطر بسطر للتأكد من عدم وجود بقايا كود قديم.

### مشكلة 3: `Failed to parse URL from undefined/rest/v1/leads`
**السبب:** `process.env.SUPABASE_URL` كان `undefined` وقت التنفيذ على Vercel Production، لأن المتغيّر كان متسجّل على بيئة **Preview** بس (مش Production).
**الحل:** عدّلنا إعدادات المتغيّر في Vercel وأضفنا **Production** كبيئة مفعّلة له، وعملنا **Redeploy**.

### مشكلة 4: رابط مشوّه — `.../auth/v1/.well-known/jwks.json/rest/v1/leads`
**السبب:** قيمة `SUPABASE_URL` نفسها كانت متلخبطة (فيها نص زيادة ملزوق من قيمة تانية، غالباً نتيجة نسخ أكتر من سطر مع بعض من صفحة الإعدادات في Supabase).
**التشخيص:** لاحظناه من قراءة **Vercel Logs** بعناية، تحديداً قسم "External APIs" اللي بيوضح الرابط الفعلي اللي اتبعت لـ Supabase.
**الحل:** مسح القيمة بالكامل وإعادة كتابتها يدوياً بدقة (`https://ctpmlnoeauimrzalhgcy.supabase.co` من غير أي نص زيادة أو `/` في الآخر).

### مشكلة 5: تسجيل الرقم بنجاح لكن رقم واتساب شخصي مكشوف في الكود
**السبب:** التصميم الأول كان بيعتمد على رابط `wa.me/<رقم شخصي مكتوب في الكود>` عشان يفتح واتساب برسالة جاهزة. أي كود Frontend مرئي بالكامل لأي حد يعمل "View Page Source"، فالرقم الشخصي كان هيبقى مكشوف للعالم كله.
**الحل:** إزالة أي اعتماد على رقم واتساب في كود العميل (Client-side) نهائياً. التسجيل بقى بيروح مباشرة لقاعدة البيانات عن طريق الـ Backend الآمن، والتواصل مع المسجّلين بقى بيحصل يدوياً من موبايل صاحبة المشروع بعد مراجعة جدول `leads`.

### مشكلة 6: تسجيلات مكررة بنفس التوقيت بالظبط (Race Condition)
**السبب:** ظهرت صفوف مكررة في الجدول بنفس الاسم والرقم ونفس التوقيت لآخر مللي ثانية — دليل على إن نفس طلب التسجيل اتبعت مرتين في نفس اللحظة برمجياً (سببها الأرجح: كود `<script>` مكرر في نسخة سابقة من الملف، فكل ضغطة زرار كانت بتفعّل الحدث مرتين).
**التشخيص:** لاحظنا تطابق `created_at` لآخر مللي ثانية بين الصفين، وده مستحيل يحصل من ضغطتين يدويتين منفصلتين من إنسان حقيقي.
**الحل (طبقتين):**
1. تأكدنا من نظافة ملف `index.html` (سكريبت واحد بس، Event Listener واحد بس).
2. أضفنا **Partial Unique Index** على مستوى قاعدة البيانات (مذكور في القسم 5.5)، عشان حتى لو حصل سباق توقيت تاني لأي سبب، Postgres نفسه يرفض الإدراج الثاني.
3. عدّلنا `lead.js` عشان يلتقط خطأ `23505` (كود تعارض Postgres) ويحوّله لرسالة واضحة للمستخدم (409) بدل خطأ 500 عام.

### مشكلة 7: صفوف الاستبيان بتظهر كصف منفصل بدل تحديث الصف الأصلي
**السبب:** التصميم الأول كان بيبعت إجابات الاستبيان كصف جديد كامل (`POST` عادي) بدل ما يحدّث الصف الأصلي، فكل شخص كان بيظهر مرتين في الجدول (مرة كـ `lead` ومرة كـ `survey`) بنفس بياناته الأساسية.
**الحل:** غيّرنا منطق `lead.js` عشان لو `type === "survey"`، يعمل **PATCH** (تحديث) على الصف الأصلي بدل **POST** (إدراج) صف جديد، باستخدام رقم التليفون كمعرّف للصف المطلوب تحديثه.

### مشكلة 8: رسائل خطأ عامة مش بتوضح السبب الحقيقي
**السبب:** رسالة واحدة ثابتة كانت بتظهر سواء الحقل فاضي تماماً أو مكتوب بس غلط، وده مش بيوضح للمستخدم إيه بالظبط المطلوب يعمله.
**الحل:** فصلنا منطق التحقق لدالتين منفصلتين (`getNameErrorMessage`, `getPhoneErrorMessage`) بترجع رسالة مختلفة حسب السبب الدقيق (فاضي / قصير جداً / صيغة غلط)، وزوّدنا شوية في المسافة بين الحقل ورسالة الخطأ لتحسين القراءة البصرية.

---

## 8) شرح أوامر Git وGitHub المستخدمة

Git هو نظام لتتبع التغييرات في الكود عبر الوقت (Version Control)، وGitHub هو المكان اللي بنخزّن فيه نسخة من المشروع أونلاين، وVercel بيراقب الـ Repository ده وبينشر أي تعديل جديد تلقائياً.

### `git add <ملف>`
```bash
git add .gitignore
```
بيضيف الملف لمنطقة التحضير (**Staging Area**) — يعني "أنا عايز الملف ده يدخل جوه الـ Commit الجاي". مبيسجّلش أي تغيير دائم لسه، بس بيحضّره.

### `git commit -m "الرسالة"`
```bash
git commit -m "chore: add gitignore"
```
بياخد كل حاجة في الـ Staging Area ويعمل منها **لقطة (Snapshot)** دائمة في تاريخ المشروع، مع رسالة (`-m`) بتوصف إيه اللي اتغيّر وليه. البادئة `chore:` هنا جزء من اصطلاح تسمية شائع (Conventional Commits) بيدل على إن التعديل ده صيانة/إعداد مش ميزة جديدة أو إصلاح خطأ (زي `feat:` أو `fix:`).

### `git push`
```bash
git push
```
بيرفع كل الـ Commits المحلية (اللي عملتها على جهازك) لسيرفر GitHub البعيد (Remote)، عشان النسخة الأونلاين تتحدّث. Vercel بيراقب الـ Repository ده، فمجرد ما الـ `push` ينجح، Vercel بيبدأ عملية نشر (Deployment) جديدة تلقائياً.

### `git ls-files | Select-String -Pattern "^\.env|\.env\."`
```powershell
git ls-files | Select-String -Pattern "^\.env|\.env\."
```
- `git ls-files` بيسرد **كل الملفات اللي Git بيتتبعها فعلياً** (يعني اللي داخلة في الـ Repository، مش كل ملفات المجلد).
- `Select-String` هو أمر بحث بالـ Regular Expression في PowerShell (بديل الـ `grep` في Windows).
- الأمر ده استُخدم كـ **فحص أمان يدوي**: للتأكد إن مفيش ملف زي `.env` أو `.env.local` اتسجّل بالغلط جوه Git وبالتالي اتنشر على GitHub. النتيجة الفارغة (مفيش أي سطر رجع) كانت تأكيد إن مفيش تسريب.

### محتوى `.gitignore` وليه ضفناه
```
.env
.env.local
.env.development
.env.production
.env.test

node_modules/
.vercel/
```
ملف `.gitignore` بيقول لـ Git "تجاهل الملفات دي تماماً، متتبعهاش خالص، حتى لو حد عمل `git add .`". أضفناه كـ **إجراء وقائي مستقبلي**، مش لإصلاح مشكلة موجودة فعلاً (كنا اتأكدنا قبلها إن مفيش تسريب حالي). الفايدة: لو حد اضطر بعدين يشتغل بمتغيّرات بيئة محلية (`.env`) على جهازه، الملف مش هيتسجّل بالغلط في Git من الأساس.

---

## 9) قائمة المراجعة الأمنية النهائية (Security Checklist)

- ✅ `SUPABASE_SECRET_KEY` غير موجود في أي كود Frontend (`index.html`).
- ✅ القيمة الفعلية للـ Secret غير مكتوبة في أي ملف داخل المشروع.
- ✅ غير موجودة في تاريخ Git (Git History) — تم التحقق يدوياً.
- ✅ ملف `.env` غير مرفوع على GitHub.
- ✅ تمت إضافة `.gitignore` لحماية مستقبلية.
- ✅ الـ Secret موجود فقط في Vercel Environment Variables (بيئة Production).
- ✅ الـ Frontend يتواصل مع `/api/lead` فقط، ولا يتواصل مع Supabase مباشرة أبداً.
- ✅ الـ API (`lead.js`) هو الوحيد المصرّح له بالتواصل مع Supabase.
- ✅ الفورم تم اختباره فعلياً ووصلت البيانات بنجاح لقاعدة البيانات.
- ✅ رقم واتساب شخصي غير مكشوف في أي مكان بالكود.
- ✅ حماية من التسجيل المكرر على مستويين (تطبيقي + قاعدة بيانات).

---

## 10) الخطوة الأخيرة: مشاركة الرابط مع العيادات

**الرابط النهائي:** `https://dental-landing-chi.vercel.app/#signup`
(الجزء `#signup` بيوصّل الزائر مباشرة لمنطقة التسجيل في الصفحة).

**رسالة التواصل المقترحة مع العيادات:**
> السلام عليكم دكتور/دكتورة، أنا حنان، وبنشتغل حاليًا على أداة بسيطة تساعد عيادات الأسنان في متابعة خطط العلاج المعلقة مع المرضى وتقليل الحالات اللي بتضيع بسبب عدم المتابعة. بنعمل حاليًا مرحلة بسيطة لفهم احتياجات العيادات قبل إطلاق المنتج، وحابّة أعرف رأيك وتجربتك في الموضوع. لو مهتم/ة، ممكن تسجل/ي اهتمامك من هنا: [الرابط]. التسجيل لا يتطلب أي التزام أو دفع.

**قاعدة أساسية للصدق في مرحلة الـ Product Discovery:** الرسالة والصفحة بيوضحوا بصراحة إن المنتج **لسه في مرحلة البناء وجمع الاهتمام**، مش منتج جاهز وشغال بالكامل (زي WhatsApp Automation فعلي). ده أكثر احترافية، وبيحافظ على مصداقية أي تواصل تاني مع نفس العيادات لو المشروع كمل فعلاً.