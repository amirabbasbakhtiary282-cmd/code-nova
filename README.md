# CodeNova (کدنوا) — Frontend Phase v2

بازسازی فاز فرانت با تمرکز بر تجربه تعاملی، انیمیشن سبک، Hero سه‌بعدی ترکیبی و آزمایشگاه کد واقعی.

## اجرا

### پیش‌نیاز
- Node.js LTS
- npm

### نصب و توسعه
```bash
npm install
npm run dev
```

اپ روی `http://localhost:3000` اجرا می‌شود.

### بیلد تولید
```bash
npm run build
```

## قابلیت‌های پیاده‌سازی‌شده در v2
- تم تیره عمیق + accent سبز/بنفش + glow محدود
- انیمیشن‌های پایه با `framer-motion`
- Hero ترکیبی:
  - CSS 3D برای همه دستگاه‌ها
  - لایه Three.js فقط دسکتاپ (dynamic import + fallback)
- پیش‌نمایش زنده کد در Hero
- سیستم پیشرفت واقعی (localStorage) در:
  - صفحه دوره
  - صفحه درس
  - داشبورد
  - صفحه تمرین‌ها
- آزمایشگاه `/lab`:
  - Monaco Editor
  - اجرای HTML/CSS/JS در iframe
  - دریافت Runtime error و console.log با postMessage
  - ذخیره خودکار کد
  - بارگذاری starter code از تمرین‌ها
- نوار پیشرفت اسکرول سراسری

## خارج از محدوده (عمداً انجام نشده)
- احراز هویت واقعی
- دیتابیس واقعی و Prisma/MySQL migration
- پنل ادمین
- AI tutor
- پرداخت و اشتراک
- داوری خودکار تمرین‌ها

## ساختار کلیدی
- `src/components/marketing` : Hero و اجزای صفحه اصلی
- `src/features/progress` : لایه پیشرفت قابل‌تعویض (فعلاً localStorage)
- `src/app/lab` : آزمایشگاه اجرایی
- `src/components/ui` : اجزای reusable + motion helpers

## هشدار امنیتی
sandbox iframe برای آموزش و دمو مناسب است، اما برای اجرای کد نامطمئن در محیط واقعی کافی نیست.
