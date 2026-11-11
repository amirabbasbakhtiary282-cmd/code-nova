# ARCHITECTURE

## Stack
- Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind CSS v4
- framer-motion (انیمیشن)، Monaco Editor (ادیتور کد)
- Drizzle ORM + better-sqlite3 (دیتابیس زنده dev/preview)
- NextAuth (Auth.js) v5 + bcryptjs (احراز هویت Credentials/JWT)
- Prisma ORM 7 + @prisma/adapter-mariadb (مسیر تولید MySQL — prisma/)
- فونت‌های محلی Vazirmatn/JetBrains Mono از @fontsource (بدون Google Fonts)

## تصمیمات کلیدی
- **لایه داده پشت اینترفیس repository**: UI/اکشن‌ها/روت‌ها فقط
  `src/server/repositories/types.ts` را می‌شناسند؛ درایور (SQLite امروز،
  Prisma/MySQL در تولید) پشت `getRepositories()` عوض می‌شود.
- **پیشرفت local-first**: مهمان‌ها روی localStorage؛ کاربران لاگین‌شده
  علاوه بر آن روی DB (Server Action + merge دوطرفه در ProgressSync).
  UI هر دو حالت یکسان است.
- **Snapshot cache در store کلاینت**: `useSyncExternalStore` نیاز به
  reference پایدار دارد؛ `getProgress` فقط وقتی raw string عوض شود
  دوباره parse می‌کند (ریشه رفع باگ کرش پیشرفت).
- **proxy به‌جای middleware** (قرارداد Next 16) با کانفیگ edge-safe جدا
  (`auth.config.ts`) تا better-sqlite3/bcryptjs وارد edge runtime نشوند.
- **بیلد کاملاً آفلاین**: فونت محلی، مهاجرت‌های SQL commit شده، seed خودکار.
- Hero سه‌بعدی Three.js حذف شد (کد مرده + وابستگی سنگین؛ طبق محدودیت
  «کتابخانه UI سنگین ممنوع»).

## لایه‌ها
- `src/app`: routeها (marketing / auth / learn / lab / dashboard / api)
- `src/components`: UI، layout، learning، providers
- `src/features/progress`: storage + hooks + types + actions + sync
- `src/server`: repositories (types/sqlite/index) + services (auth-service,
  progress-validation)
- `src/db`: schema (SQLite) + client (migrate خودکار) + seed (idempotent)
- `src/content`: منبع حقیقت محتوا (courses/lessons/exercises)
- `prisma/`: schema MySQL + reference implementation + README سوئیچ

## آینده
- گسترش محتوا به ۱۰ دوره/۸۰+ درس
- pass انیمیشن پیشرفته (parallax/sticky/tilt/reduced-motion/skeletons)
- صفحات جدید (pricing/about/blog/roadmap/faq/contact/profile/changelog)
- runner ایزوله کد + داوری تمرین + quiz engine
