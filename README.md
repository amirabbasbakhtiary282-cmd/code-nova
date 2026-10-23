# CodeNova (کدنوا)

پلتفرم فارسی یادگیری برنامه‌نویسی: درس قدم‌به‌قدم + آزمایشگاه کد زنده + پیشرفت پایدار.

## اجرا

### پیش‌نیاز
- Node.js LTS (≥20)
- npm

### نصب و توسعه
```bash
npm install          # predev/prebuild به‌طور خودکار فونت‌های محلی را کپی می‌کنند
cp .env.example .env # سپس AUTH_SECRET را با `openssl rand -base64 32` پر کن
npm run dev
```

اپ روی `http://localhost:3000` اجرا می‌شود.

### دیتابیس
- **زنده (dev/preview):** SQLite با `better-sqlite3` + Drizzle ORM.
  فایل `data/codenova.db` در اولین دسترسی خودکار ساخته، مهاجرت
  (`drizzle/0000_init.sql`) و از `src/content` seed می‌شود. چیزی برای
  پیکربندی دستی وجود ندارد.
- **تولید (MySQL):** اسکیمای کامل Prisma 7 در `prisma/schema.prisma` +
  پیاده‌سازی مرجع repository در `prisma/reference/` + راهنمای سوئیچ در
  `prisma/README.md`. لایه داده پشت اینترفیس
  `src/server/repositories/types.ts` است، پس سوئیچ درایور هیچ تغییری در
  UI ایجاد نمی‌کند.

### احراز هویت
NextAuth (Auth.js) v5 — Credentials provider با هش `bcryptjs` و session
JWT. صفحات `/login` و `/register` واقعی‌اند؛ ثبت‌نام از
`POST /api/register` و ورود از endpoint استاندارد NextAuth انجام می‌شود.
`/dashboard` و `/profile` توسط `src/proxy.ts` محافظت می‌شوند (مهمان →
redirect به login). کاربران مهمان بدون حساب هم می‌توانند یاد بگیرند —
پیشرفتشان در localStorage می‌ماند و بعد از ثبت‌نام/ورود به‌صورت خودکار
با دیتابیس merge می‌شود.

### بیلد تولید
```bash
npm run build   # کاملاً آفلاین: فونت‌ها محلی‌اند (بدون fonts.googleapis.com)
```

## قابلیت‌ها
- تم تیره + accent سبز/بنفش + glass/glow/grain
- انیمیشن با `framer-motion` (reveal، stagger، شمارنده، scroll progress)
- سیستم پیشرفت local-first با sync سمت سرور برای کاربران لاگین‌شده:
  صفحه دوره، صفحه درس، داشبورد، تمرین‌ها
- آزمایشگاه `/lab`: Monaco، حالت‌های HTML/CSS/JS/HTML+CSS، اجرای زنده با
  debounce + دکمه اجرای فوری، کنسول و خطاهای runtime از iframe با
  postMessage، ذخیره خودکار draft، حالت تمرین با starter code و بررسی ساده
- streak روزهای پیوسته با تاریخ محلی (بدون باگ UTC)

## خارج از محدوده (عمداً)
- پرداخت/اشتراک واقعی (pricing فعلاً mock خواهد بود)
- پنل ادمین، AI tutor، داوری خودکار پیشرفته تمرین‌ها
- runner ایزوله برای اجرای کد نامطمئن (هشدار در docs/SECURITY.md)

## ساختار کلیدی
- `src/app`: routeها (marketing، auth، learn، lab، dashboard، api)
- `src/components`: UI، layout، learning
- `src/features/progress`: store کلاینت + hooks + server actions + sync
- `src/server`: repositories، services (لایه منطق سمت سرور)
- `src/db`: schema/client/seed زنده (SQLite)
- `src/content`: منبع حقیقت دوره‌ها/درس‌ها/تمرین‌ها (type-safe)
- `prisma/`: مسیر تولید MySQL (schema + مرجع + راهنما)
- `docs/`: ARCHITECTURE, DATABASE, SECURITY, PRODUCT, ROADMAP

## تست‌های انجام‌شده
- `tsc --noEmit`، `eslint`، `next build` (همه سبز، آفلاین)
- E2E با curl: ثبت‌نام → ورود → تکمیل درس/تمرین → sync مهمان → خروج →
  ورود مجدد → پیشرفت پایدار در DB
- jsdom: جریان کامل progress hooks (بدون حلقه بی‌نهایت)، تاب‌آوری در قطعی سرور

## هشدار امنیتی
sandbox iframe برای آموزش و دمو مناسب است، اما برای اجرای کد نامطمئن در
محیط واقعی کافی نیست (docs/SECURITY.md).
