# DATABASE

## معماری لایه داده

```
UI / Server Actions / Route Handlers
        │  (فقط اینترفیس‌ها)
        ▼
src/server/repositories/types.ts   ← قرارداد داده (UserRepository, ProgressRepository, AuditRepository)
        │
        ├── src/server/repositories/sqlite.ts        ← درایور زنده (dev/preview)
        │       Drizzle ORM + better-sqlite3
        │       فایل: data/codenova.db (خودکار ساخته/مهاجرت/seed می‌شود)
        │
        └── prisma/reference/prisma-repositories.ts  ← مسیر تولید (MySQL)
                Prisma ORM 7 + @prisma/adapter-mariadb
                راهنمای فعال‌سازی: prisma/README.md
```

هیچ کد UI/اکشنی مستقیم به درایور وابسته نیست؛ سوئیچ SQLite→MySQL فقط
`getRepositories()` را عوض می‌کند.

## مدل‌ها (هر دو اسکیما ۱:۱ معادل‌اند)

`users`, `user_roles`, `courses`, `lessons`, `exercises`, `enrollments`,
`lesson_progress`, `submissions`, `quiz_attempts`, `audit_logs`

- اسکیمای زنده (SQLite): `src/db/schema.ts` — مهاجرت SQL در `drizzle/`
  (با `npx drizzle-kit generate` تولید می‌شود؛ در `src/db/client.ts`
  هنگام اولین دسترسی اجرا می‌گردد).
- اسکیمای تولید (MySQL): `prisma/schema.prisma` (۱۰ مدل کامل با FK/ایندکس/unique).

## اصول

- ایمیل یکتا؛ رمز فقط به‌صورت هش bcrypt (cost=10) ذخیره می‌شود.
- کلیدهای پیشرفت روی **slug** پایدار (courseSlug/lessonSlug) — با تغییر
  محتوای درس‌ها، پیشرفت کاربران نمی‌شکند.
- seed محتوا خودکار و idempotent است (upsert بر اساس slug) — منبع حقیقت
  محتوا `src/content` است.
- ثبت‌نام در `audit_logs` ثبت می‌شود.
- `enrollment` خودکار هنگام اولین پیشرفت در هر دوره.

## محیط‌ها

| متغیر | کاربرد | مقدار پیش‌فرض |
|---|---|---|
| `DB_FILE` | مسیر فایل SQLite | `./data/codenova.db` |
| `DATABASE_URL` | فقط Prisma CLI / مسیر MySQL | — |
| `AUTH_SECRET` | امضای JWT نشست‌ها (الزامی) | — |

`.env` هرگز commit نمی‌شود؛ الگو در `.env.example`.

## وضعیت فعلی

- ✅ SQLite زنده: auth، پیشرفت درس/تمرین، sync مهمان→کاربر، داشبورد محافظت‌شده.
- ⏳ MySQL/Prisma: schema + پیاده‌سازی مرجع + راهنما commit شده؛ به‌دلیل
  مسدود بودن `binaries.prisma.sh` و نبود سرور MySQL در sandbox، روی ماشین
  خودتان فعال می‌شود (prisma/README.md).
