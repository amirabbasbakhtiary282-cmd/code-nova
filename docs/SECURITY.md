# SECURITY

## احراز هویت

- NextAuth (Auth.js) v5 با Credentials provider و session استراتژی JWT.
- رمز عبور با `bcryptjs` (cost=10) هش می‌شود؛ هرگز خام ذخیره/لاگ نمی‌شود.
- `AUTH_SECRET` از محیط خوانده می‌شود (`openssl rand -base64 32`)؛
  هیچ کلید محرمانه‌ای در مخزن commit نشده است (`.env` در `.gitignore`).
- محافظت مسیرها در `src/proxy.ts` (Next 16 proxy): مسیرهای `/dashboard` و
  `/profile` بدون نشست معتبر به `/login?callbackUrl=...` ریدایرکت می‌شوند.
  proxy از کانفیگ edge-safe (`src/auth.config.ts`) استفاده می‌کند و به DB
  دسترسی ندارد.
- اعتبارسنجی ورودی ثبت‌نام سمت سرور (`src/server/services/auth-service.ts`):
  ایمیل یکتا، حداقل طول رمز، نرمال‌سازی.
- نقش‌ها در `user_roles` سمت سرور نگهداری می‌شوند؛ هر بررسی نقش باید در
  لایه service/repository انجام شود، نه UI.

## API

- همه endpointهای پیشرفت (`/api/progress*`) نشست را سمت سرور بررسی می‌کنند
  و برای مهمان 401 می‌دهند.
- snapshot ارسالی کلاینت قبل از merge کاملاً sanitize می‌شود
  (`src/server/services/progress-validation.ts`): فقط slugهای معتبر،
  فرمت ISO تاریخ، سقف تعداد روزها.
- Server Actionها و REST routeها هر دو از یک لایه منطق مشترک استفاده می‌کنند.

## آزمایشگاه کد

- اجرای کد در iframe با `sandbox="allow-scripts"` (بدون `allow-same-origin`
  → origin متفاوت و بدون دسترسی به کوکی/storage والد).
- تله‌متری خطا/کنسول فقط با `postMessage` و فیلتر `source === 'codenova-lab'`.
- escape کردن `</script>` و `</style>` در ساخت srcDoc.

## هشدار مهم (بدون تغییر)

sandbox iframe برای آموزش/دمو مناسب است ولی برای اجرای کد کاملاً نامطمئن
کافی نیست. برای production با کاربران واقعی: runner ایزوله (container/process
sandboxing، محدودیت منابع، کنترل شبکه) در فاز بعدی لازم است.

## نکات تکمیلی

- RTL سراسری؛ نواحی کد LTR.
- localStorage فقط پیشرفت و draft کد را نگه می‌دارد (بدون داده حساس).
- رمزها/توکن‌ها هرگز به کلاینت ارسال نمی‌شوند؛ session فقط شامل id/نام/ایمیل است.
