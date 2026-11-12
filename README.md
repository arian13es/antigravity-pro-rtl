# Antigravity Pro RTL Patcher 🚀

A powerful, universal Right-to-Left (RTL) and UI patcher explicitly designed for the **Antigravity ecosystem** (Antigravity IDE, Standard Antigravity App) AND the official **Google Gemini Desktop App**. 
This tool seamlessly injects a high-performance, native-feeling RTL layout engine and a Pro Settings Widget directly into the applications.

[Read in Persian / راهنمای فارسی](#راهنمای-فارسی-persian-documentation)

## ✨ Key Features
* **Zero-Delay RTL Engine**: Utilizes an optimized `MutationObserver` mapped to screen refresh rates (`requestAnimationFrame`) to instantly align text without any visual flickering or delay.
* **Pro UI Settings Widget**: Injects a modern floating menu inside Antigravity and Gemini, allowing you to change fonts, font sizes, line heights, and RTL toggles on the fly.
* **Custom Font Injection**: Safely embeds custom fonts like `Vazirmatn`, `IRANSans`, `Shabnam`, and local OS fonts directly into the editor's secure webviews without breaking native English fonts and numbers (`unicode-range` optimized).
* **Universal Compatibility**: Dynamically unpacks and repacks `.asar` packages for Antigravity and the Google Gemini Desktop App, safely injecting the payload into the core execution flow.

## ⚙️ Installation & Usage
You can install this tool globally directly from GitHub without manually downloading the source code:
```bash
npm install -g arian13es/antigravity-pro-rtl
```
Once installed, simply run the following command anywhere in your terminal:
```bash
antigravity-rtl
```
*(To restore applications to their original factory state, run `antigravity-rtl --restore`)*

### Linux

The patcher looks for Antigravity and Antigravity IDE in common system and user locations and follows launchers on `PATH`. For an extracted tarball or a custom installation, pass the installation directory, its `resources` directory, or the patch target directly.

```bash
antigravity-rtl --path "/path/to/antigravity"
antigravity-rtl --restore --path "/path/to/antigravity"
```

Snap installations are detected but their files are mounted read-only, even with `sudo`. To apply the patch, use a writable installation such as the [official Linux tarball](https://antigravity.google/download).

## 🤝 Acknowledgements
This project was heavily rebuilt, modernized, and expanded into a Universal Injector with a highly optimized Pro UI exclusively for the Antigravity ecosystem. The foundational concept and initial injection logic were inspired by the open-source repository [mmnaderi/antigravity-rtl](https://github.com/mmnaderi/antigravity-rtl). 

---

# راهنمای فارسی (Persian Documentation) 🇮🇷

پچر هوشمند **Antigravity Pro RTL** یک ابزار قدرتمند اختصاصی برای اکوسیستم **Antigravity** (نسخه استاندارد و نسخه IDE) و همچنین **اپلیکیشن رسمی دسکتاپ Google Gemini** است که قابلیت راست‌چین (RTL) بی‌نقص و یک پنل تنظیمات پیشرفته را به هستهٔ این نرم‌افزارها تزریق می‌کند.

## ✨ ویژگی‌های کلیدی
* **موتور RTL بدون پرش**: استفاده از `MutationObserver` فوق‌بهینه و همگام با `requestAnimationFrame` که باعث می‌شود متون در کمتر از ۱۶ میلی‌ثانیه (بدون هیچ پرش یا تأخیر بصری) در جهت درست قرار بگیرند.
* **پنل تنظیمات پیشرفته (Pro UI)**: اضافه‌شدنِ یک ویجت حرفه‌ای و شناور در داخل محیط برنامه‌ها که به شما اجازه می‌دهد در لحظه، فونت‌های فارسی و انگلیسی، سایز خطوط، ارتفاع متن و حالت RTL را تغییر دهید.
* **تزریق امن فونت**: دور زدنِ محدودیت‌های امنیتی (CSP) برای اجرای مستقیم فونت‌های محبوب مانند `Vazirmatn`، `IRANSans` و غیره. (با استفاده از تکنیک `unicode-range` فونت و اعداد انگلیسی دست‌نخورده باقی می‌مانند).
* **معماری کاملاً خودکار**: شناسایی خودکار نسخه‌های نصب‌شدهٔ آنتی‌گراویتی و Google Gemini، باز کردن پکیج‌های `.asar`، تزریق کدهای جاوااسکریپت و بسته‌بندیِ مجدد برنامه‌ها به صورت کاملاً اتوماتیک با یک دستور.

## ⚙️ نصب و راه‌اندازی
شما می‌توانید این ابزار را به صورت یک دستورِ سراسری (Global) مستقیماً از گیت‌هاب روی سیستم خود نصب کنید (بدون نیاز به دانلود پوشه):
```bash
npm install -g arian13es/antigravity-pro-rtl
```
پس از نصب، پچر را با دستور زیر اجرا کنید:
```bash
antigravity-rtl
```
*(برای بازگردانی برنامه‌ها به حالت اولیه کارخانه، از دستور `antigravity-rtl --restore` استفاده کنید)*

### لینوکس

پچر مسیرهای رایج سیستمی و کاربری را می‌گردد و لانچرهای موجود در `PATH` را دنبال می‌کند. برای نسخهٔ استخراج‌شده از tarball یا نصب در مسیر سفارشی، مسیر پوشهٔ نصب، پوشهٔ `resources` یا خودِ هدف پچ را بدهید.

```bash
antigravity-rtl --path "/path/to/antigravity"
antigravity-rtl --restore --path "/path/to/antigravity"
```

نصب Snap شناسایی می‌شود، اما فایل‌هایش حتی با `sudo` فقط‌خواندنی‌اند. برای اجرای پچ از یک نصب قابل‌نوشتن مثل [tarball رسمی لینوکس](https://antigravity.google/download) استفاده کنید.

## 🤝 قدردانی
معماری این ابزار، پنل‌های رابط کاربری و موتورهای تزریق آن به صورت اختصاصی برای این نسخه بازنویسی و مدرن شده‌اند، اما ایدهٔ اولیه و کانسپت اصلیِ این پروژه با الهام از ریپوزیتوریِ متن‌بازِ [mmnaderi/antigravity-rtl](https://github.com/mmnaderi/antigravity-rtl) شکل گرفته است.
