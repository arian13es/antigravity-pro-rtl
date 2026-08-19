# Smart RTL Patcher (Pro UI) 🚀

A powerful, universal Right-to-Left (RTL) and UI patcher for Electron-based IDEs and editors (like VS Code, Cursor, etc.). 
This tool seamlessly injects a high-performance, native-feeling RTL layout engine and a Pro Settings Widget directly into the target app.

[Read in Persian / راهنمای فارسی](#راهنمای-فارسی-persian-documentation)

## ✨ Key Features
* **Zero-Delay RTL Engine**: Utilizes an optimized `MutationObserver` mapped to screen refresh rates (`requestAnimationFrame`) to instantly align text without any visual flickering or delay.
* **Pro UI Settings Widget**: Injects a modern floating menu inside the IDE, allowing you to change fonts, font sizes, line heights, and RTL toggles on the fly.
* **Custom Font Injection**: Safely embeds custom fonts like `Vazirmatn`, `IRANSans`, `Shabnam`, and local OS fonts directly into the editor's secure webviews.
* **Universal Compatibility**: Dynamically unpacks and repacks Electron `app.asar` files, safely injecting the payload into the core execution flow.

## ⚙️ Installation & Usage
Clone the repository and run the patcher using Node.js:
```bash
git clone https://github.com/arian13es/smart-rtl-patcher.git
cd smart-rtl-patcher
npm install
node bin/index.js
```
*(To restore your app to its original factory state, simply run `node bin/index.js --restore`)*

## 🤝 Acknowledgements
This project was heavily rebuilt, modernized, and expanded into a Universal Injector with a highly optimized Pro UI. However, the foundational idea and original concept were inspired by the open-source repository [mmnaderi/antigravity-rtl](https://github.com/mmnaderi/antigravity-rtl). 

---

# راهنمای فارسی (Persian Documentation) 🇮🇷

پچر هوشمند **Smart RTL** یک ابزار قدرتمند برای تزریق و فعال‌سازیِ بی‌نقص قابلیت راست‌چین (RTL) همراه با یک پنل تنظیماتِ پیشرفته در ادیتورهای مبتنی بر Electron (مثل VS Code و Cursor) است.

## ✨ ویژگی‌های کلیدی
* **موتور RTL بدون پرش**: استفاده از `MutationObserver` فوق‌بهینه و همگام با `requestAnimationFrame` که باعث می‌شود متونِ پیام‌ها در کمتر از ۱۶ میلی‌ثانیه (بدون هیچ پرش یا تأخیر بصری) در جهت درست قرار بگیرند.
* **پنل تنظیمات پیشرفته (Pro UI)**: اضافه‌شدنِ یک ویجت حرفه‌ای و شناور در داخل محیط ادیتور که به شما اجازه می‌دهد در لحظه، فونت‌های فارسی و انگلیسی، سایز خطوط، ارتفاع متن و حالت RTL را تغییر دهید.
* **تزریق امن فونت**: دور زدنِ محدودیت‌های امنیتی (CSP) برای اجرای مستقیم فونت‌های محبوب مانند `Vazirmatn`، `IRANSans` و فونت‌های نصب‌شده روی سیستمِ شما درون محیط بستهٔ ادیتور.
* **معماری کاملاً خودکار**: باز کردن پکیج‌های `.asar` برنامه‌ها، تزریق کدهای جاوااسکریپت به صورت امن، و بسته‌بندیِ مجدد برنامه به صورت کاملاً اتوماتیک با یک دستور.

## ⚙️ نصب و راه‌اندازی
ابتدا سورس‌کد را کلون کرده و سپس با استفاده از Node.js آن را اجرا کنید:
```bash
git clone https://github.com/arian13es/smart-rtl-patcher.git
cd smart-rtl-patcher
npm install
node bin/index.js
```
*(برای بازگردانی برنامه به حالت اولیه کارخانه، از سوییچ `node bin/index.js --restore` استفاده کنید)*

## 🤝 قدردانی
معماری این ابزار، پنل‌های رابط کاربری و موتورهای تزریق آن به صورت اختصاصی برای این نسخه بازنویسی و مدرن شده‌اند، اما ایدهٔ اولیه و کانسپت اصلیِ این پروژه با الهام از ریپوزیتوریِ متن‌بازِ [mmnaderi/antigravity-rtl](https://github.com/mmnaderi/antigravity-rtl) شکل گرفته است.
