# DATABASE

این فاز عمداً بدون اتصال دیتابیس واقعی پیاده‌سازی شده است.

## مدل هدف (آتی)
`users`, `courses`, `lessons`, `exercises`, `exercise_tests`, `submissions`, `enrollments`, `lesson_progress`, `quiz_attempts`, `user_roles`, `audit_logs`.

## اصول
- ایمیل یکتا
- Foreign key و ایندکس مناسب
- استفاده از slug/id پایدار برای مسیرها
- جداسازی داده نمونه از داده واقعی
- نگهداری محدود داده حساس

## وضعیت فعلی
- داده‌ها در `src/content` به‌صورت mock ذخیره شده‌اند.
- فایل `src/lib/db.ts` فقط placeholder است.
