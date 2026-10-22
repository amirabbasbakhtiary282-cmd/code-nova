import type { Exercise } from "@/types";

export const exercises: Exercise[] = [
  {
    id: "legacy-e1",
    slug: "legacy-make-simple-card",
    title: "ساخت کارت معرفی (legacy)",
    description: "یک کارت ساده با عنوان، توضیح و دکمه با HTML/CSS بساز.",
    language: "html",
    level: "beginner",
    starterCode: "<div class='card'>\n  <h2>عنوان</h2>\n  <p>توضیح</p>\n  <button>مشاهده</button>\n</div>",
    expectedOutput: "کارت باید عنوان، توضیح و دکمه داشته باشد.",
  },
  {
    id: "legacy-e2",
    slug: "legacy-center-with-flex",
    title: "مرکزچین با Flex (legacy)",
    description: "یک باکس را در وسط صفحه با Flexbox مرکزچین کن.",
    language: "css",
    level: "beginner",
    starterCode: "body {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n}",
    expectedOutput: "باکس باید در مرکز صفحه قرار بگیرد.",
  },
  {
    id: "legacy-e3",
    slug: "legacy-sum-function",
    title: "تابع جمع (legacy)",
    description: "تابعی بنویس که دو عدد بگیرد و حاصل جمع را برگرداند.",
    language: "javascript",
    level: "intermediate",
    starterCode: "function sum(a, b) {\n  return a + b;\n}\nconsole.log(sum(2, 3));",
    expectedOutput: "عدد 5 باید در خروجی چاپ شود.",
  },
];
