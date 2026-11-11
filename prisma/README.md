# Prisma + MySQL — مسیر تولید (Production Path)

## چرا این فایل‌ها در sandbox فعال نیستند؟

محیط sandbox/preview که این مخزن در آن توسعه یافته:

1. **سرور MySQL/MariaDB ندارد** (apt/docker مسدود است).
2. **`binaries.prisma.sh` مسدود است** — Prisma CLI برای `generate`/`migrate`
   باید engine دانلود کند، بنابراین `prisma generate` اینجا اجرا نمی‌شود و
   کد مبتنی بر کلاینت تولیدشده حتی typecheck نمی‌شود.

به همین دلیل اپ به‌صورت زنده روی **SQLite (better-sqlite3 + Drizzle)** اجرا
می‌شود (`src/db/*`) — یک دیتابیس واقعی با مهاجرت و seed خودکار — و لایه
داده پشت **اینترفیس repository** (`src/server/repositories/types.ts`) قرار
دارد تا سوئیچ به Prisma/MySQL هیچ تغییری در UI/اکشن‌ها/روت‌ها ایجاد نکند.

## مدل‌ها

`prisma/schema.prisma` هر ۱۰ مدل اسپک را دارد و ۱:۱ با اسکیمای SQLite
معادل است:

`User`, `UserRole`, `Course`, `Lesson`, `Exercise`, `Enrollment`,
`LessonProgress`, `Submission`, `QuizAttempt`, `AuditLog`

## فعال‌سازی روی ماشین خودتان (شبکه باز + MySQL)

```bash
# 0) پیش‌نیاز: یک سرور MySQL در حال اجرا
#    DATABASE_URL="mysql://user:pass@localhost:3306/codenova" را در .env بگذارید

# 1) وابستگی‌ها (prisma@7.10.1 پین شده؛ @prisma/client و adapter-mariadb نصب‌اند)
npm install

# 2) ساخت جداول + تولید کلاینت در generated/prisma
npx prisma migrate dev --name init

# 3) کپی پیاده‌سازی مرجع به لایه repository
cp prisma/reference/prisma-repositories.ts src/server/repositories/prisma.ts
#    imports را به alias "@/..." تغییر دهید:
#      ../../generated/prisma/client.js  ->  @/../generated/prisma/client.js (یا مسیر نسبی دلخواه)
#      ../../src/lib/dates               ->  @/lib/dates
#      ../../src/server/repositories/types -> @/server/repositories/types

# 4) سوئیچ کارخانه repository
#    در src/server/repositories/index.ts:
#      import { createPrismaRepositories } from "./prisma";
#      globalForRepos.__codenovaRepos = createPrismaRepositories();

# 5) seed محتوای دوره‌ها (اختیاری — فقط اگر می‌خواهید محتوا در MySQL باشد)
cp prisma/reference/prisma-seed.ts prisma/seed.ts
npx tsx prisma/seed.ts
```

## نسخه‌ها

- `prisma@7.10.1` (devDependency — پین شده؛ `prisma@latest` فعلاً 8.0-rc است
  و CLI کاملاً متفاوتی دارد)
- `@prisma/client@7.10.1` + `@prisma/adapter-mariadb@7.10.1`
- ژنراتور `prisma-client` با خروجی `generated/` (gitignore شده) طبق
  Quickstart رسمی Prisma 7 برای MySQL.

## امنیت

- رمزها با `bcryptjs` (cost=10) هش می‌شوند — مستقل از درایور DB.
- `AUTH_SECRET` لازم است (`openssl rand -base64 32`). هیچ کلیدی در مخزن
  commit نمی‌شود؛ `.env` در `.gitignore` است.
- نقش‌ها در `user_roles` سمت سرور نگهداری می‌شوند؛ بررسی نقش ادمین باید
  همیشه سمت سرور (repository + service) انجام شود، نه فقط UI.
