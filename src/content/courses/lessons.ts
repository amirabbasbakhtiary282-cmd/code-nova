import type { Lesson } from "@/types";

export const lessonsByCourse: Record<string, Lesson[]> = {
  "html-basics": [
    {
      id: "html-1",
      courseSlug: "html-basics",
      slug: "what-is-html",
      title: "HTML چیست و چطور کار می‌کند",
      order: 1,
      durationMinutes: 14,
      content:
        "HTML زبان نشانه‌گذاری وب است؛ یعنی به مرورگر می‌گوید هر بخش صفحه چه معنایی دارد. مرورگر این نشانه‌ها را می‌خواند و به شکل دیداری رندر می‌کند. وقتی تگ‌ها درست انتخاب شوند، صفحه هم برای کاربر و هم برای موتور جستجو قابل‌فهم‌تر می‌شود.\n\nHTML به‌تنهایی ظاهر پیچیده نمی‌سازد؛ نقش اصلی‌اش ساختاردهی است. مثلاً با تگ عنوان، پاراگراف، لیست و لینک می‌توان یک صفحه منظم و خوانا ساخت. اگر ساختار HTML خوب باشد، افزودن CSS و JavaScript بسیار ساده‌تر می‌شود.\n\nمرورگر فایل HTML را از بالا به پایین می‌خواند. هر تگ باز و بسته باید درست باشد تا ساختار DOM سالم بماند. در این درس هدف تو این است که مفهوم «ساختار» را از «ظاهر» جدا درک کنی.",
      codeExample: {
        language: "html",
        code: "<h1>اولین صفحه من</h1>\n<p>این متن با HTML ساخته شده است.</p>",
        outputPreview: "<h1>اولین صفحه من</h1><p>این متن با HTML ساخته شده است.</p>",
      },
      keyPoints: ["HTML ساختار محتوا را تعریف می‌کند.", "مرورگر تگ‌ها را به DOM تبدیل می‌کند.", "بدون ساختار درست، توسعه CSS/JS دشوار می‌شود."],
      exercise: {
        title: "معرفی خودت",
        description: "یک عنوان و یک پاراگراف درباره خودت بنویس.",
        starterCode: "<h1></h1>\n<p></p>",
        expectedHint: "خروجی باید یک h1 و یک p قابل‌خواندن داشته باشد.",
      },
    },
    {
      id: "html-2",
      courseSlug: "html-basics",
      slug: "html-document-structure",
      title: "ساختار یک صفحه HTML",
      order: 2,
      durationMinutes: 16,
      content:
        "هر فایل HTML استاندارد با `<!doctype html>` شروع می‌شود تا مرورگر حالت استاندارد را فعال کند. سپس تگ `html` کل سند را دربر می‌گیرد و معمولاً ویژگی `lang` روی آن تنظیم می‌شود. این موضوع برای دسترس‌پذیری و سئو اهمیت دارد.\n\nدرون `head` اطلاعاتی مثل عنوان صفحه، charset و meta viewport قرار می‌گیرد. این بخش مستقیم در بدنه صفحه دیده نمی‌شود اما برای رفتار صحیح صفحه حیاتی است. برای مثال، نبود meta viewport نمایش موبایل را خراب می‌کند.\n\nتگ `body` شامل محتوای قابل‌مشاهده است. هر چیزی که کاربر می‌بیند، مثل متن، تصویر، دکمه و فرم، در body قرار می‌گیرد. اگر از همین ابتدا ساختار سند را درست بنویسی، در پروژه‌های بزرگ کمتر دچار خطا می‌شوی.",
      codeExample: {
        language: "html",
        code: "<!doctype html>\n<html lang='fa'>\n  <head>\n    <meta charset='UTF-8' />\n    <meta name='viewport' content='width=device-width, initial-scale=1.0' />\n    <title>نمونه ساختار</title>\n  </head>\n  <body>\n    <h1>سلام</h1>\n  </body>\n</html>",
      },
      keyPoints: ["doctype برای حالت استاندارد ضروری است.", "اطلاعات فنی صفحه در head قرار می‌گیرد.", "محتوای قابل‌مشاهده باید داخل body باشد."],
      exercise: {
        title: "اسکلت کامل سند",
        description: "یک سند HTML کامل با head و body بساز و عنوان صفحه را تنظیم کن.",
        starterCode: "<!doctype html>\n<html lang='fa'>\n<head>\n</head>\n<body>\n</body>\n</html>",
        expectedHint: "وجود title و meta viewport را بررسی کن.",
      },
    },
    {
      id: "html-3",
      courseSlug: "html-basics",
      slug: "text-tags",
      title: "تگ‌های متن: h1-h6, p, strong, em",
      order: 3,
      durationMinutes: 13,
      content:
        "تیترها (`h1` تا `h6`) ساختار منطقی متن را مشخص می‌کنند. بهتر است در هر صفحه یک `h1` اصلی داشته باشی و بخش‌های بعدی را با h2 و h3 مرتب کنی. این کار خوانایی را بالا می‌برد و به سئو هم کمک می‌کند.\n\nبرای متن معمولی از `p` استفاده می‌شود. تگ `strong` برای تأکید مهم و `em` برای تأکید معنایی نرم‌تر کاربرد دارد. استفاده درست از این تگ‌ها فقط ظاهری نیست و به معنی متن هم جهت می‌دهد.\n\nاشتباه رایج این است که فقط برای درشت شدن متن از تیتر یا strong استفاده شود. اولویت باید معنای محتوا باشد و ظاهر را با CSS کنترل کنی. این تفکیک در پروژه‌های حرفه‌ای بسیار مهم است.",
      codeExample: {
        language: "html",
        code: "<h1>راهنمای شروع</h1>\n<h2>بخش اول</h2>\n<p>یادگیری <strong>پیوسته</strong> از حفظ کردن بهتر است.</p>\n<p>امروز روی <em>پایه‌ها</em> تمرکز می‌کنیم.</p>",
      },
      keyPoints: ["تیترها سلسله‌مراتب محتوا را مشخص می‌کنند.", "strong و em معنای متن را تغییر می‌دهند.", "ظاهر را با CSS کنترل کن، نه با سوءاستفاده از تگ معنایی."],
      exercise: {
        title: "خبر کوتاه",
        description: "یک خبر کوتاه با h1، یک h2 و دو پاراگراف بساز و در یکی از پاراگراف‌ها strong استفاده کن.",
        starterCode: "<h1></h1>\n<h2></h2>\n<p></p>\n<p></p>",
        expectedHint: "حداقل یک strong داخل پاراگراف‌ها وجود داشته باشد.",
      },
    },
    {
      id: "html-4",
      courseSlug: "html-basics",
      slug: "links-and-images",
      title: "لینک‌ها و تصاویر",
      order: 4,
      durationMinutes: 15,
      content:
        "با تگ `a` می‌توانی کاربر را به صفحه دیگر هدایت کنی. ویژگی `href` مقصد لینک را مشخص می‌کند و اگر خالی یا اشتباه باشد، لینک عملاً کار نمی‌کند. برای لینک خارجی، معمولاً `target='_blank'` و `rel='noopener'` توصیه می‌شود.\n\nتگ `img` برای نمایش تصویر استفاده می‌شود. ویژگی `src` مسیر تصویر و `alt` توضیح متنی آن است. alt برای دسترس‌پذیری بسیار مهم است و در شرایطی که تصویر لود نشود، به کاربر کمک می‌کند.\n\nبهتر است اندازه تصویر را با CSS مدیریت کنی تا صفحه در موبایل بهم نریزد. همچنین نام فایل‌ها و متن alt را واضح انتخاب کن تا تجربه کاربری بهتر شود.",
      codeExample: {
        language: "html",
        code: "<a href='https://developer.mozilla.org' target='_blank' rel='noopener'>مرجع وب</a>\n<img src='https://picsum.photos/220/120' alt='تصویر نمونه' />",
      },
      keyPoints: ["لینک با href تعریف می‌شود.", "alt تصویر برای دسترس‌پذیری ضروری است.", "برای لینک خارجی از rel مناسب استفاده کن."],
      exercise: {
        title: "کارت لینک و تصویر",
        description: "یک لینک به سایت دلخواهت و یک تصویر با alt مناسب اضافه کن.",
        starterCode: "<a href=''></a>\n<img src='' alt='' />",
        expectedHint: "وجود href معتبر و alt غیرخالی بررسی شود.",
      },
    },
    {
      id: "html-5",
      courseSlug: "html-basics",
      slug: "lists",
      title: "لیست‌ها: ul, ol, dl",
      order: 5,
      durationMinutes: 12,
      content:
        "لیست بدون ترتیب (`ul`) برای مواردی مناسب است که ترتیب اهمیتی ندارد. هر آیتم با `li` تعریف می‌شود. این ساختار برای منوها، امکانات و فهرست ویژگی‌ها کاربرد زیادی دارد.\n\nلیست مرتب (`ol`) زمانی استفاده می‌شود که ترتیب مهم است، مثل مراحل نصب یا فرآیند انجام کار. شماره‌گذاری خودکار باعث می‌شود کاربر روند را راحت‌تر دنبال کند.\n\n`dl` برای فهرست تعریف‌ها به‌کار می‌رود و از `dt` (عنوان) و `dd` (توضیح) تشکیل می‌شود. این نوع لیست برای واژه‌نامه‌ها یا توضیح اصطلاحات فنی بسیار مفید است.",
      codeExample: {
        language: "html",
        code: "<ul>\n  <li>HTML</li>\n  <li>CSS</li>\n</ul>\n<ol>\n  <li>ثبت‌نام</li>\n  <li>شروع دوره</li>\n</ol>\n<dl>\n  <dt>DOM</dt>\n  <dd>درخت عناصر صفحه</dd>\n</dl>",
      },
      keyPoints: ["ul برای موارد بدون ترتیب است.", "ol برای مراحل ترتیبی کاربرد دارد.", "dl برای تعریف اصطلاحات مناسب است."],
      exercise: {
        title: "لیست برنامه هفتگی",
        description: "یک ul از کارهای روزانه و یک ol از مراحل یادگیری بساز.",
        starterCode: "<ul>\n  <li></li>\n</ul>\n<ol>\n  <li></li>\n</ol>",
        expectedHint: "هر دو نوع لیست باید حداقل دو آیتم داشته باشند.",
      },
    },
    {
      id: "html-6",
      courseSlug: "html-basics",
      slug: "tables",
      title: "جدول‌ها",
      order: 6,
      durationMinutes: 14,
      content:
        "جدول برای نمایش داده‌های جدولی استفاده می‌شود، نه برای چیدمان کل صفحه. ساختار اصلی شامل `table`, `tr`, `th`, `td` است. سطرها با tr و سلول‌ها با td ساخته می‌شوند.\n\nاستفاده از `th` برای ستون‌های عنوانی باعث می‌شود داده‌ها خواناتر شوند. در جدول‌های حرفه‌ای، می‌توان از `thead`, `tbody` و `caption` هم استفاده کرد تا ساختار معنایی بهتر شود.\n\nاگر داده کم است، جدول مناسب است؛ اما برای محتوای متنی طولانی بهتر است از ساختارهای دیگر استفاده کنی. همچنین در موبایل باید به اسکرول افقی جدول توجه داشته باشی.",
      codeExample: {
        language: "html",
        code: "<table border='1'>\n  <tr><th>درس</th><th>زمان</th></tr>\n  <tr><td>HTML</td><td>45 دقیقه</td></tr>\n  <tr><td>CSS</td><td>50 دقیقه</td></tr>\n</table>",
      },
      keyPoints: ["جدول برای داده‌های جدولی است.", "th برای سربرگ ستون‌ها استفاده می‌شود.", "برای ساختار بهتر از thead/tbody کمک بگیر."],
      exercise: {
        title: "جدول برنامه مطالعه",
        description: "یک جدول سه‌ستونه برای برنامه مطالعه هفتگی بساز.",
        starterCode: "<table>\n  <tr></tr>\n</table>",
        expectedHint: "حداقل یک ردیف header و دو ردیف داده داشته باشد.",
      },
    },
    {
      id: "html-7",
      courseSlug: "html-basics",
      slug: "forms",
      title: "فرم‌ها: input, label, button",
      order: 7,
      durationMinutes: 17,
      content:
        "فرم‌ها راه اصلی گرفتن داده از کاربر هستند. تگ `form` مجموعه فیلدها را نگه می‌دارد و `input` ورودی‌ها را می‌سازد. هر ورودی باید نوع مناسب داشته باشد تا تجربه کاربر بهتر شود.\n\nتگ `label` باید با `for` به `id` ورودی وصل شود. این اتصال هم دسترس‌پذیری را بالا می‌برد و هم باعث می‌شود با کلیک روی برچسب، فیلد فعال شود. استفاده از placeholder به‌تنهایی جای label را نمی‌گیرد.\n\nدکمه `button` معمولاً برای ارسال فرم استفاده می‌شود. اگر نوع دکمه (`type`) را مشخص نکنی، رفتار پیش‌فرض ممکن است در فرم‌ها باعث ارسال ناخواسته شود.",
      codeExample: {
        language: "html",
        code: "<form>\n  <label for='name'>نام:</label>\n  <input id='name' type='text' />\n  <label for='email'>ایمیل:</label>\n  <input id='email' type='email' />\n  <button type='submit'>ارسال</button>\n</form>",
      },
      keyPoints: ["هر input بهتر است label داشته باشد.", "نوع input را درست انتخاب کن.", "type دکمه را شفاف تعیین کن."],
      exercise: {
        title: "فرم ثبت‌نام ساده",
        description: "یک فرم با نام، ایمیل و دکمه ارسال بساز.",
        starterCode: "<form>\n  \n</form>",
        expectedHint: "وجود input نوع email و حداقل یک label بررسی شود.",
      },
    },
    {
      id: "html-8",
      courseSlug: "html-basics",
      slug: "semantic-tags",
      title: "تگ‌های معنایی: header, nav, main, footer, section",
      order: 8,
      durationMinutes: 15,
      content:
        "تگ‌های معنایی به مرورگر و ابزارهای کمکی کمک می‌کنند ساختار صفحه را بهتر بفهمند. مثلاً `header` برای سربرگ، `nav` برای ناوبری و `main` برای محتوای اصلی است. این تگ‌ها جایگزین divهای بی‌معنی می‌شوند.\n\nدر صفحات چندبخشی، `section` برای گروه‌بندی منطقی محتوا عالی است. `footer` هم معمولاً اطلاعات انتهایی مثل کپی‌رایت یا لینک‌های کمکی را نگه می‌دارد. استفاده صحیح از این تگ‌ها تجربه خواندن را بهتر می‌کند.\n\nسئو و دسترس‌پذیری در پروژه‌های واقعی اهمیت زیادی دارد. اگر ساختار معنایی درست باشد، توسعه تیمی و نگهداری کد هم ساده‌تر می‌شود.",
      codeExample: {
        language: "html",
        code: "<header>لوگو و عنوان</header>\n<nav>منو</nav>\n<main>\n  <section>محتوای درس</section>\n</main>\n<footer>© CodeNova</footer>",
      },
      keyPoints: ["تگ معنایی خوانایی ساختار را بالا می‌برد.", "main باید محتوای اصلی را نگه دارد.", "section برای گروه‌بندی موضوعی مناسب است."],
      exercise: {
        title: "اسکلت معنایی صفحه",
        description: "یک صفحه با header/nav/main/section/footer بساز.",
        starterCode: "<header></header>\n<nav></nav>\n<main>\n  <section></section>\n</main>\n<footer></footer>",
        expectedHint: "همه تگ‌های معنایی موردنیاز باید حضور داشته باشند.",
      },
    },
  ],
  "css-fundamentals": [
    {
      id: "css-1",
      courseSlug: "css-fundamentals",
      slug: "what-is-css",
      title: "CSS چیست و چطور به HTML وصل می‌شود",
      order: 1,
      durationMinutes: 13,
      content:
        "CSS زبان استایل‌دهی صفحات وب است و ظاهر عناصر HTML را کنترل می‌کند. رنگ، فاصله، سایز، چیدمان و حتی انیمیشن با CSS تعریف می‌شود. بدون CSS، صفحات وب اغلب ساده و خام دیده می‌شوند.\n\nCSS را می‌توان به سه روش استفاده کرد: inline، داخلی و خارجی. در پروژه واقعی بهترین روش فایل خارجی است چون نگهداری و توسعه را ساده می‌کند. این روش به reuse کد هم کمک زیادی می‌کند.\n\nمرورگر ابتدا HTML را می‌خواند و سپس قوانین CSS را اعمال می‌کند. اگر چند قانون روی یک عنصر اثر بگذارند، قانون specificity و ترتیب نوشتن تصمیم می‌گیرد کدام اعمال شود.",
      codeExample: {
        language: "css",
        code: "h1 {\n  color: #2563eb;\n}\n.card {\n  padding: 12px;\n  border: 1px solid #cbd5e1;\n}",
        outputPreview: "<h1 style='color:#2563eb'>سلام CSS</h1><div style='padding:12px;border:1px solid #cbd5e1'>کارت نمونه</div>",
      },
      keyPoints: ["CSS ظاهر را از ساختار جدا می‌کند.", "فایل خارجی بهترین روش مدیریت استایل است.", "specificity روی نتیجه نهایی اثر می‌گذارد."],
      exercise: {
        title: "رنگ دادن به تیتر",
        description: "رنگ تیتر صفحه را تغییر بده و برای یک کارت border اضافه کن.",
        starterCode: "h1 {\n  \n}\n.card {\n  \n}",
        expectedHint: "حداقل یک color و یک border در کد دیده شود.",
      },
    },
    {
      id: "css-2",
      courseSlug: "css-fundamentals",
      slug: "selectors",
      title: "انتخابگرها (selectors)",
      order: 2,
      durationMinutes: 14,
      content:
        "انتخابگر تعیین می‌کند کدام عنصر HTML استایل بگیرد. انتخابگر تگ (`p`)، کلاس (`.card`) و آیدی (`#header`) رایج‌ترین حالت‌ها هستند. انتخاب درست، کد CSS را خوانا و قابل‌توسعه نگه می‌دارد.\n\nدر پروژه‌های واقعی، کلاس معمولاً گزینه اصلی است چون قابل‌استفاده مجدد و منعطف است. آیدی باید محدود استفاده شود چون یکتا است و specificity بالایی دارد. استفاده بی‌رویه از آیدی مدیریت استایل را سخت می‌کند.\n\nهمچنین می‌توان از انتخابگرهای ترکیبی مثل `.card p` یا `nav a` استفاده کرد. این روش برای هدف‌گیری دقیق مفید است، اما زیاده‌روی در ترکیب انتخابگرها پیچیدگی ایجاد می‌کند.",
      codeExample: {
        language: "css",
        code: "p { color: #334155; }\n.card { background: #f8fafc; }\n#hero { border-radius: 12px; }\n.card p { font-weight: 600; }",
      },
      keyPoints: ["کلاس‌ها برای reuse مناسب‌ترند.", "آیدی specificity بالایی دارد.", "انتخابگر ترکیبی باید با دقت استفاده شود."],
      exercise: {
        title: "استایل‌دهی با کلاس",
        description: "برای `.profile-card` پس‌زمینه و برای متن داخل آن سایز فونت تعریف کن.",
        starterCode: ".profile-card {\n\n}\n.profile-card p {\n\n}",
        expectedHint: "حداقل background و font-size تعریف شود.",
      },
    },
    {
      id: "css-3",
      courseSlug: "css-fundamentals",
      slug: "color-background-text",
      title: "رنگ، پس‌زمینه و متن",
      order: 3,
      durationMinutes: 12,
      content:
        "ویژگی `color` رنگ متن را تعیین می‌کند و `background` یا `background-color` برای پس‌زمینه است. انتخاب رنگ باید با کنتراست مناسب انجام شود تا خوانایی حفظ شود. متن روشن روی پس‌زمینه روشن یا برعکس معمولاً تجربه بدی ایجاد می‌کند.\n\nبرای متن می‌توان ویژگی‌های دیگری مثل `font-size`, `font-weight`, `line-height` را هم تنظیم کرد. این ویژگی‌ها ظاهر محتوا را حرفه‌ای‌تر می‌کنند. فاصله خطوط مناسب برای فارسی اهمیت ویژه‌ای دارد.\n\nدر طراحی سیستماتیک، بهتر است از پالت محدود و تکرارپذیر استفاده کنی. پخش کردن رنگ‌های زیاد بدون منطق، UI را غیرحرفه‌ای می‌کند.",
      codeExample: {
        language: "css",
        code: "body {\n  background: #f1f5f9;\n  color: #0f172a;\n}\nh1 {\n  color: #7c3aed;\n}\np {\n  line-height: 1.8;\n}",
      },
      keyPoints: ["کنتراست رنگ برای خوانایی ضروری است.", "line-height مناسب متن فارسی را بهتر می‌کند.", "از پالت رنگ محدود و منظم استفاده کن."],
      exercise: {
        title: "تم کارت آموزشی",
        description: "برای یک کارت پس‌زمینه روشن و متن تیره با خوانایی مناسب تعریف کن.",
        starterCode: ".lesson-card {\n\n}\n.lesson-card p {\n\n}",
        expectedHint: "background-color و color باید به‌وضوح تنظیم شوند.",
      },
    },
    {
      id: "css-4",
      courseSlug: "css-fundamentals",
      slug: "box-model",
      title: "Box Model (margin, padding, border)",
      order: 4,
      durationMinutes: 15,
      content:
        "هر عنصر در CSS یک جعبه است. این جعبه شامل محتوا، padding، border و margin است. درک درست Box Model از پایه‌ای‌ترین مهارت‌های طراحی رابط است.\n\n`padding` فاصله داخلی محتوا تا لبه عنصر است و `margin` فاصله بیرونی عنصر با عناصر اطراف. `border` مرز عنصر را مشخص می‌کند. ترکیب این سه ویژگی روی اندازه و فاصله نهایی اثر مستقیم دارد.\n\nدر پروژه‌های واقعی معمولاً `box-sizing: border-box` استفاده می‌شود تا محاسبه عرض/ارتفاع ساده‌تر شود. این کار جلوی بسیاری از خطاهای چیدمان را می‌گیرد.",
      codeExample: {
        language: "css",
        code: "* { box-sizing: border-box; }\n.card {\n  padding: 16px;\n  margin: 12px;\n  border: 1px solid #cbd5e1;\n}",
      },
      keyPoints: ["هر عنصر یک box دارد.", "padding داخلی و margin بیرونی است.", "border-box مدیریت ابعاد را ساده می‌کند."],
      exercise: {
        title: "کارت با فاصله استاندارد",
        description: "برای کارت یک padding، margin و border تنظیم کن.",
        starterCode: ".card {\n\n}",
        expectedHint: "هر سه ویژگی margin/padding/border باید وجود داشته باشند.",
      },
    },
    {
      id: "css-5",
      courseSlug: "css-fundamentals",
      slug: "flexbox-layout",
      title: "چیدمان با Flexbox",
      order: 5,
      durationMinutes: 18,
      content:
        "Flexbox برای چیدمان یک‌بعدی (افقی یا عمودی) بسیار کاربردی است. با `display: flex`، کنترل دقیقی روی فاصله، ترازبندی و توزیع آیتم‌ها پیدا می‌کنی. این ابزار برای منو، هدر، کارت‌لیست و فرم‌ها عالی است.\n\nویژگی `justify-content` چینش روی محور اصلی و `align-items` ترازبندی روی محور عمودی را تنظیم می‌کند. با `gap` هم می‌توان فاصله یکنواخت بین آیتم‌ها ایجاد کرد.\n\nFlexbox برای responsive هم مناسب است. با `flex-wrap` می‌توان آیتم‌ها را در عرض کم به سطر بعدی برد تا layout در موبایل نشکند.",
      codeExample: {
        language: "css",
        code: ".row {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 12px;\n  flex-wrap: wrap;\n}",
      },
      keyPoints: ["Flexbox برای چیدمان یک‌بعدی مناسب است.", "justify-content و align-items کلیدی هستند.", "gap و wrap طراحی responsive را بهتر می‌کنند."],
      exercise: {
        title: "چیدمان منوی ساده",
        description: "یک نوار منو با Flex بساز که آیتم‌ها فاصله یکنواخت داشته باشند.",
        starterCode: ".menu {\n\n}",
        expectedHint: "display:flex و gap یا justify-content باید استفاده شود.",
      },
    },
    {
      id: "css-6",
      courseSlug: "css-fundamentals",
      slug: "grid-layout",
      title: "چیدمان با Grid",
      order: 6,
      durationMinutes: 17,
      content:
        "CSS Grid برای چیدمان دوبعدی طراحی شده است. برخلاف Flexbox که بیشتر یک‌بعدی است، در Grid می‌توان هم‌زمان ردیف و ستون را کنترل کرد. این ویژگی برای داشبوردها و گالری‌ها عالی است.\n\nبا `grid-template-columns` تعداد و عرض ستون‌ها را مشخص می‌کنی. واحد `fr` تقسیم فضای باقی‌مانده را ساده می‌کند. همچنین `gap` فاصله بین سلول‌ها را تنظیم می‌کند.\n\nترکیب Grid با media query می‌تواند layout را هوشمندانه responsive کند. در موبایل می‌توان تعداد ستون را کم کرد تا خوانایی حفظ شود.",
      codeExample: {
        language: "css",
        code: ".grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 16px;\n}",
      },
      keyPoints: ["Grid برای چیدمان دوبعدی ایده‌آل است.", "fr تقسیم فضای آزاد را آسان می‌کند.", "با media query می‌توان تعداد ستون‌ها را تغییر داد."],
      exercise: {
        title: "شبکه کارت‌ها",
        description: "یک grid سه‌ستونه با فاصله ۱۲px بساز.",
        starterCode: ".cards {\n\n}",
        expectedHint: "display:grid و grid-template-columns باید وجود داشته باشد.",
      },
    },
    {
      id: "css-7",
      courseSlug: "css-fundamentals",
      slug: "responsive-media-queries",
      title: "واکنش‌گرایی (media queries)",
      order: 7,
      durationMinutes: 16,
      content:
        "Responsive یعنی صفحه در اندازه‌های مختلف نمایشگر خوب دیده شود. media query به تو اجازه می‌دهد برای عرض‌های متفاوت قوانین CSS جدا بنویسی. این موضوع برای موبایل، تبلت و دسکتاپ حیاتی است.\n\nروش رایج، Mobile First است؛ یعنی ابتدا استایل موبایل و سپس در عرض‌های بزرگ‌تر override می‌کنی. این روش کد را ساده‌تر و منطقی‌تر نگه می‌دارد.\n\nدر طراحی واکنش‌گرا تنها تغییر اندازه کافی نیست؛ فاصله‌ها، سایز فونت و چیدمان هم باید متناسب شوند. همیشه با DevTools حالت‌های مختلف را تست کن.",
      codeExample: {
        language: "css",
        code: ".grid {\n  grid-template-columns: 1fr;\n}\n@media (min-width: 768px) {\n  .grid {\n    grid-template-columns: repeat(2, 1fr);\n  }\n}",
      },
      keyPoints: ["media query پایه responsive است.", "Mobile First نگهداری کد را آسان می‌کند.", "در breakpointها فاصله و تایپوگرافی را هم بازبینی کن."],
      exercise: {
        title: "دوستونه شدن در تبلت",
        description: "یک لیست کارت بساز که در موبایل یک ستون و در عرض 768px دو ستون شود.",
        starterCode: ".list {\n\n}\n@media (min-width: 768px) {\n\n}",
        expectedHint: "در media query باید grid/flex با چیدمان جدید تعریف شود.",
      },
    },
    {
      id: "css-8",
      courseSlug: "css-fundamentals",
      slug: "transitions-and-basic-animation",
      title: "ترنزیشن و انیمیشن ساده",
      order: 8,
      durationMinutes: 15,
      content:
        "Transition تغییر نرم بین دو وضعیت را ممکن می‌کند؛ مثلاً hover یک دکمه. با تعیین `transition-property`, `duration` و `timing-function` می‌توان تعامل روان‌تری ساخت.\n\nانیمیشن ساده با `@keyframes` قابل‌تعریف است. می‌توانی مثلاً opacity یا transform را از یک مقدار به مقدار دیگر ببری. انیمیشن باید هدف‌دار باشد و تجربه را بهتر کند، نه اینکه کاربر را گیج کند.\n\nبرای عملکرد بهتر، انیمیشن روی `transform` و `opacity` معمولاً بهینه‌تر است. زیاده‌روی در انیمیشن باعث کندی UI، به‌خصوص در موبایل ضعیف، می‌شود.",
      codeExample: {
        language: "css",
        code: ".btn {\n  transition: transform .2s ease, box-shadow .2s ease;\n}\n.btn:hover {\n  transform: translateY(-2px);\n}\n@keyframes fadeIn {\n  from { opacity: 0; }\n  to { opacity: 1; }\n}",
      },
      keyPoints: ["transition برای تغییرات تعاملی مناسب است.", "keyframes برای حرکت‌های مرحله‌ای استفاده می‌شود.", "انیمیشن را سبک و هدفمند نگه دار."],
      exercise: {
        title: "دکمه با hover نرم",
        description: "برای یک دکمه transition تعریف کن تا در hover کمی بالا بیاید.",
        starterCode: ".btn {\n\n}\n.btn:hover {\n\n}",
        expectedHint: "استفاده از transition و transform بررسی می‌شود.",
      },
    },
  ],
  "js-intro": [
    {
      id: "js-1",
      courseSlug: "js-intro",
      slug: "what-is-javascript",
      title: "JavaScript چیست",
      order: 1,
      durationMinutes: 12,
      content:
        "JavaScript زبان برنامه‌نویسی وب است که رفتار صفحه را پویا می‌کند. با آن می‌توان روی رویدادها واکنش نشان داد، داده پردازش کرد و تعامل ساخت. HTML ساختار و CSS ظاهر را می‌سازند، JavaScript منطق را اضافه می‌کند.\n\nاین زبان هم در مرورگر و هم در سرور (با Node.js) قابل‌استفاده است. در مسیر فرانت‌اند، تمرکز اصلی ما روی JavaScript مرورگر است. در این محیط می‌توان به DOM دسترسی داشت و عناصر صفحه را تغییر داد.\n\nدرک مفاهیم پایه JavaScript مثل متغیر، شرط، حلقه و تابع برای توسعه واقعی ضروری است. اگر این پایه‌ها را خوب یاد بگیری، رفتن به فریم‌ورک‌ها بسیار ساده‌تر می‌شود.",
      codeExample: {
        language: "javascript",
        code: "const userName = 'Sara';\nconsole.log('سلام ' + userName);",
      },
      keyPoints: ["JS مسئول رفتار و منطق صفحه است.", "JS در مرورگر و سرور قابل‌اجراست.", "پایه‌های JS پیش‌نیاز فریم‌ورک‌هاست."],
      exercise: {
        title: "اولین پیام",
        description: "یک متغیر نام تعریف کن و در console پیام خوش‌آمد چاپ کن.",
        starterCode: "const name = '';\n// پیام را چاپ کن",
        expectedHint: "از console.log برای نمایش پیام استفاده کن.",
      },
    },
    {
      id: "js-2",
      courseSlug: "js-intro",
      slug: "variables-and-types",
      title: "متغیرها و انواع داده",
      order: 2,
      durationMinutes: 15,
      content:
        "متغیر برای نگهداری داده استفاده می‌شود. در JavaScript معمولاً از `let` و `const` استفاده می‌کنیم. `const` برای مقدار ثابت و `let` برای مقداری است که ممکن است تغییر کند.\n\nانواع داده پایه شامل string، number، boolean، null و undefined هستند. شناخت نوع داده مهم است چون رفتار عملگرها و توابع به نوع داده وابسته است.\n\nاشتباه رایج این است که بدون فکر همه‌چیز را let بنویسی. اگر مقدار قرار نیست تغییر کند، استفاده از const کد را امن‌تر و خواناتر می‌کند.",
      codeExample: {
        language: "javascript",
        code: "const course = 'JavaScript';\nlet score = 18;\nconst passed = true;\nconsole.log(course, score, passed);",
      },
      keyPoints: ["const برای مقدار ثابت مناسب‌تر است.", "نوع داده بر رفتار کد اثر دارد.", "خوانایی کد با انتخاب درست let/const بالا می‌رود."],
      exercise: {
        title: "تعریف پروفایل",
        description: "سه متغیر برای نام، سن و وضعیت فعال بودن کاربر تعریف کن و چاپ کن.",
        starterCode: "const name = '';\nlet age = 0;\nconst isActive = false;",
        expectedHint: "یک string، یک number و یک boolean استفاده شود.",
      },
    },
    {
      id: "js-3",
      courseSlug: "js-intro",
      slug: "operators",
      title: "عملگرها",
      order: 3,
      durationMinutes: 14,
      content:
        "عملگرها برای انجام محاسبه و مقایسه استفاده می‌شوند. عملگرهای ریاضی مثل `+`, `-`, `*`, `/` و `%` برای محاسبات پایه کاربرد دارند. بدون شناخت عملگرها نوشتن منطق برنامه دشوار می‌شود.\n\nعملگرهای مقایسه‌ای مثل `===`, `!==`, `>`, `<` نتیجه true/false می‌دهند. در JavaScript بهتر است به‌جای `==` از `===` استفاده کنی تا تبدیل نوع ناخواسته رخ ندهد.\n\nعملگرهای منطقی `&&`, `||`, `!` برای ترکیب شرط‌ها استفاده می‌شوند. این عملگرها در اعتبارسنجی فرم، فیلتر داده و کنترل دسترسی کاربرد زیادی دارند.",
      codeExample: {
        language: "javascript",
        code: "const a = 10;\nconst b = 3;\nconsole.log(a + b);\nconsole.log(a % b);\nconsole.log(a === 10 && b < 5);",
      },
      keyPoints: ["از === برای مقایسه دقیق استفاده کن.", "عملگر منطقی برای ترکیب شرط‌ها ضروری است.", "% باقیمانده تقسیم را می‌دهد."],
      exercise: {
        title: "بررسی دسترسی",
        description: "شرطی بنویس که اگر سن بالای 18 و کاربر فعال بود، پیام «مجاز» چاپ شود.",
        starterCode: "const age = 20;\nconst isActive = true;\n",
        expectedHint: "از && و if استفاده شود.",
      },
    },
    {
      id: "js-4",
      courseSlug: "js-intro",
      slug: "if-else",
      title: "شرط‌ها (if/else)",
      order: 4,
      durationMinutes: 13,
      content:
        "ساختار if/else به برنامه اجازه می‌دهد تصمیم‌گیری کند. اگر شرط برقرار باشد، بلوک if اجرا می‌شود و در غیر این صورت else اجرا می‌شود. این مفهوم پایه اکثر منطق‌های واقعی است.\n\nمی‌توان چند شرط را با `else if` پشت‌سرهم بررسی کرد. ترتیب شرط‌ها مهم است؛ چون اولین شرط درست اجرا می‌شود و بقیه نادیده گرفته می‌شوند.\n\nشرط‌نویسی خوب باید ساده و واضح باشد. شرط‌های خیلی پیچیده را می‌توان با متغیر کمکی یا تابع کوچک ساده‌تر کرد.",
      codeExample: {
        language: "javascript",
        code: "const score = 74;\nif (score >= 90) {\n  console.log('عالی');\n} else if (score >= 60) {\n  console.log('قبول');\n} else {\n  console.log('نیاز به تمرین بیشتر');\n}",
      },
      keyPoints: ["if/else هسته تصمیم‌گیری است.", "ترتیب else if مهم است.", "شرط ساده = کد قابل‌نگهداری."],
      exercise: {
        title: "طبقه‌بندی نمره",
        description: "بر اساس نمره، یکی از پیام‌های عالی/خوب/نیاز به تلاش را چاپ کن.",
        starterCode: "const score = 55;\n",
        expectedHint: "حداقل یک else if نوشته شود.",
      },
    },
    {
      id: "js-5",
      courseSlug: "js-intro",
      slug: "loops",
      title: "حلقه‌ها (for/while)",
      order: 5,
      durationMinutes: 16,
      content:
        "حلقه‌ها برای تکرار عملیات استفاده می‌شوند. `for` وقتی مناسب است که تعداد تکرار مشخص باشد. این ساختار شامل مقدار اولیه، شرط ادامه و به‌روزرسانی است.\n\n`while` زمانی کاربرد دارد که شرط ادامه مهم‌تر از تعداد تکرار است. باید مراقب باشی شرط حلقه در نهایت false شود، وگرنه حلقه بی‌نهایت ایجاد می‌شود.\n\nدر کد واقعی حلقه‌ها برای پیمایش آرایه، تولید خروجی تکراری یا انجام محاسبه تجمعی استفاده می‌شوند. خوانایی حلقه را با نام‌گذاری مناسب متغیرها حفظ کن.",
      codeExample: {
        language: "javascript",
        code: "for (let i = 1; i <= 3; i++) {\n  console.log('مرحله', i);\n}\nlet n = 0;\nwhile (n < 2) {\n  console.log('while', n);\n  n++;\n}",
      },
      keyPoints: ["for برای تکرار شمارشی مناسب است.", "while نیازمند کنترل دقیق شرط خروج است.", "حلقه بی‌نهایت یک خطای رایج مبتدیان است."],
      exercise: {
        title: "چاپ اعداد زوج",
        description: "با حلقه for اعداد زوج 2 تا 10 را چاپ کن.",
        starterCode: "for (let i = 1; i <= 10; i++) {\n\n}",
        expectedHint: "از شرط یا گام 2 استفاده کن.",
      },
    },
    {
      id: "js-6",
      courseSlug: "js-intro",
      slug: "functions",
      title: "توابع",
      order: 6,
      durationMinutes: 17,
      content:
        "تابع یک بلوک reusable از کد است که می‌تواند ورودی بگیرد و خروجی بدهد. با تابع می‌توان تکرار کد را کم کرد و منطق را ماژولار نوشت. این موضوع برای پروژه‌های بزرگ حیاتی است.\n\nتوابع می‌توانند declaration یا arrow function باشند. هر دو کاربردی‌اند، اما درک تفاوت context و hoisting در مراحل بعد مهم می‌شود. فعلاً تمرکز روی تعریف درست ورودی و return است.\n\nتابع خوب یک کار مشخص انجام می‌دهد و نام واضحی دارد. اگر تابع خیلی طولانی شد، احتمالاً باید به چند تابع کوچک‌تر شکسته شود.",
      codeExample: {
        language: "javascript",
        code: "function sum(a, b) {\n  return a + b;\n}\nconst multiply = (a, b) => a * b;\nconsole.log(sum(2, 3));\nconsole.log(multiply(4, 5));",
      },
      keyPoints: ["تابع برای reuse و نظم کد ضروری است.", "ورودی و خروجی واضح بنویس.", "تابع کوتاه و تک‌مسئولیتی بهتر نگهداری می‌شود."],
      exercise: {
        title: "تابع محاسبه مالیات",
        description: "تابعی بنویس که قیمت را بگیرد و 9 درصد مالیات را اضافه کند.",
        starterCode: "function addTax(price) {\n  \n}",
        expectedHint: "خروجی تابع باید عدد نهایی باشد.",
      },
    },
    {
      id: "js-7",
      courseSlug: "js-intro",
      slug: "arrays",
      title: "آرایه‌ها",
      order: 7,
      durationMinutes: 15,
      content:
        "آرایه مجموعه‌ای از داده‌هاست که با اندیس قابل‌دسترسی است. اندیس از صفر شروع می‌شود، بنابراین اولین عنصر `arr[0]` است. آرایه‌ها برای نگهداری لیست‌ها بسیار کاربردی‌اند.\n\nمتدهایی مثل `push`, `pop`, `includes`, `map` برای کار با آرایه رایج‌اند. در شروع، بهتر است تفاوت تغییر مستقیم آرایه و ساخت آرایه جدید را هم درک کنی.\n\nدر رابط کاربری، اکثر داده‌ها به‌صورت آرایه مدیریت می‌شوند: لیست دوره‌ها، پیام‌ها، آیتم‌های منو و ... . بنابراین تسلط به آرایه یک مهارت کلیدی است.",
      codeExample: {
        language: "javascript",
        code: "const skills = ['HTML', 'CSS'];\nskills.push('JavaScript');\nconsole.log(skills[0]);\nconsole.log(skills.includes('CSS'));",
      },
      keyPoints: ["اندیس آرایه از صفر شروع می‌شود.", "push عنصر جدید به انتها اضافه می‌کند.", "آرایه‌ها پایه نمایش لیست در UI هستند."],
      exercise: {
        title: "لیست مهارت‌ها",
        description: "یک آرایه از سه مهارت بساز و با حلقه همه را چاپ کن.",
        starterCode: "const skills = [];\n",
        expectedHint: "حداقل سه مقدار در آرایه باشد.",
      },
    },
    {
      id: "js-8",
      courseSlug: "js-intro",
      slug: "objects",
      title: "آبجکت‌ها",
      order: 8,
      durationMinutes: 16,
      content:
        "آبجکت برای نگهداری داده‌های مرتبط به‌صورت کلید-مقدار استفاده می‌شود. مثلاً اطلاعات یک کاربر مثل نام، سن و ایمیل را می‌توان در یک آبجکت ذخیره کرد. این ساختار در JavaScript بسیار رایج است.\n\nبه ویژگی‌های آبجکت با نقطه (`user.name`) یا براکت (`user['name']`) دسترسی داری. اگر کلید پویا باشد، معمولاً براکت مناسب‌تر است.\n\nدر پروژه‌های واقعی، آبجکت‌ها با آرایه ترکیب می‌شوند تا داده‌های پیچیده ساخته شوند. درک درست آبجکت‌ها پیش‌نیاز کار با API و state management است.",
      codeExample: {
        language: "javascript",
        code: "const user = {\n  name: 'Ali',\n  age: 22,\n  isStudent: true,\n};\nconsole.log(user.name);\nuser.city = 'Tehran';\nconsole.log(user.city);",
      },
      keyPoints: ["آبجکت داده مرتبط را گروه‌بندی می‌کند.", "دسترسی با dot و bracket ممکن است.", "آبجکت پایه کار با API و داده ساخت‌یافته است."],
      exercise: {
        title: "پروفایل دانشجو",
        description: "یک آبجکت student بساز و نام و رشته او را چاپ کن.",
        starterCode: "const student = {\n  \n};",
        expectedHint: "حداقل دو کلید معنی‌دار تعریف شود.",
      },
    },
  ],
};

export interface LessonExerciseItem {
  id: string;
  courseSlug: string;
  lessonSlug: string;
  slug: string;
  title: string;
  description: string;
  language: "html" | "css" | "javascript";
  level: "beginner" | "intermediate" | "advanced";
  starterCode: string;
  expectedHint: string;
}

export const lessonExercises: LessonExerciseItem[] = Object.entries(lessonsByCourse).flatMap(([courseSlug, lessons]) =>
  lessons.map((lesson) => ({
    id: `${courseSlug}-${lesson.slug}-exercise`,
    courseSlug,
    lessonSlug: lesson.slug,
    slug: `${courseSlug}-${lesson.slug}`,
    title: lesson.exercise.title,
    description: lesson.exercise.description,
    language: lesson.codeExample.language,
    level: courseSlug === "js-intro" ? "intermediate" : "beginner",
    starterCode: lesson.exercise.starterCode,
    expectedHint: lesson.exercise.expectedHint,
  })),
);
