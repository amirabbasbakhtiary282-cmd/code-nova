# ARCHITECTURE

## Stack
- Next.js App Router
- TypeScript
- Tailwind CSS v4
- framer-motion
- Monaco Editor
- Three.js (+ react-three/fiber, drei) برای Hero دسکتاپ

## تصمیمات v2
- Hero ترکیبی: CSS 3D همه دستگاه‌ها + Three.js دسکتاپ با dynamic import و fallback
- لایه پیشرفت در `src/features/progress` با API قابل‌تعویض (فعلاً localStorage)
- Lab واقعی در `/lab` با iframe sandbox و telemetry سبک خطا/کنسول

## لایه‌ها
- `src/app`: routeها و صفحات
- `src/components`: UI و layout و marketing blocks
- `src/features/progress`: storage + hooks + types
- `src/content`: داده mock type-safe

## آینده
در فاز بعدی، backend امن برای اجرای کد، auth واقعی، و persistence سمت سرور اضافه می‌شود.
